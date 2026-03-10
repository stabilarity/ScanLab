#!/usr/bin/env python3
# app.py
import os
import io
import json
from datetime import datetime
from pathlib import Path
from typing import cast, Sized, Tuple, Optional, Iterable, Iterator
from xml.parsers.expat import model
from torch.utils.data import Subset

import numpy as np
from PIL import Image

import streamlit as st

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split, WeightedRandomSampler
import torchvision.transforms as T
import torchvision.models as models

from sklearn.metrics import roc_auc_score, roc_curve, precision_recall_curve, confusion_matrix, accuracy_score, f1_score
import matplotlib.pyplot as plt

# Optional DICOM support (lightweight usage)
try:
    import pydicom
except Exception:
    pydicom = None
    
# ---- Local config ----
try:
    import config
except Exception:
    class _Cfg:
        REGISTRY_DIR = "registry"
        IMAGE_SIZE = 224
        BATCH_SIZE = 16
        EPOCHS = 5
        LR = 3e-4
        VAL_SPLIT = 0.2
        SEED = 42
        BACKBONES = ["resnet18"]
    config = _Cfg()

np.random.seed(config.SEED)
torch.manual_seed(config.SEED)

def log(msg: str):
    print(f"[{datetime.now().isoformat()}] {msg}")

# ============== Utilities ==============

def ensure_dir(p: str | Path):
    Path(p).mkdir(parents=True, exist_ok=True)

def list_models(registry_dir: str):
    ensure_dir(registry_dir)
    entries = []
    for d in sorted(Path(registry_dir).glob("*")):
        if d.is_dir() and (d / "model.pt").exists() and (d / "config.json").exists():
            entries.append(d.name)
    return entries

def load_image(file_bytes: bytes, filename: str):
    # Detect DICOM by extension or magic
    name_lower = filename.lower()
    if name_lower.endswith(".dcm") and pydicom is not None:
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
        arr = ds.pixel_array.astype(np.float32)
        # Simple windowing/normalize to [0,1]
        arr -= arr.min()
        if arr.max() > 0:
            arr /= arr.max()
        img = np.stack([arr, arr, arr], axis=-1)  # 3-channel
        img_pil = Image.fromarray((img * 255).astype(np.uint8))
        return img_pil, "dicom"
    else:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        return img, "rgb"

def build_model(backbone: str = "resnet18"):
    if backbone == "resnet18":
        m = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        in_features = m.fc.in_features
        m.fc = nn.Linear(in_features, 1)
        # last conv layer name used later
        return m, "layer4"
    else:
        raise ValueError(f"Unsupported backbone: {backbone}")

# -------- Minimal Grad-CAM (no external deps) --------
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
    device = next(model.parameters()).device
    hook = _CamHook(target_layer)
    model.zero_grad(set_to_none=True)
    logits = model(x)           # [1,1]
    score = logits[0,0]
    score.backward(retain_graph=True)

    acts = hook.activations    # [1,C,h,w]
    grads = hook.gradients     # [1,C,h,w]
    hook.close()

    if acts is None or grads is None:
        return None

    weights = grads.mean(dim=(2,3), keepdim=True)    # [1,C,1,1]
    cam = (weights * acts).sum(dim=1, keepdim=False) # [1,h,w] -> [h,w]
    cam = torch.relu(cam[0])
    cam -= cam.min()
    if cam.max() > 0:
        cam /= cam.max()
    cam_np = cam.detach().cpu().numpy()
    return cam_np

def overlay_cam_on_image(img_np_float: np.ndarray, cam: np.ndarray):
    H, W, _ = img_np_float.shape
    cam_img = Image.fromarray((cam*255).astype(np.uint8)).resize((W, H), Image.Resampling.BILINEAR)
    cam_resized = np.asarray(cam_img).astype(np.float32)/255.0
    cmap = plt.get_cmap("jet")
    heatmap = cmap(cam_resized)[:, :, :3]  # drop alpha
    blended = (heatmap * 0.4 + img_np_float * 0.6)
    blended = np.clip(blended, 0, 1)
    out = (blended * 255).astype(np.uint8)
    return out

