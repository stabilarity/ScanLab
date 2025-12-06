**ScanLab**
Get probability of disease and Grad-CAM overlay
**Run locally:**
1) Install requirements (to venv or globally)
* [pip install -r requirements.txt]
2) Run training app: 
* [streamlit run app.py]
* Train dataset, get new model.
- Use any dataset like https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia/data to test
- Dataset structure required: root/negative/ and root/positive/ with images.
3) Run API 
* [uvicorn api:app --reload]
- Go to http://127.0.0.1:8000/docs

**REST API for running inference with trained ScanLab models.**

Swagger UI available at /docs, OpenAPI JSON at /openapi.json.

**Supported endpoints and flow:**
1) GET
/health - Health Check

2) GET
/models - Get Models

3) GET 
/models/{model_name} - Get Model Info

4) POST
/predict - Prediction on file (inference)