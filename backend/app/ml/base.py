from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.schemas.dto import PredictionInput, PredictionOutput

class BaseETAPredictor(ABC):
    """
    Abstract Base Class for RailPredict ETA prediction models.
    All models (mock heuristic simulator, XGBoost, LightGBM, LSTM, etc.)
    must conform to this standard interface to allow zero-downtime hot-swapping
    without modifying API endpoints or mobile frontends.
    """
    
    @abstractmethod
    def predict_station_eta(self, features: PredictionInput) -> PredictionOutput:
        """
        Predict dynamic arrival and departure times for a single upcoming station.
        """
        pass

    @abstractmethod
    def predict_journey_schedule(
        self,
        train_number: str,
        current_station_code: str,
        current_delay_minutes: int,
        upcoming_schedules: List[Dict[str, Any]]
    ) -> List[PredictionOutput]:
        """
        Predict dynamic arrival times for all remaining upcoming stations along the journey.
        """
        pass