# -------- Dataset --------
class FolderDataset(Dataset[tuple[torch.Tensor, torch.Tensor, str]]):
    def __init__(self, root: str, transform=None):
        self.root = Path(root)
        self.transform = transform
        self.samples = []
        for label_name, label in [("negative", 0), ("positive", 1)]:
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.tif", "*.tiff", "*.dcm"):
                for p in self.root.joinpath(label_name).rglob(ext):
                    self.samples.append((p, label))
        if len(self.samples) == 0:
            raise RuntimeError("No images found. Expect folder: root/{negative,positive}/ with images.")
    
    def __len__(self) -> int:
        return len(self.samples)
    
    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor, str]:
        path, label = self.samples[idx]
        with open(path, "rb") as f:
            data = f.read()
        img_pil, _ = load_image(data, str(path.name))
        if self.transform:
            img = self.transform(img_pil)
        else:
            img = T.ToTensor()(img_pil)
        return img, torch.tensor(float(label)), str(path)

def make_loaders(
    dataset: Dataset[tuple[torch.Tensor, torch.Tensor, str]],
    val_split: float,
    batch_size: int
) -> tuple[
    DataLoader[tuple[torch.Tensor, torch.Tensor, str]],
    DataLoader[tuple[torch.Tensor, torch.Tensor, str]]
]:
    n = len(cast(Sized, dataset))
    val_n = int(n * val_split)
    train_n = n - val_n
    gen = torch.Generator().manual_seed(config.SEED)
    train_ds, val_ds = random_split(dataset, [train_n, val_n], generator=gen)  # type: ignore[type-var]
    train_ds = cast(Subset[tuple[torch.Tensor, torch.Tensor, str]], train_ds)
    val_ds   = cast(Subset[tuple[torch.Tensor, torch.Tensor, str]], val_ds)

    labels: list[int] = []
    for i in range(len(train_ds)):
        sample = cast(tuple[torch.Tensor, torch.Tensor, str], train_ds[i])
        _, y, _ = sample
        labels.append(int(y.item()))
    if labels:
        class_counts = np.bincount(labels, minlength=2)
        total = len(labels)
        weights = [total / (2 * max(c, 1)) for c in class_counts]
        sample_weights = [weights[int(y)] for y in labels]
        sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)
    else:
        sampler = None

    train_loader: DataLoader[tuple[torch.Tensor, torch.Tensor, str]] = DataLoader(
        train_ds, batch_size=batch_size,
        sampler=sampler if sampler else None,
        shuffle=(sampler is None)
    )
    val_loader: DataLoader[tuple[torch.Tensor, torch.Tensor, str]] = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False
    )
    return train_loader, val_loader

def compute_metrics(y_true, y_prob, threshold=0.5):
    y_true = np.asarray(y_true).astype(int)
    y_prob = np.asarray(y_prob).astype(float)
    y_pred = (y_prob >= threshold).astype(int)
    metrics = {}
    try:
        metrics["auc_roc"] = float(roc_auc_score(y_true, y_prob))
    except Exception:
        metrics["auc_roc"] = float("nan")
    metrics["accuracy"] = float(accuracy_score(y_true, y_pred))
    metrics["f1"] = float(f1_score(y_true, y_pred, zero_division=0))
    cm = confusion_matrix(y_true, y_pred, labels=[0,1])
    tn, fp, fn, tp = cm.ravel() if cm.size==4 else (0,0,0,0)
    sens = tp/(tp+fn) if (tp+fn)>0 else 0.0
    spec = tn/(tn+fp) if (tn+fp)>0 else 0.0
    metrics["sensitivity"] = float(sens)
    metrics["specificity"] = float(spec)
    metrics["confusion_matrix"] = cm.tolist()
    return metrics

