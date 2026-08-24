import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RailPredict"
    PROJECT_SUBTITLE: str = "Dynamic AI-Powered Train ETA Forecasting"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "railpredict_secret_key_super_secure_for_hackathon_demo_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railpredict.db")
    
    # Simulation settings
    DEFAULT_SIMULATION_SPEED: int = 1 # 1 real sec = 1 sim min (or 5 for fast demo)
    SIMULATION_TICK_SECONDS: float = 1.0
    
    class Config:
        case_sensitive = True

settings = Settings()
