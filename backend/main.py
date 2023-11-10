from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from pandas import DataFrame
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
import json
from fastapi.staticfiles import StaticFiles
import json

load_dotenv()

app = FastAPI()


app.add_middleware( # Only for development purpose
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.mount("/models", StaticFiles(directory="models/ann_js"), name="models")

@app.get("/")
async def index():
    return {"message": "Welcome To FastAPI BackEnd"}

@app.get("/check")
async def check_health():
    return {"status": "OK"}


class PredictionInput(BaseModel):
    housing_median_age: int | float
    total_rooms: int | float
    total_bedrooms: int | float
    population: int | float
    
class PredictionOutput(BaseModel):
    price: float

def scale_min_max(number:int | float, 
                   max_scale: int | float,
                   min_scale: int | float) -> float:
    X_std = (number - min_scale) / (max_scale - min_scale)
    return X_std * (max_scale - min_scale) + min_scale

@app.post("/prediction")
def predict_data(data: PredictionInput) -> PredictionOutput:
    # Model Loading
    print("Invoke hard-code prediction API. Loading the model....")
    model = load_model("./models/ann/1")
    # Parameter Definition
    scaler = {
        "housing_median_age": {
            "min": 1,
            "max": 52
        },
        "total_rooms": {
            "min": 2,
            "max": 39320
        },
        "total_bedrooms": {
            "min": 1,
            "max": 6445
        },
        "population": {
            "min": 5,
            "max": 35682
        }
    }
    # Preprocessing
    subset_df = DataFrame([jsonable_encoder(data)])
    for col in subset_df.columns:
        subset_df[col] = subset_df[col].map(
            lambda x: scale_min_max(number=x, 
                                    max_scale=scaler[col]['max'], 
                                    min_scale=scaler[col]['min']))
    data = subset_df[['housing_median_age','total_rooms',
                   'total_bedrooms','population']].values
    print("Data : ", data)
    # Prediction
    result = model.predict(data)
    print(result)
    return PredictionOutput(price=result)

@app.post("/tf_serving_prediction")
def predict_data_with_tf(data: PredictionInput) -> PredictionOutput:
    print("Invoke tf-serving prediction. Sending request the model API...")
    # Parameter Definition
    scaler = {
        "housing_median_age": {
            "min": 1,
            "max": 52
        },
        "total_rooms": {
            "min": 2,
            "max": 39320
        },
        "total_bedrooms": {
            "min": 1,
            "max": 6445
        },
        "population": {
            "min": 5,
            "max": 35682
        }
    }
    # Preprocessing
    subset_df = DataFrame([jsonable_encoder(data)])
    for col in subset_df.columns:
        subset_df[col] = subset_df[col].map(
            lambda x: scale_min_max(number=x, 
                                    max_scale=scaler[col]['max'], 
                                    min_scale=scaler[col]['min']))
    # Prediction Request
    post_url = os.getenv('TF_SERVING_API_HOST')
    data = subset_df[['housing_median_age','total_rooms',
                    'total_bedrooms','population']].values[0]
    print("Data : ", data)
    headers = {"content-type": "application/json"}
    response = requests.post(post_url,
                            headers=headers,
                           timeout=3, 
                           data=json.dumps({
                               "instances": [list(data)]
                               }))
    print(response.json())
    return PredictionOutput(price=float(response.json()['predictions'][0][0]))


if __name__ == "__main__":
    uvicorn.run("main:app", 
                host="0.0.0.0", 
                port=8000, 
                reload=True)