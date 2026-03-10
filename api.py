#!/usr/bin/env python3
# api.py
"""
ScanLab Inference API

REST API for running inference with trained ScanLab medical imaging models.
Provides endpoints for single and batch prediction, model management,
and usage analytics for cost-benefit tracking.

Features:
- Single image prediction with Grad-CAM explainability
- Batch prediction for high-volume facilities (efficiency optimization)
- Usage analytics for ROI/cost-benefit analysis
- Ukrainian and English localization support

Author: Oleh Ivchenko
License: MIT
Version: 0.2.1
"""

import io
import os
import json
import base64
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple, List, cast
from collections import defaultdict

import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torchvision.transforms as T
import torchvision.models as models

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import matplotlib.pyplot as plt

# Optional DICOM support
try:
    import pydicom
except Exception:
    pydicom = None

# ---- Local config (same pattern as app.py) ----
try:
    import config
except Exception:
    class _Cfg:
        REGISTRY_DIR = "registry"
        IMAGE_SIZE = 224
        THRESHOLD = 0.5
        SEED = 42
        ANALYTICS_ENABLED = False
        ANALYTICS_LOG_PATH = "analytics.jsonl"
    config = _Cfg()

# ---- Analytics tracking for cost-benefit analysis ----
_analytics_cache: dict = defaultdict(int)
_api_start_time: float = __import__("time").time()

np.random.seed(getattr(config, "SEED", 42))
torch.manual_seed(getattr(config, "SEED", 42))

# =========================================================
# Utilities
# =========================================================

def ensure_dir(p: str | Path):
    Path(p).mkdir(parents=True, exist_ok=True)

def list_models(registry_dir: str) -> List[str]:
    ensure_dir(registry_dir)
    entries: List[str] = []
    for d in sorted(Path(registry_dir).glob("*")):
        if d.is_dir() and (d / "model.pt").exists() and (d / "config.json").exists():
            entries.append(d.name)
    return entries

def load_image(file_bytes: bytes, filename: str) -> Tuple[Image.Image, str]:
    # Detect DICOM by extension or magic
    name_lower = filename.lower()
    if name_lower.endswith(".dcm") and pydicom is not None:
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
        arr = ds.pixel_array.astype(np.float32)
        arr -= arr.min()
        if arr.max() > 0:
            arr /= arr.max()
        img = np.stack([arr, arr, arr], axis=-1)  # 3-channel
        img_pil = Image.fromarray((img * 255).astype(np.uint8))
        return img_pil, "dicom"
    else:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        return img, "rgb"

def build_model(backbone: str = "resnet18") -> Tuple[nn.Module, str]:
    if backbone == "resnet18":
        m = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        in_features = m.fc.in_features
        m.fc = nn.Linear(in_features, 1)
        return m, "layer4"
    else:
        raise ValueError(f"Unsupported backbone: {backbone}")

# -------- Minimal Grad-CAM --------
class _CamHook:
    def __init__(self, module: nn.Module):
        self.activations = None
        self.gradients = None
        self.fwd = module.register_forward_hook(self._fwd_hook)
        self.bwd = module.register_full_backward_hook(self._bwd_hook)

    def _fwd_hook(self, module, inp, out):
        self.activations = out.detach()

    def _bwd_hook(self, module, grad_in, grad_out):
        self.gradients = grad_out[0].detach()

    def close(self):
        self.fwd.remove()
        self.bwd.remove()

def compute_gradcam(model: nn.Module, x: torch.Tensor, target_layer: nn.Module):
    hook = _CamHook(target_layer)
    model.zero_grad(set_to_none=True)
    logits = model(x)           # [1,1]
    score = logits[0, 0]
    score.backward(retain_graph=True)

    acts = hook.activations    # [1,C,h,w]
    grads = hook.gradients     # [1,C,h,w]
    hook.close()

    if acts is None or grads is None:
        return None

    weights = grads.mean(dim=(2, 3), keepdim=True)    # [1,C,1,1]
    cam = (weights * acts).sum(dim=1, keepdim=False)  # [1,h,w] -> [h,w]
    cam = torch.relu(cam[0])
    cam -= cam.min()
    if cam.max() > 0:
        cam /= cam.max()
    cam_np = cam.detach().cpu().numpy()
    return cam_np

def overlay_cam_on_image(img_np_float: np.ndarray, cam: np.ndarray) -> np.ndarray:
    H, W, _ = img_np_float.shape
    cam_img = Image.fromarray((cam * 255).astype(np.uint8)).resize((W, H), Image.Resampling.BILINEAR)
    cam_resized = np.asarray(cam_img).astype(np.float32) / 255.0
    cmap = plt.get_cmap("jet")
    heatmap = cmap(cam_resized)[:, :, :3]  # drop alpha
    blended = (heatmap * 0.4 + img_np_float * 0.6)
    blended = np.clip(blended, 0, 1)
    out = (blended * 255).astype(np.uint8)
    return out

def pil_to_base64_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("ascii")

