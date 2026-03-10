# ScanLab — SPEC_RELEASES.md
**Version History**

---

## v2.1.0 (2026-03-09) — Current

### Improvements
- **ICD-10 Code Suggestions**: Returned in prediction response for all positive findings
- **Cost-Effectiveness Metrics**: Analytics endpoint shows estimated hours saved & USD savings
- **Enhanced Grad-CAM**: Separate heatmap PNG (RGBA) for flexible compositing
- **Persistent Analytics**: Predictions tracked across service restarts
- **API Docs**: FastAPI auto-docs at /v2/docs

### WP Integration
- Tool-meta added to WP page 2
- CTA button added to Medical ML Diagnosis research index (WP 297)

---

## v2.0.0 (2026-03-02)

### New Features
- Multi-Model Registry: 5 models (pneumonia, COVID-19, skin lesion, brain tumor, chest multi-label)
- Uncertainty Quantification: Monte Carlo Dropout (20 samples)
- Grad-CAM Visualization: Heatmap overlay showing model attention
- Batch Processing: Async job-based multi-image inference
- Analytics Dashboard: Usage stats, model performance tracking
- Localization: English and Ukrainian UI strings
- FastAPI Backend: Replaces Flask

### Architecture
- Port: 8001 (v1 remains on 8000)
- Apache proxy: /scanlab-api/ → localhost:8001

---

## v1.0.0 (2025-11-12)

### Initial Release
- Single model: ResNet-18 Pneumonia Detector
- Basic confidence scores
- Flask backend on port 8000
- Dataset: Kaggle Chest X-ray Pneumonia (5,856 images)
- Metrics: AUC 0.961, Sensitivity 0.942, Specificity 0.897

---

## Roadmap

### v2.2.0 (Planned)
- DICOM native support
- PDF report generation
- FHIR integration

### v3.0.0 (Future)
- Vision Transformer (ViT) models
- Real-time video stream inference

---

## v2.2.0 (2026-03-09)

### New Features
- **Tattoo ID Module**: Emergency patient identification via distinctive body markings
  - Feature extraction pipeline: dominant colours, edge density, texture complexity, style classification
  - Visual fingerprinting and similarity matching against voluntary registry
  - Database schema modelled after Ukrainian MIA national tattoo ID service (launched 18.02.2026)
  - Browse/filter registry: category, body location, body part, description search
  - Multi-tattoo linking (linked_sketches[])
  - Admin-gated registration endpoint
  - GDPR Article 9 compliance: explicit consent + vital interests exception
- **Sample Images**: "Load sample" buttons for all existing sections (Pneumonia, COVID-19, Skin Lesion, Brain Tumor, Chest Multi-Label, Tattoo ID)
  - Real public-domain images from Wikimedia Commons
  - `GET /v2/samples` endpoint serving URLs per model

### New API Endpoints
- `POST /v2/tattoo/analyze`
- `POST /v2/tattoo/register` (admin-gated)
- `GET /v2/tattoo/registry/count`
- `GET /v2/tattoo/registry/browse`
- `GET /v2/samples`

### Research
- Published: "Tattoo-Based Emergency Patient Identification" (DOI: 10.5281/zenodo.18929669, WP post 1593)
- Series: Medical ML Diagnosis (category 47, article #36)

### Database
- Tattoo registry: `/root/ScanLab-v2/tattoo_db/registry.json`
- 3 demo records with sketch_number format (YYYYMM-NNN)
