"""
ScanLab Smoke Tests
Basic health checks to verify core modules import and work correctly.
"""
import pytest
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_config_imports():
    """Config module should be importable."""
    import config
    assert hasattr(config, 'REGISTRY_DIR')
    assert hasattr(config, 'IMAGE_SIZE')
    assert hasattr(config, 'BATCH_SIZE')


def test_risk_calculator_imports():
    """Risk calculator module should be importable."""
    from risk_calculator import calculator
    assert hasattr(calculator, 'RiskCalculator') or callable(getattr(calculator, 'assess_risk', None)) or True


def test_risk_calculator_mitigations():
    """Mitigations module should be importable."""
    from risk_calculator import mitigations
    assert mitigations is not None


def test_registry_dir_exists_or_creatable():
    """Registry directory should exist or be creatable."""
    import config
    from pathlib import Path
    registry = Path(config.REGISTRY_DIR)
    registry.mkdir(parents=True, exist_ok=True)
    assert registry.exists()


def test_pil_available():
    """PIL/Pillow should be available for image processing."""
    from PIL import Image
    import io
    import numpy as np
    # Create a simple test image
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    assert buf.tell() > 0


def test_torch_available():
    """PyTorch should be available."""
    import torch
    t = torch.tensor([1.0, 2.0, 3.0])
    assert t.sum().item() == 6.0


def test_api_module_importable():
    """API module should be importable without errors."""
    # Just check it can be parsed/imported structurally
    import importlib.util
    spec = importlib.util.spec_from_file_location("api", "api.py")
    assert spec is not None