def np_to_base64_png(arr: np.ndarray) -> str:
    # Ensure uint8 image
    if arr.dtype != np.uint8:
        arr = np.clip(arr, 0, 255).astype(np.uint8)

    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")

    # Remove any accidental whitespace/newlines
    return b64.replace("\n", "").replace("\r", "")

# =========================================================
# Core inference
# =========================================================

def predict_with_cam(model_dir: Path, file_bytes: bytes, filename: str):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")

    cfg_path = model_dir / "config.json"
    if not cfg_path.exists():
        raise RuntimeError(f"No config.json found in {model_dir}")

    with open(cfg_path) as f:
        cfg = json.load(f)

    backbone = cfg.get("backbone", "resnet18")
    threshold = float(cfg.get("threshold", getattr(config, "THRESHOLD", 0.5)))

    model, last_block_name = build_model(backbone)
    sd = torch.load(model_dir / "model.pt", map_location="cpu")
    model.load_state_dict(sd)
    model.eval().to(device)

    target_layer: Optional[nn.Module] = None
    if last_block_name == "layer4" and hasattr(model, "layer4"):
        # Use the last block as the Grad-CAM target layer
        target_layer = cast(nn.Module, model.layer4[-1])  # type: ignore[attr-defined]

    img_pil, _ = load_image(file_bytes, filename)
    img_size = int(cfg.get("image_size", config.IMAGE_SIZE))
    orig = img_pil.copy().resize((img_size, img_size))
    orig_np = np.asarray(orig).astype(np.float32) / 255.0

    tf = T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]),
    ])
    x_tensor = cast(torch.Tensor, tf(img_pil))
    x = x_tensor.unsqueeze(0).to(device)

    x.requires_grad_(True)
    logits = model(x)
    prob = torch.sigmoid(logits).item()

    cam_overlay_b64: Optional[str] = None
    if target_layer is not None:
        cam = compute_gradcam(model, x, target_layer)
        if cam is not None:
            cam_img = overlay_cam_on_image(orig_np, cam)
            cam_overlay_b64 = np_to_base64_png(cam_img)

    decision = "Likely disease" if prob >= threshold else "Unlikely disease"
    return prob, threshold, decision, pil_to_base64_png(orig), cam_overlay_b64

# =========================================================
# FastAPI app & schemas /Users/olegivchenko/Yo/OpenSource/ScanLab/api.py
# =========================================================

class ModelInfo(BaseModel):
    name: str
    backbone: Optional[str] = None
    image_size: Optional[int] = None
    threshold: float
    created_at: Optional[str] = None

class PredictResponse(BaseModel):
    model: str
    probability: float
    threshold: float
    decision: str
    input_image_b64: Optional[str] = None
    cam_overlay_b64: Optional[str] = None

app = FastAPI(
    title="ScanLab Inference API",
    description=(
        "REST API for running inference with trained ScanLab models.\n\n"
        "- Upload JPG/PNG/BMP/TIFF/DICOM\n"
        "- Get probability of disease and Grad-CAM overlay\n\n"
        "Swagger UI available at `/docs`, OpenAPI JSON at `/openapi.json`."
    ),
    version="0.1.0",
    root_path="/scanlab-v1-api",
)

# CORS (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGISTRY_DIR = getattr(config, "REGISTRY_DIR", "registry")
ensure_dir(REGISTRY_DIR)

@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}

@app.get("/models", response_model=List[str], tags=["models"])
def get_models():
    models_list = list_models(REGISTRY_DIR)
    return models_list

@app.get("/models/{model_name}", response_model=ModelInfo, tags=["models"])
def get_model_info(model_name: str):
    model_dir = Path(REGISTRY_DIR) / model_name
    if not (model_dir / "model.pt").exists() or not (model_dir / "config.json").exists():
        raise HTTPException(status_code=404, detail="Model not found in registry")

    with open(model_dir / "config.json") as f:
        cfg = json.load(f)

    return ModelInfo(
        name=model_name,
        backbone=cfg.get("backbone"),
        image_size=cfg.get("image_size"),
        threshold=float(cfg.get("threshold", getattr(config, "THRESHOLD", 0.5))),
        created_at=cfg.get("created_at"),
    )

