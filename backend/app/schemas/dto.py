from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str
    role: str
    division: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PredictionInput(BaseModel):
    train_id: str
    train_number: str
    train_type: str
    current_station_code: str
    target_station_code: str
    current_delay_minutes: int
    distance_remaining_km: float
    historical_section_time_minutes: float
    time_of_day: str # "21:30"
    day_of_week: str # "Monday"
    downstream_congestion: str # "Normal", "Moderate", "Heavy"
    weather_condition: Optional[str] = "Clear"
    priority_level: Optional[str] = "High"

class PredictionFactor(BaseModel):
    factor_name: str
    impact_minutes: int # e.g. -4 (delay recovered) or +3 (congestion delay)
    description: str

class PredictionOutput(BaseModel):
    station_code: str
    station_name: str
    scheduled_arrival: str
    scheduled_departure: str
    traditional_eta: str # Scheduled + current delay
    predicted_arrival: str
    predicted_departure: str
    predicted_delay_minutes: int
    delay_variance_from_traditional: int # e.g. -5 min (arriving 5m earlier than simple delay estimate)
    confidence_score: float # e.g. 0.88 (88%)
    confidence_disclaimer: str = "Simulated prototype score. Calibrated based on historical section variance."
    prediction_source: str = "simulation" # or "ml_model"
    model_version: str = "mock-v1.2"
    factors: List[PredictionFactor]
    prediction_timestamp: str

class CoachDTO(BaseModel):
    sequence_number: int
    coach_code: str
    coach_type: str
    description: Optional[str] = None

class StationScheduleDTO(BaseModel):
    sequence_number: int
    station_code: str
    station_name: str
    scheduled_arrival: str
    scheduled_departure: str
    distance_from_origin_km: float
    scheduled_platform: str
    actual_or_predicted_arrival: Optional[str] = None
    actual_or_predicted_departure: Optional[str] = None
    delay_minutes: Optional[int] = 0
    status: str # "Passed", "Current", "Upcoming"
    is_current: bool = False
    ai_prediction: Optional[PredictionOutput] = None

class LiveStateDTO(BaseModel):
    current_station_code: str
    current_station_name: str
    next_station_code: str
    next_station_name: str
    current_status: str
    current_delay_minutes: int
    distance_covered_km: float
    total_distance_km: float
    current_speed_kmph: float
    current_lat: float
    current_lng: float
    progress_percentage: float
    last_updated: str
    is_simulated: bool = True

class TrainSearchItem(BaseModel):
    id: int
    train_number: str
    train_name: str
    train_type: str
    source_station_code: str
    source_station_name: str
    dest_station_code: str
    dest_station_name: str
    departure_time: str
    arrival_time: str
    current_status: str
    current_delay_minutes: int
    current_station_name: str

class TrainDetailResponse(BaseModel):
    id: int
    train_number: str
    train_name: str
    train_type: str
    source_station_code: str
    source_station_name: str
    dest_station_code: str
    dest_station_name: str
    total_distance_km: float
    priority_level: str
    live_state: LiveStateDTO
    schedules: List[StationScheduleDTO]
    coaches: List[CoachDTO]
    next_station_prediction: Optional[PredictionOutput] = None

class PlatformDTO(BaseModel):
    id: int
    station_code: str
    platform_number: str
    is_occupied: bool
    current_train_number: Optional[str] = None
    current_train_name: Optional[str] = None
    expected_clear_time: Optional[str] = None
    status: str

class PlatformConflictDTO(BaseModel):
    id: int
    station_code: str
    station_name: str
    platform_number: str
    train1_number: str
    train1_name: str
    train1_eta: str
    train2_number: str
    train2_name: str
    train2_eta: str
    overlap_minutes: int
    suggested_platform: str
    recommendation_reason: str
    is_resolved: bool
    created_at: str

class CongestionSectionDTO(BaseModel):
    id: int
    from_station_code: str
    from_station_name: str
    to_station_code: str
    to_station_name: str
    distance_km: float
    max_speed_kmph: float
    current_congestion: str # Normal, Moderate, Heavy
    congestion_delay_factor: float

class AlertDTO(BaseModel):
    id: int
    train_number: Optional[str] = None
    station_code: Optional[str] = None
    severity: str # INFO, WARNING, CRITICAL
    title: str
    description: str
    recommended_action: Optional[str] = None
    is_acknowledged: bool
    timestamp: str

class OfficerKPIDTO(BaseModel):
    active_trains: int
    delayed_trains: int
    at_risk_trains: int
    critical_delays: int
    platform_conflicts: int
    predictions_updated_count: int
    avg_delay_reduction_minutes: float
    system_mae_ml: float
    system_mae_traditional: float

class OfficerDashboardResponse(BaseModel):
    kpis: OfficerKPIDTO
    trains: List[Dict[str, Any]]
    conflicts: List[PlatformConflictDTO]
    congestion: List[CongestionSectionDTO]
    alerts: List[AlertDTO]

class SimulationControlRequest(BaseModel):
    action: str # "start", "pause", "reset", "speed", "inject_delay"
    speed_multiplier: Optional[int] = 1 # 1, 5, 15
    train_number: Optional[str] = None
    added_delay_minutes: Optional[int] = None
    target_station_code: Optional[str] = None

class SimulationStatusResponse(BaseModel):
    is_running: bool
    speed_multiplier: int
    current_simulation_time: str
    active_trains_count: int
    total_ticks: int