def train_one(cfg, data_root: str, backbone: str, registry_dir: str, progress_cb=None):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")

    train_tf = T.Compose([
        T.Resize((cfg["IMAGE_SIZE"], cfg["IMAGE_SIZE"])),
        T.RandomHorizontalFlip(),
        T.RandomRotation(7),
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])
    val_tf = T.Compose([
        T.Resize((cfg["IMAGE_SIZE"], cfg["IMAGE_SIZE"])),
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])

    full_ds = FolderDataset(data_root, transform=None)
    full_ds.transform = train_tf
    train_loader, val_loader = make_loaders(full_ds, cfg["VAL_SPLIT"], cfg["BATCH_SIZE"])
    # train_loader: DataLoader[tuple[torch.Tensor, torch.Tensor, str]]
    # val_loader: DataLoader[tuple[torch.Tensor, torch.Tensor, str]]

    try:
        full_ds.transform = train_tf
        train_loader, _ = make_loaders(full_ds, cfg["VAL_SPLIT"], cfg["BATCH_SIZE"])

        val_ds = FolderDataset(data_root, transform=val_tf)
        _, val_loader = make_loaders(val_ds, cfg["VAL_SPLIT"], cfg["BATCH_SIZE"])
        # val_loader: DataLoader[tuple[torch.Tensor, torch.Tensor, str]]
    except Exception:
        pass

    model, last_block_name = build_model(backbone)
    model.to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["LR"], weight_decay=1e-4)

    best_auc = -1.0
    best_state = None
    history = []

    epochs = cfg["EPOCHS"]
    for epoch in range(1, epochs+1):
        model.train()
        tr_loss = 0.0
        n_batches = 0
        for xb, yb, _ in train_loader:
            xb = xb.to(device)
            yb = yb.view(-1,1).to(device)
            optimizer.zero_grad()
            out = model(xb)
            loss = criterion(out, yb)
            loss.backward()
            optimizer.step()
            tr_loss += loss.item()
            n_batches += 1

        model.eval()
        y_true, y_prob = [], []
        with torch.no_grad():
            for xb, yb, _ in val_loader:
                xb = xb.to(device)
                logits = model(xb)
                prob = torch.sigmoid(logits).squeeze(1).cpu().numpy()
                y_prob.extend(prob.tolist())
                y_true.extend(yb.numpy().tolist())

        metrics = compute_metrics(y_true, y_prob, threshold=0.5)
        epoch_info = {
            "epoch": epoch,
            "train_loss": tr_loss / max(n_batches,1),
            "val_auc": metrics["auc_roc"],
            "val_accuracy": metrics["accuracy"],
            "val_f1": metrics["f1"],
            "val_sensitivity": metrics["sensitivity"],
            "val_specificity": metrics["specificity"],
        }
        history.append(epoch_info)

        if progress_cb:
            progress_cb(epoch, epochs, epoch_info)

        if metrics["auc_roc"] > best_auc:
            best_auc = metrics["auc_roc"]
            best_state = {k: v.cpu() for k,v in model.state_dict().items()}

    dataset_name = Path(data_root).name
    model_name = f"{backbone}__{dataset_name}__{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    out_dir = Path(registry_dir) / model_name
    ensure_dir(out_dir)

    torch.save(best_state, out_dir / "model.pt")
    with open(out_dir / "config.json", "w") as f:
        json.dump({
            "backbone": backbone,
            "image_size": cfg["IMAGE_SIZE"],
            "created_at": datetime.now().isoformat(),
            "dataset": str(data_root),
            "threshold": 0.5
        }, f, indent=2)
    from typing import Mapping, Any, cast

    if best_state is None:
        raise RuntimeError("Training did not produce a valid best_state.")

    torch.save(best_state, out_dir / "model.pt")

    sd = torch.load(out_dir / "model.pt", map_location="cpu")
    model.load_state_dict(cast(Mapping[str, Any], sd))
    model.eval()

    full_ds.transform = val_tf
    _, val_loader = make_loaders(full_ds, cfg["VAL_SPLIT"], cfg["BATCH_SIZE"])

    y_true, y_prob = [], []
    with torch.no_grad():
        for xb, yb, _ in val_loader:
            xb = xb.to(device)
            prob = torch.sigmoid(model(xb)).squeeze(1).cpu().numpy()
            y_prob.extend(prob.tolist())
            y_true.extend(yb.numpy().tolist())

    metrics = compute_metrics(y_true, y_prob, threshold=0.5)

    try:
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        plt.figure()
        plt.plot(fpr, tpr, label=f"AUC={metrics['auc_roc']:.3f}")
        plt.plot([0,1],[0,1],'--')
        plt.xlabel("FPR"); plt.ylabel("TPR"); plt.legend()
        plt.tight_layout()
        plt.savefig(out_dir / "roc_curve.png", dpi=150)
        plt.close()
    except Exception:
        pass

    try:
        prec, rec, _ = precision_recall_curve(y_true, y_prob)
        plt.figure()
        plt.plot(rec, prec)
        plt.xlabel("Recall"); plt.ylabel("Precision")
        plt.tight_layout()
        plt.savefig(out_dir / "pr_curve.png", dpi=150)
        plt.close()
    except Exception:
        pass

    with open(out_dir / "metrics.json", "w") as f:
        json.dump({"val": metrics, "history": history}, f, indent=2)

    return model_name

