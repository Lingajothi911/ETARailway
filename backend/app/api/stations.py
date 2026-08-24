from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.schema_models import Station, Platform, TrainStationSchedule, Train
from app.schemas.dto import PlatformDTO

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("")
def list_stations(db: Session = Depends(get_db)):
    """List all available stations on the network."""
    stations = db.query(Station).all()
    return [{
        "code": s.code,
        "name": s.name,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "division": s.division,
        "zone": s.zone,
        "total_platforms": s.total_platforms
    } for s in stations]

@router.get("/{station_code}/board")
def get_station_live_board(station_code: str, db: Session = Depends(get_db)):
    """Fetch live departure/arrival board for a station with AI-predicted arrival times."""
    station = db.query(Station).filter(Station.code == station_code.upper()).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    schedules = db.query(TrainStationSchedule).filter(TrainStationSchedule.station_code == station_code.upper()).all()
    
    board = []
    for s in schedules:
        train = s.train
        if not train:
            continue
        live = train.live_state
        
        # Calculate dynamic delay
        delay = live.current_delay_minutes if live else 0
        from app.ml.mock_predictor import add_minutes_to_time_str
        
        predicted_arr = add_minutes_to_time_str(s.scheduled_arrival, max(0, delay - 2)) if s.scheduled_arrival != "Source" else "Source"
        traditional_arr = add_minutes_to_time_str(s.scheduled_arrival, delay) if s.scheduled_arrival != "Source" else "Source"
        
        board.append({
            "train_number": train.train_number,
            "train_name": train.train_name,
            "train_type": train.train_type,
            "scheduled_arrival": s.scheduled_arrival,
            "scheduled_departure": s.scheduled_departure,
            "platform": s.scheduled_platform,
            "delay_minutes": delay,
            "traditional_eta": traditional_arr,
            "ai_predicted_eta": predicted_arr,
            "status": "On Time" if delay == 0 else f"Late by {delay} min"
        })
        
    return {
        "station_code": station.code,
        "station_name": station.name,
        "total_platforms": station.total_platforms,
        "board": board
    }

@router.get("/{station_code}/platforms", response_model=List[PlatformDTO])
def get_station_platforms(station_code: str, db: Session = Depends(get_db)):
    """Fetch all platforms and live occupancy state for a station."""
    platforms = db.query(Platform).filter(Platform.station_code == station_code.upper()).all()
    return [
        PlatformDTO(
            id=p.id,
            station_code=p.station_code,
            platform_number=p.platform_number,
            is_occupied=p.is_occupied,
            current_train_number=p.current_train_number,
            current_train_name=p.current_train_name,
            expected_clear_time=p.expected_clear_time,
            status=p.status
        ) for p in platforms
    ]
