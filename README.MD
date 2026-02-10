# 🩺 ScanLab — Medical Imaging Diagnostic Platform

**Author:** Oleh Ivchenko  
**License:** MIT  
**Version:** 0.2.0

ScanLab is a minimal yet powerful medical imaging diagnostic platform that combines deep learning classification with explainable AI (Grad-CAM) to help clinicians understand model predictions.

## 🌟 Features

- **Binary Classification**: Determine probability of disease from medical images
- **Explainable AI**: Grad-CAM visualization highlights diagnostically significant regions
- **DICOM Support**: Native support for medical imaging format
- **REST API**: Production-ready FastAPI endpoints for integration
- **Batch Processing**: High-volume batch prediction for busy facilities
- **Ukrainian Localization**: Bilingual UI support (Ukrainian/English) for Ukrainian healthcare facilities
- **Analytics Tracking**: Usage metrics for ROI and cost-benefit analysis

## 🚀 Quick Start

### 1. Install Requirements

```bash
pip install -r requirements.txt
```

### 2. Train a Model

```bash
streamlit run app.py
```

Use a dataset like [Chest X-Ray Pneumonia](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia/data):
- Dataset structure: `root/negative/` and `root/positive/` with images

### 3. Run the API

```bash
uvicorn api:app --reload
```

Open http://127.0.0.1:8000/docs for Swagger UI

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/models` | List available models |
| GET | `/models/{name}` | Get model details |
| POST | `/predict` | Single image prediction |
| POST | `/predict/batch` | Batch prediction (multiple images) |
| GET | `/analytics` | Usage statistics for ROI tracking |
| GET | `/localization/{lang}` | Get UI strings (uk/en) |

## 🇺🇦 Ukrainian Localization

ScanLab includes Ukrainian language support for healthcare facilities in Ukraine:

```python
from config import get_string

# Get Ukrainian strings
print(get_string("probability", "uk"))  # "Ймовірність захворювання"
print(get_string("decision_likely", "uk"))  # "Ймовірне захворювання"
```

## 📊 Cost-Benefit Analytics

The `/analytics` endpoint provides usage metrics useful for calculating ROI:

```json
{
  "total_predictions": 1500,
  "single_predictions": 1200,
  "batch_predictions": 300,
  "models_in_registry": 3
}
```

This supports cost-benefit analysis as described in research on [Medical AI Implementation for Ukrainian Hospitals](https://stabilarity.com/research).

## 🏥 For Ukrainian Healthcare Facilities

ScanLab is designed with Ukrainian healthcare needs in mind:
- **Efficiency optimization** for high-volume facilities (15,000+ studies/year)
- **Batch processing** to maximize radiologist productivity
- **Bilingual interface** for seamless adoption
- **ROI tracking** to demonstrate value to administrators

## 📚 Technical Details

- **Backbone**: ResNet18 (pretrained on ImageNet)
- **Explainability**: Grad-CAM for class-discriminative regions
- **Image Formats**: JPG, PNG, BMP, TIFF, DICOM
- **Framework**: PyTorch + FastAPI + Streamlit

## 📝 License

MIT License - See [LICENSE](LICENSE) file.

---

*Developed for improving medical diagnostics in Ukraine* 🇺🇦
