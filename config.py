# config.py
"""
ScanLab Configuration Module

This module provides configuration settings for the ScanLab medical imaging
diagnostic platform, including model parameters, UI localization, and system settings.

Author: Oleh Ivchenko
License: MIT
"""

REGISTRY_DIR = "registry"
IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 5
LR = 3e-4
VAL_SPLIT = 0.2
SEED = 42

# Minimal set to keep install simple on macOS with M1/M2
BACKBONES = ["resnet18"]

# API rate limiting for cost control (requests per minute)
API_RATE_LIMIT = 60

# Analytics settings
ANALYTICS_ENABLED = True
ANALYTICS_LOG_PATH = "analytics.jsonl"

# Ukrainian localization / Українська локалізація
# Supports bilingual UI for Ukrainian healthcare facilities
UI_STRINGS = {
    "en": {
        "title": "ScanLab — Medical Imaging Diagnostics",
        "probability": "Probability of disease",
        "decision_likely": "Likely disease",
        "decision_unlikely": "Unlikely disease",
        "threshold": "Decision threshold",
        "upload_prompt": "Upload a scan (JPG/PNG/DICOM)",
        "analyze": "Analyze Scan",
        "no_model": "No model selected. Train a new model first.",
        "training_complete": "Training complete",
        "inference_tab": "Inference",
        "train_tab": "Train New Model",
        "metrics_tab": "Metrics",
        "gradcam_caption": "Grad-CAM highlight (class-discriminative regions)",
        "input_caption": "Input image (preprocessed)",
        "batch_upload": "Upload multiple scans for batch analysis",
        "batch_results": "Batch Analysis Results",
    },
    "uk": {
        "title": "ScanLab — Діагностика медичних зображень",
        "probability": "Ймовірність захворювання",
        "decision_likely": "Ймовірне захворювання",
        "decision_unlikely": "Захворювання малоймовірне",
        "threshold": "Поріг прийняття рішення",
        "upload_prompt": "Завантажте знімок (JPG/PNG/DICOM)",
        "analyze": "Аналізувати знімок",
        "no_model": "Модель не обрано. Спочатку навчіть нову модель.",
        "training_complete": "Навчання завершено",
        "inference_tab": "Діагностика",
        "train_tab": "Навчання моделі",
        "metrics_tab": "Метрики",
        "gradcam_caption": "Grad-CAM візуалізація (діагностично значущі області)",
        "input_caption": "Вхідне зображення (оброблене)",
        "batch_upload": "Завантажте кілька знімків для пакетного аналізу",
        "batch_results": "Результати пакетного аналізу",
    }
}

# Default language (can be overridden by UI or environment)
DEFAULT_LANGUAGE = "uk"

def get_string(key: str, lang: str = None) -> str:
    """
    Get a localized UI string.
    
    Args:
        key: The string key to look up
        lang: Language code ('en' or 'uk'). Defaults to DEFAULT_LANGUAGE.
    
    Returns:
        Localized string, or the key itself if not found.
    
    Author: Oleh Ivchenko
    """
    lang = lang or DEFAULT_LANGUAGE
    strings = UI_STRINGS.get(lang, UI_STRINGS.get("en", {}))
    return strings.get(key, key)
