Run training app: 
streamlit run app.py
Dataset structure required: root/negative/ and root/positive/ with images.
Train dataset, get new model.
Use any dataset like https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia/data to test


REST API for running inference with trained ScanLab models.

Upload JPG/PNG/BMP/TIFF/DICOM
Get probability of disease and Grad-CAM overlay
Swagger UI available at /docs, OpenAPI JSON at /openapi.json.

GET
/health - Health Check

GET
/models - Get Models

GET
/models/{model_name} - Get Model Info

inference
POST /predict - Prediction on file