# ScanLab — Multi-Modal Medical Image Classification & Tattoo Identification

ScanLab is an open-source research platform for AI-assisted medical image diagnosis and emergency patient identification via distinctive body markings.

## Quick Start

**Frontend:** Open `/frontend/index.html` or run via web server
**API:** `python -m uvicorn api:app --host 127.0.0.1 --port 8001`
**Docs:** `http://localhost:8001/docs`

## Structure

- **v1/** — Legacy single-modal classifier (chest X-ray, skin lesion, retinal, brain MRI)
- **Root/** — v2 with extended tabs: Diagnose | Models | Batch | Analytics | **Tattoo ID** | Info
- **frontend/** — Vue.js single-page app
- **tattoo_db/** — GDPR-compliant voluntary registry for body marking identification

## Research

- **Publication:** [Tattoo-Based Emergency Patient Identification](https://hub.stabilarity.com/tattoo-based-emergency-patient-identification-internal-research-to-public-deployment/)
- **DOI:** 10.5281/zenodo.18929669
- **Authors:** Oleh Ivchenko, Dmytro Grybeniuk
- **Series:** Medical ML Diagnosis (Stabilarity Research Hub)

## Specifications

- `SPEC_LOGIC.md` — System architecture and algorithm overview
- `SPEC_RELEASES.md` — Version history and changelog
- `SPEC_DEPS.md` — External dependencies and API contracts

## License

See LICENSE file.
