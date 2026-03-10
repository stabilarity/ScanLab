# ScanLab v2 — SPEC_DEPS.md
**Dependencies Documentation**

---

## Python Dependencies

### Core
fastapi>=0.100.0, uvicorn>=0.23.0, python-multipart>=0.0.6, pillow>=10.0.0, numpy>=1.24.0

### ML (for real model inference)
torch>=2.0.0, torchvision>=0.15.0

---

## System Services

| Service | Port | Description |
|---------|------|-------------|
| ScanLab v1 | 8000 | Legacy Flask API |
| ScanLab v2 | 8001 | FastAPI backend (current) |

Systemd: /etc/systemd/system/scanlab-v2.service

---

## Apache Proxy

File: /etc/apache2/sites-available/hub.stabilarity.com.conf

Public: https://hub.stabilarity.com/scanlab-api/v2/

---

## WordPress Integration

- Page ID: 2
- URL: /scanlab/
- Frontend: /var/www/html/wp-content/uploads/scanlab-v2/

---

## Research Category

- Medical ML Diagnosis (cat 47)
- Index Page: WP 297
- Articles: 35 in series

---

## Model Registry

v1 Real Models: /root/ScanLab/registry/
v2 Mock Models: Simulated in code
