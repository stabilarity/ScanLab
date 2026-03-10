# ScanLab v2 — SPEC_LOGIC.md
**Version:** 2.0.0 | **Updated:** 2026-03-09

## Purpose
Medical AI diagnostic platform for clinical decision support. Provides multi-model inference, uncertainty quantification, explainable AI (Grad-CAM), and ICD-10 code suggestions.

---

## Model Registry

| Model ID | Name | Task | Backbone | Classes | AUC | Status |
|----------|------|------|----------|---------|-----|--------|
| `resnet18_pneumonia` | Pneumonia Detector | binary | ResNet-18 | Normal, Pneumonia | 0.961 | **Real** |
| `resnet18_covid19` | COVID-19 Classifier | multiclass | ResNet-18 | Normal, COVID-19, Pneumonia | 0.944 | Mock |
| `resnet18_skin_lesion` | Skin Lesion Classifier | binary | ResNet-18 | Benign, Malignant | 0.887 | Mock |
| `resnet18_brain_tumor` | Brain Tumor Detector | binary | ResNet-18 | No Tumor, Tumor Present | 0.974 | Mock |
| `efficientnet_chest` | Multi-Label Chest | multilabel | EfficientNet-B0 | 14 conditions | 0.823 | Mock |

> "Real" = trained model from v1 registry. "Mock" = simulated for demo.

---

## ML Pipeline

### Inference Flow
1. **Preprocess**: Resize to 224×224, normalize with ImageNet stats
2. **Forward Pass**: Run through backbone + classifier
3. **Uncertainty**: Monte Carlo Dropout (20 samples) for epistemic uncertainty
4. **XAI**: Generate Grad-CAM heatmap overlay
5. **Post-process**: Map prediction to ICD-10 code

### Uncertainty Quantification
- Method: MC Dropout (enable dropout at inference, 20 forward passes)
- Output: Standard deviation of predicted class probability
- Threshold: uncertainty > 0.08 suggests low confidence — flag for review

### Grad-CAM Visualization
- Generates heatmap showing regions that influenced prediction
- Returns: original_b64, heatmap_b64 (RGBA), gradcam_b64 (composite)
- Purpose: Clinical transparency, helps radiologists verify AI focus

---

## API Endpoints

### Health Check
GET /v2/health
Response: { "status": "ok", "version": "2.0.0", "models_loaded": 5 }

### List Models
GET /v2/models
Response: { "model_id": { name, version, task, classes, metrics } }

### Single Prediction
POST /v2/predict
Form: file=<image>, model_name=<model_id>
Response: { prediction, confidence, uncertainty, icd10_code, gradcam_b64, processing_ms }

### Batch Prediction
POST /v2/predict/batch → Returns job_id
GET /v2/batch/{job_id} → Returns status and results

### Analytics
GET /v2/analytics
Response: { total_predictions, by_model, estimated_hours_saved, cost_savings_usd }

### ICD-10 Lookup
GET /v2/icd10/{condition}

### Localization
GET /v2/localization/{lang} (en, uk)

---

## Cost-Effectiveness Metrics

- **Hours saved**: total_predictions × 0.8 / 4 (AI pre-screens 80%, radiologist reads 4/hr)
- **USD saved**: hours_saved × $150/hr

---

## Input/Output Specifications

### Input
- Format: JPEG, PNG, DICOM (via PIL)
- Size: Any (resized to 224×224)
- Channels: RGB

### Output
- prediction: Class name
- confidence: Float [0, 1]
- uncertainty: Float (MC std dev)
- probabilities: Dict
- icd10_code/desc: ICD-10 mapping
- gradcam_b64: Base64 JPEG
- heatmap_b64: Base64 PNG RGBA

---

## Tattoo ID Module (v2.2.0)

### Purpose
Emergency patient identification via distinctive body markings (tattoos, scars, birthmarks). Modelled after the Ukrainian Ministry of Internal Affairs national tattoo identification service (launched 18.02.2026).

### Feature Extraction Pipeline
1. **Dominant colours**: K-means clustering (k=5) on RGB pixels, 15 iterations
2. **Edge density**: PIL FIND_EDGES filter, threshold > 40, proportion of edge pixels
3. **Texture complexity**: Std dev of grayscale pixel values (256x256)
4. **Style classification**: geometric (>0.45), linework (0.25-0.45), traditional (0.12-0.25), watercolor (<0.12)
5. **Body region estimate**: Aspect ratio heuristic from original image dimensions

### Visual Fingerprint
- MD5 hash of serialised feature vector (flattened colours + quantised metrics), truncated to 12 hex chars

### Similarity Matching
- Colour similarity: 0.30 weight (Euclidean distance, normalised by max 441)
- Edge density: 0.25 weight
- Texture complexity: 0.20 weight
- Style match: 0.25 weight (1.0 exact, 0.3 mismatch)
- Threshold: 0.55 for potential match

### Database Schema
```json
{
  "sketch_number": "YYYYMM-NNN",
  "category": "Texts|Portraits|Military symbols|Other",
  "type": "string",
  "body_location": "Head|Upper body|Lower body|Upper extremity|Lower extremity",
  "body_part": "string",
  "date_added": "YYYY-MM-DD",
  "description": "string",
  "fingerprint": "12-char hex",
  "features": { ... },
  "linked_sketches": ["YYYYMM-NNN"]
}
```

### API Endpoints
- `POST /v2/tattoo/analyze` — Upload image, extract features, search registry
- `POST /v2/tattoo/register` — Admin-gated record registration (requires API key)
- `GET /v2/tattoo/registry/count` — Public: total records + last update
- `GET /v2/tattoo/registry/browse` — Public: filtered browsing (category, body_location, body_part, search)
- `GET /v2/samples` — Sample image URLs for all sections

### Legal Basis
- GDPR Article 9(2)(a): Explicit consent for voluntary registration
- GDPR Article 9(2)(c): Vital interests exception for emergency identification