@app.post("/predict", response_model=PredictResponse, tags=["inference"])
async def predict(
    file: UploadFile = File(..., description="Scan image (JPG/PNG/BMP/TIFF/DICOM)"),
    model_name: str = Query(..., description="Name of model in registry"),
    include_images: bool = Query(
        True,
        description="If true, returns base64-encoded input image and Grad-CAM overlay.",
    ),
):
    models_list = list_models(REGISTRY_DIR)
    if model_name not in models_list:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' not found. Available: {models_list}",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    model_dir = Path(REGISTRY_DIR) / model_name
    filename = file.filename or "uploaded-scan"

    try:
        prob, threshold, decision, input_b64, cam_b64 = predict_with_cam(
            model_dir, file_bytes, filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    return PredictResponse(
        model=model_name,
        probability=float(prob),
        threshold=float(threshold),
        decision=decision,
        input_image_b64=input_b64 if include_images else None,
        cam_overlay_b64=cam_b64 if include_images else None,
    )

# =========================================================
# Batch Prediction Endpoint (for high-volume facilities)
# =========================================================

class BatchPredictItem(BaseModel):
    """Single item result in batch prediction response."""
    filename: str
    probability: float
    threshold: float
    decision: str
    decision_uk: str  # Ukrainian localization
    error: Optional[str] = None

class BatchPredictResponse(BaseModel):
    """Response model for batch prediction endpoint."""
    model: str
    total_files: int
    successful: int
    failed: int
    results: List[BatchPredictItem]
    processing_time_ms: float

@app.post("/predict/batch", response_model=BatchPredictResponse, tags=["inference"])
async def predict_batch(
    files: List[UploadFile] = File(..., description="Multiple scan images for batch analysis"),
    model_name: str = Query(..., description="Name of model in registry"),
):
    """
    Batch prediction endpoint for high-volume facilities.
    
    Processes multiple images in a single request for improved efficiency.
    Designed for Ukrainian hospital workflows with high imaging volumes
    (15,000+ studies annually) as recommended by cost-benefit analysis.
    
    Author: Oleh Ivchenko
    """
    import time
    start_time = time.time()
    
    models_list = list_models(REGISTRY_DIR)
    if model_name not in models_list:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' not found. Available: {models_list}",
        )
    
    model_dir = Path(REGISTRY_DIR) / model_name
    results: List[BatchPredictItem] = []
    successful = 0
    failed = 0
    
    # Ukrainian decision strings
    decision_map_uk = {
        "Likely disease": "Ймовірне захворювання",
        "Unlikely disease": "Захворювання малоймовірне"
    }
    
    for file in files:
        try:
            file_bytes = await file.read()
            if not file_bytes:
                results.append(BatchPredictItem(
                    filename=file.filename or "unknown",
                    probability=0.0,
                    threshold=0.5,
                    decision="Error",
                    decision_uk="Помилка",
                    error="Empty file"
                ))
                failed += 1
                continue
            
            prob, threshold, decision, _, _ = predict_with_cam(
                model_dir, file_bytes, file.filename or "uploaded-scan"
            )
            
            results.append(BatchPredictItem(
                filename=file.filename or "unknown",
                probability=float(prob),
                threshold=float(threshold),
                decision=decision,
                decision_uk=decision_map_uk.get(decision, decision)
            ))
            successful += 1
            
            # Track analytics
            if getattr(config, "ANALYTICS_ENABLED", False):
                _analytics_cache["total_predictions"] += 1
                _analytics_cache["batch_predictions"] += 1
                
        except Exception as e:
            results.append(BatchPredictItem(
                filename=file.filename or "unknown",
                probability=0.0,
                threshold=0.5,
                decision="Error",
                decision_uk="Помилка",
                error=str(e)
            ))
            failed += 1
    
    processing_time_ms = (time.time() - start_time) * 1000
    
    return BatchPredictResponse(
        model=model_name,
        total_files=len(files),
        successful=successful,
        failed=failed,
        results=results,
        processing_time_ms=round(processing_time_ms, 2)
    )


# =========================================================
# Analytics Endpoint (for cost-benefit tracking)
# =========================================================

class AnalyticsResponse(BaseModel):
    """Usage analytics for ROI and cost-benefit analysis."""
    total_predictions: int
    single_predictions: int
    batch_predictions: int
    models_in_registry: int
    uptime_info: str
    timestamp: str

@app.get("/analytics", response_model=AnalyticsResponse, tags=["system"])
def get_analytics():
    """
    Get usage analytics for cost-benefit tracking.
    
    Provides metrics useful for calculating ROI as described in
    'Cost-Benefit Analysis of Medical AI for Ukrainian Hospitals'.
    Tracks prediction counts to estimate workload offloading and
    efficiency gains.
    
    Author: Oleh Ivchenko
    """
    models_list = list_models(REGISTRY_DIR)
    
    total = _analytics_cache.get("total_predictions", 0)
    batch = _analytics_cache.get("batch_predictions", 0)
    
    return AnalyticsResponse(
        total_predictions=total,
        single_predictions=total - batch,
        batch_predictions=batch,
        models_in_registry=len(models_list),
        uptime_info=f"Running for {int((__import__('time').time() - _api_start_time) / 60)}m {int((__import__('time').time() - _api_start_time) % 60)}s since start",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


# =========================================================
# Localization Helper Endpoint
# =========================================================

@app.get("/localization/{lang}", tags=["system"])
def get_localization(lang: str = "uk"):
    """
    Get UI strings for specified language.
    
    Supports Ukrainian ('uk') and English ('en') for bilingual
    healthcare facility interfaces.
    
    Author: Oleh Ivchenko
    """
    try:
        from config import UI_STRINGS
        strings = UI_STRINGS.get(lang, UI_STRINGS.get("en", {}))
        return {"language": lang, "strings": strings}
    except ImportError:
        return {"language": lang, "strings": {}, "error": "Localization not configured"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=True,
    )
