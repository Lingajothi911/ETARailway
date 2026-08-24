import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.models.database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    division = Column(String(50), default="MAS")
    zone = Column(String(50), default="SR")
    total_platforms = Column(Integer, default=6)

    schedules = relationship("TrainStationSchedule", back_populates="station")
    platforms = relationship("Platform", back_populates="station")

class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(10), unique=True, index=True, nullable=False)
    train_name = Column(String(100), index=True, nullable=False)
    train_type = Column(String(50), default="Superfast Express") # Vande Bharat, Shatabdi, Superfast Express, Express
    source_station_code = Column(String(10), nullable=False)
    dest_station_code = Column(String(10), nullable=False)
    total_distance_km = Column(Float, default=360.0)
    runs_on = Column(String(50), default="Daily")
    is_active = Column(Boolean, default=True)
    priority_level = Column(String(20), default="High") # Critical, High, Normal

    schedules = relationship("TrainStationSchedule", back_populates="train", order_by="TrainStationSchedule.sequence_number")
    live_state = relationship("TrainLiveState", back_populates="train", uselist=False)
    coaches = relationship("Coach", back_populates="train", order_by="Coach.sequence_number")

class RouteSection(Base):
    __tablename__ = "route_sections"

    id = Column(Integer, primary_key=True, index=True)
    from_station_code = Column(String(10), nullable=False)
    to_station_code = Column(String(10), nullable=False)
    distance_km = Column(Float, nullable=False)
    max_speed_kmph = Column(Float, default=110.0)
    current_congestion = Column(String(20), default="Normal") # Normal, Moderate, Heavy
    congestion_delay_factor = Column(Float, default=0.0) # extra minutes
    double_line = Column(Boolean, default=True)
    electrified = Column(Boolean, default=True)

class TrainStationSchedule(Base):
    __tablename__ = "train_station_schedules"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    station_code = Column(String(10), ForeignKey("stations.code"), nullable=False)
    sequence_number = Column(Integer, nullable=False)
    scheduled_arrival = Column(String(10), nullable=False) # "06:00" or "Source"
    scheduled_departure = Column(String(10), nullable=False) # "06:05" or "Dest"
    distance_from_origin_km = Column(Float, default=0.0)
    day_count = Column(Integer, default=1)
    scheduled_platform = Column(String(5), default="1")
    halt_duration_minutes = Column(Integer, default=2)

    train = relationship("Train", back_populates="schedules")
    station = relationship("Station", back_populates="schedules")

class TrainLiveState(Base):
    __tablename__ = "train_live_states"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), unique=True, nullable=False)
    current_station_code = Column(String(10), nullable=False)
    next_station_code = Column(String(10), nullable=False)
    current_status = Column(String(50), default="Running") # Running, Halted at Station, Delayed, Arrived
    current_delay_minutes = Column(Integer, default=0)
    distance_covered_km = Column(Float, default=0.0)
    current_speed_kmph = Column(Float, default=78.0)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    progress_percentage = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    is_simulated = Column(Boolean, default=True)

    train = relationship("Train", back_populates="live_state")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    station_code = Column(String(10), nullable=False)
    scheduled_arrival = Column(String(10), nullable=False)
    scheduled_departure = Column(String(10), nullable=False)
    traditional_eta = Column(String(10), nullable=False) # Scheduled + current delay
    predicted_arrival = Column(String(10), nullable=False)
    predicted_departure = Column(String(10), nullable=False)
    predicted_delay_minutes = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.85) # 0.0 - 1.0
    prediction_source = Column(String(30), default="simulation") # "simulation" or "ml_model"
    model_version = Column(String(20), default="mock-v1.2")
    factors_json = Column(JSON, nullable=True) # list of human readable factors
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(10), ForeignKey("stations.code"), nullable=False)
    platform_number = Column(String(5), nullable=False)
    is_occupied = Column(Boolean, default=False)
    current_train_number = Column(String(10), nullable=True)
    current_train_name = Column(String(100), nullable=True)
    expected_clear_time = Column(String(10), nullable=True)
    status = Column(String(20), default="Free") # Free, Occupied, Maintenance

    station = relationship("Station", back_populates="platforms")

class PlatformConflict(Base):
    __tablename__ = "platform_conflicts"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(10), nullable=False)
    station_name = Column(String(100), nullable=False)
    platform_number = Column(String(5), nullable=False)
    train1_number = Column(String(10), nullable=False)
    train1_name = Column(String(100), nullable=False)
    train1_eta = Column(String(10), nullable=False)
    train2_number = Column(String(10), nullable=False)
    train2_name = Column(String(100), nullable=False)
    train2_eta = Column(String(10), nullable=False)
    overlap_minutes = Column(Integer, default=5)
    suggested_platform = Column(String(5), nullable=False)
    recommendation_reason = Column(String(255), nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, nullable=True)
    train_number = Column(String(10), nullable=True)
    station_code = Column(String(10), nullable=True)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, CRITICAL
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    recommended_action = Column(String(255), nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class PredictionEvaluation(Base):
    __tablename__ = "prediction_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(10), nullable=False)
    station_code = Column(String(10), nullable=False)
    section_name = Column(String(100), nullable=False)
    scheduled_arrival = Column(String(10), nullable=False)
    actual_arrival = Column(String(10), nullable=False)
    predicted_arrival = Column(String(10), nullable=False)
    traditional_arrival = Column(String(10), nullable=False)
    ml_error_minutes = Column(Float, nullable=False)
    traditional_error_minutes = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    coach_code = Column(String(10), nullable=False) # e.g. "ENG", "S1", "B1", "A1", "GEN"
    coach_type = Column(String(50), nullable=False) # Locomotive, Sleeper, AC 3 Tier, AC 2 Tier, AC First, Unreserved
    sequence_number = Column(Integer, nullable=False)
    description = Column(String(100), nullable=True)

    train = relationship("Train", back_populates="coaches")

class OfficerUser(Base):
    __tablename__ = "officer_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="Section Controller")
    division = Column(String(50), default="Southern Railway - Chennai Division")
    is_active = Column(Boolean, default=True)