def predict_with_cam(model_dir: Path, file_bytes: bytes, filename: str):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    with open(model_dir / "config.json") as f:
        cfg = json.load(f)
    backbone = cfg.get("backbone", "resnet18")
    threshold = float(cfg.get("threshold", 0.5))
    model, last_block_name = build_model(backbone)
    sd = torch.load(model_dir / "model.pt", map_location="cpu")
    model.load_state_dict(sd)
    model.eval().to(device)

    target_layer: nn.Module | None = None
    if last_block_name == "layer4" and hasattr(model, "layer4"):
        target_layer = cast(nn.Module, model.layer4[-1].conv2)  # type: ignore[attr-defined]

    img_pil, _ = load_image(file_bytes, filename)
    orig = img_pil.copy().resize((cfg["image_size"], cfg["image_size"]))
    orig_np = np.asarray(orig).astype(np.float32)/255.0

    tf = T.Compose([
        T.Resize((cfg["image_size"], cfg["image_size"])),
        T.ToTensor(),
        T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])
    x_tensor = cast(torch.Tensor, tf(img_pil))
    x = x_tensor.unsqueeze(0).to(device)

    x.requires_grad_(True)
    logits = model(x)
    prob = torch.sigmoid(logits).item()

    cam_img = None
    if target_layer is not None:
        cam = compute_gradcam(model, x, target_layer)
        if cam is not None:
            cam_img = overlay_cam_on_image(orig_np, cam)

    decision = "Likely disease" if prob >= threshold else "Unlikely disease"
    return prob, threshold, decision, orig, cam_img

# ============== Streamlit UI ==============

st.set_page_config(
    page_title="ScanLab MVP",
    page_icon="🩺",
    layout="wide",
)

st.title("🩺 ScanLab — Minimal MVP")
st.caption("Single question: *What is the probability of disease, and where is it?*")

registry_dir = config.REGISTRY_DIR
ensure_dir(registry_dir)
models_list = list_models(registry_dir)
selected_model_name = st.sidebar.selectbox("Select model from registry", options=models_list, index=0 if models_list else None)
st.sidebar.write(f"Registry: `{registry_dir}`")

tabs = st.tabs(["🔍 Inference", "🛠️ Train New Model", "📈 Metrics"])

with tabs[0]:
    st.subheader("Inference")
    if not selected_model_name:
        st.info("No model selected. Train a new model in the next tab, then return here.")
    else:
        model_dir = Path(registry_dir) / selected_model_name
        colL, colR = st.columns([1,1])
        with colL:
            uploaded = st.file_uploader("Upload a scan (JPG/PNG/DICOM)", type=["jpg","jpeg","png","bmp","tif","tiff","dcm"])
            analyze = st.button("Analyze Scan", type="primary", disabled=(uploaded is None))
        with colR:
            if (model_dir / "config.json").exists():
                with open(model_dir / "config.json") as f:
                    mc = json.load(f)
                st.json({
                    "model": selected_model_name,
                    "backbone": mc.get("backbone"),
                    "image_size": mc.get("image_size"),
                    "threshold": mc.get("threshold", 0.5),
                    "created_at": mc.get("created_at")
                }, expanded=False)

        if analyze and uploaded is not None:
            file_bytes = uploaded.read()
            with st.spinner("Running analysis..."):
                prob, threshold, decision, orig_img, cam_img = predict_with_cam(model_dir, file_bytes, uploaded.name)

            st.metric("Probability of disease", f"{prob*100:.1f}%")
            st.markdown(f"**Decision @ {int(threshold*100)}%:** {decision}")
            
            col1, col2 = st.columns([1,1])
            with col1:
                st.image(orig_img, caption="Input (preprocessed size)", width=512)
            with col2:
                if cam_img is not None:
                    st.image(cam_img, caption="Grad-CAM highlight (class-discriminative)", width=512)

