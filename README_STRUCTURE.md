# ScanLab Repository Structure

## `/v1/` — ScanLab v1 (Legacy)
Classical medical image classification system.
- **Backend:** Python FastAPI (`v1/api.py`)
- **Models:** Pre-trained TensorFlow models (chest X-ray, skin lesion, retinal, brain MRI)
- **Frontend:** Single-page React app (`v1/index.html`)
- **Docs:** Swagger UI at `/docs`

## Root — ScanLab v2 (Current)
Extended multi-modal diagnostic + tattoo identification system.
- **Backend:** Python FastAPI (`api.py`) with multi-tab inference engine
- **Tabs:**
  - Diagnose: medical image classification (6 anatomical sites)
  - Models: benchmark statistics per model
  - Batch: bulk prediction processing
  - Analytics: usage statistics and API metrics
  - **Tattoo ID:** emergency patient identification via body markings
  - Info: API documentation
- **Tattoo Module:** Feature extraction, registry search, GDPR-compliant voluntary database
- **Frontend:** Vue.js SPA (`frontend/index.html` + `frontend/app.js`)
- **Specs:** SPEC_LOGIC.md (architecture), SPEC_RELEASES.md (versions), SPEC_DEPS.md (dependencies)

## Running

### v1
```bash
cd v1
pip install -r requirements.txt
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

### v2
```bash
pip install -r requirements.txt
python -m uvicorn api:app --host 127.0.0.1 --port 8001
```

Then navigate to `http://localhost:8001/docs` for Swagger UI or the frontend app.

---

**Publication:** Research article on tattoo identification: https://hub.stabilarity.com/tattoo-based-emergency-patient-identification-internal-research-to-public-deployment/ (DOI: 10.5281/zenodo.18929669)
