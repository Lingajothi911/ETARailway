import os
from app.ml.base import BaseETAPredictor
from app.ml.mock_predictor import MockETAPredictor
from app.ml.real_ml_predictor import RealMLPredictor

_predictor_instance = None

def get_eta_predictor() -> BaseETAPredictor:
    """
    Factory method to retrieve the singleton ETA prediction engine.
    Controlled via ML_PREDICTOR_MODE environment variable ('mock' or 'real').
    """
    global _predictor_instance
    if _predictor_instance is None:
        mode = os.getenv("ML_PREDICTOR_MODE", "mock").lower()
        if mode == "real":
            model_path = os.getenv("ML_MODEL_PATH", "app/ml/artifacts/eta_lgbm.joblib")
            _predictor_instance = RealMLPredictor(model_path=model_path)
        else:
            _predictor_instance = MockETAPredictor(model_version="mock-v1.2")
            
    return _predictor_instance
