from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from pandas import DataFrame
from fastapi.encoders import jsonable_encoder

app = FastAPI()

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
    model = load_model("./models/ann_v1.keras")
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
    # Prediction
    result = model.predict(
        subset_df[['housing_median_age','total_rooms',
                   'total_bedrooms','population']].values
    )
    return PredictionOutput(price=result)
    


if __name__ == "__main__":
    uvicorn.run("main:app", 
                host="0.0.0.0", 
                port=8000, 
                reload=True)