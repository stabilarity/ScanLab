# config.py
REGISTRY_DIR = "registry"
IMAGE_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 5
LR = 3e-4
VAL_SPLIT = 0.2
SEED = 42

# Minimal set to keep install simple on macOS with M1/M2
BACKBONES = ["resnet18"]