with tabs[1]:
    st.subheader("Train a New Model")
    st.markdown("Dataset structure required: **root/negative/** and **root/positive/** with images.")
    data_root = st.text_input("Path to dataset root folder", value="")
    backbone = st.selectbox("Backbone", options=config.BACKBONES, index=0)
    c1, c2, c3 = st.columns(3)
    with c1:
        img_size = st.number_input("Image size", value=int(config.IMAGE_SIZE), min_value=96, max_value=512, step=32)
    with c2:
        batch_size = st.number_input("Batch size", value=int(config.BATCH_SIZE), min_value=4, max_value=64, step=4)
    with c3:
        epochs = st.number_input("Epochs", value=int(config.EPOCHS), min_value=1, max_value=50, step=1)
    lr = st.number_input("Learning rate", value=float(config.LR), format="%.5f")

    start = st.button("Start Training", type="primary", disabled=(len(data_root.strip())==0))
    if start:
        if not Path(data_root).exists():
            st.error("Provided dataset path does not exist.")
        else:
            prog = st.progress(0, text="Training...")
            status = st.empty()
            cfg = {
                "IMAGE_SIZE": int(img_size),
                "BATCH_SIZE": int(batch_size),
                "EPOCHS": int(epochs),
                "LR": float(lr),
                "VAL_SPLIT": float(config.VAL_SPLIT),
            }
            def on_progress(epoch, total, info):
                log(f"Epoch {epoch}/{total} — val AUC: {info['val_auc']:.3f}, acc: {info['val_accuracy']:.3f}")
                p = int(100*epoch/total)
                prog.progress(p, text=f"Epoch {epoch}/{total} — val AUC: {info['val_auc']:.3f}, acc: {info['val_accuracy']:.3f}")
                status.write(info)
            try:
                model_name = train_one(cfg, data_root, backbone, registry_dir, progress_cb=on_progress)
                st.success(f"Training complete. Saved as: {model_name}")
                st.rerun()
            except Exception as e:
                st.exception(e)

with tabs[2]:
    st.subheader("Model Registry & Metrics")
    if not selected_model_name:
        st.info("Select a model to view its metrics.")
    else:
        model_dir = Path(registry_dir) / selected_model_name
        metrics_path = model_dir / "metrics.json"
        if not metrics_path.exists():
            st.warning("No metrics found for this model.")
        else:
            with open(metrics_path) as f:
                m = json.load(f)
            colA, colB, colC, colD = st.columns(4)
            val = m.get("val", {})
            colA.metric("AUC ROC", f"{val.get('auc_roc', float('nan')):.3f}")
            colB.metric("Accuracy", f"{val.get('accuracy', float('nan')):.3f}")
            colC.metric("Sensitivity", f"{val.get('sensitivity', float('nan')):.3f}")
            colD.metric("Specificity", f"{val.get('specificity', float('nan')):.3f}")

            roc_img = model_dir / "roc_curve.png"
            pr_img = model_dir / "pr_curve.png"
            c1, c2 = st.columns(2)
            if roc_img.exists():
                c1.image(str(roc_img), caption="ROC Curve", use_container_width=True)
            if pr_img.exists():
                c2.image(str(pr_img), caption="PR Curve", use_container_width=True)

            cm = np.array(val.get("confusion_matrix", [[0,0],[0,0]]))
            fig, ax = plt.subplots()
            im = ax.imshow(cm, cmap="Blues")
            ax.set_title("Confusion Matrix (val)")
            ax.set_xticks([0,1]); ax.set_yticks([0,1])
            ax.set_xticklabels(["NoDisease","Disease"]); ax.set_yticklabels(["NoDisease","Disease"])
            for i in range(cm.shape[0]):
                for j in range(cm.shape[1]):
                    ax.text(j, i, str(int(cm[i, j])), ha="center", va="center")
            plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            st.pyplot(fig)
            plt.close(fig)

st.markdown("---")
with st.expander("Future-proof ideas (not in this MVP)"):
    st.markdown("""
- **Multimodal decision support:** Extend to 1 visual + 1 text (e.g., short clinical note) using a small local LLM for reasoning and retrieval (RAG/knowledge graph), providing an extra point of view alongside the classifier.
- **LLM Orchestrator:** A lightweight controller decides which checks to run (e.g., calibration check, OOD check, alt-backbone ensemble, double-read if uncertainty high) and composes an explainable summary for doctors.
""")
