from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db
from app.models.schema_models import Train, TrainStationSchedule, TrainLiveState, Station, Coach, Prediction
from app.schemas.dto import (
    TrainSearchItem, TrainDetailResponse, StationScheduleDTO,
    LiveStateDTO, CoachDTO, PredictionOutput, PredictionInput
)
from app.ml.factory import get_eta_predictor

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/search", response_model=List[TrainSearchItem])
def search_trains(
    q: Optional[str] = Query(None, description="Search query: train number or name"),
    from_stn: Optional[str] = Query(None, description="Source station code"),
    to_stn: Optional[str] = Query(None, description="Destination station code"),
    db: Session = Depends(get_db)
):
    """Search trains by number, name, or source-destination route pair."""
    query = db.query(Train).filter(Train.is_active == True)
    
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            (Train.train_number.ilike(search_pattern)) | 
            (Train.train_name.ilike(search_pattern))
        )
    
    results = []
    trains = query.all()
    
    for t in trains:
        schedules = sorted(t.schedules, key=lambda s: s.sequence_number)
        if not schedules:
            continue
            
        src_code = schedules[0].station_code
        dest_code = schedules[-1].station_code
        
        # Route filtering if specified
        if from_stn and to_stn:
            stn_codes = [s.station_code for s in schedules]
            if from_stn.upper() not in stn_codes or to_stn.upper() not in stn_codes:
                continue
            if stn_codes.index(from_stn.upper()) >= stn_codes.index(to_stn.upper()):
                continue # Wrong direction
                
        src_stn = db.query(Station).filter(Station.code == src_code).first()
        dest_stn = db.query(Station).filter(Station.code == dest_code).first()
        curr_stn = db.query(Station).filter(Station.code == (t.live_state.current_station_code if t.live_state else src_code)).first()
        
        results.append(TrainSearchItem(
            id=t.id,
            train_number=t.train_number,
            train_name=t.train_name,
            train_type=t.train_type,
            source_station_code=src_code,
            source_station_name=src_stn.name if src_stn else src_code,
            dest_station_code=dest_code,
            dest_station_name=dest_stn.name if dest_stn else dest_code,
            departure_time=schedules[0].scheduled_departure,
            arrival_time=schedules[-1].scheduled_arrival,
            current_status=t.live_state.current_status if t.live_state else "Scheduled",
            current_delay_minutes=t.live_state.current_delay_minutes if t.live_state else 0,
            current_station_name=curr_stn.name if curr_stn else "Departed"
        ))
        
    return results

@router.get("/{train_id_or_number}", response_model=TrainDetailResponse)
def get_train_details(train_id_or_number: str, db: Session = Depends(get_db)):
    """Fetch complete live train details including AI ETA forecast vs traditional estimate."""
    if train_id_or_number.isdigit() and len(train_id_or_number) == 5:
        train = db.query(Train).filter(Train.train_number == train_id_or_number).first()
    elif train_id_or_number.isdigit():
        train = db.query(Train).filter((Train.id == int(train_id_or_number)) | (Train.train_number == train_id_or_number)).first()
    else:
        train = db.query(Train).filter(Train.train_name.ilike(f"%{train_id_or_number}%")).first()

    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    schedules = sorted(train.schedules, key=lambda s: s.sequence_number)
    src_stn = db.query(Station).filter(Station.code == train.source_station_code).first()
    dest_stn = db.query(Station).filter(Station.code == train.dest_station_code).first()
    
    live = train.live_state
    curr_stn = db.query(Station).filter(Station.code == (live.current_station_code if live else schedules[0].station_code)).first()
    next_stn = db.query(Station).filter(Station.code == (live.next_station_code if live else schedules[1].station_code)).first()
    
    predictor = get_eta_predictor()
    
    # Predict upcoming next station ETA
    next_sched = next((s for s in schedules if s.station_code == (live.next_station_code if live else schedules[1].station_code)), schedules[1] if len(schedules) > 1 else schedules[0])
    
    pred_input = PredictionInput(
        train_id=str(train.id),
        train_number=train.train_number,
        train_type=train.train_type,
        current_station_code=live.current_station_code if live else schedules[0].station_code,
        target_station_code=next_sched.station_code,
        current_delay_minutes=live.current_delay_minutes if live else 0,
        distance_remaining_km=max(5.0, next_sched.distance_from_origin_km - (live.distance_covered_km if live else 0.0)),
        historical_section_time_minutes=45.0,
        time_of_day=next_sched.scheduled_arrival if next_sched.scheduled_arrival != "Source" else "21:00",
        day_of_week="Monday",
        downstream_congestion="Normal" if (live.current_delay_minutes if live else 0) < 10 else "Moderate",
        priority_level=train.priority_level
    )
    next_pred = predictor.predict_station_eta(pred_input)
    next_pred.station_name = next_stn.name if next_stn else next_sched.station_code
    
    # Build schedule list with timeline status and AI prediction for each upcoming station
    schedule_dtos = []
    found_current = False
    for s in schedules:
        stn = db.query(Station).filter(Station.code == s.station_code).first()
        is_current = (s.station_code == live.current_station_code) if live else False
        
        status = "Upcoming"
        if is_current:
            status = "Current"
            found_current = True
        elif not found_current and (live and live.distance_covered_km >= s.distance_from_origin_km):
            status = "Passed"
            
        # If upcoming, generate station AI prediction
        ai_pred = None
        if status in ["Upcoming", "Current"] and s.scheduled_arrival not in ["Source", "--"]:
            stn_pred_input = PredictionInput(
                train_id=str(train.id),
                train_number=train.train_number,
                train_type=train.train_type,
                current_station_code=live.current_station_code if live else schedules[0].station_code,
                target_station_code=s.station_code,
                current_delay_minutes=live.current_delay_minutes if live else 0,
                distance_remaining_km=max(5.0, s.distance_from_origin_km - (live.distance_covered_km if live else 0.0)),
                historical_section_time_minutes=35.0,
                time_of_day=s.scheduled_arrival,
                day_of_week="Monday",
                downstream_congestion="Moderate" if (live and live.current_delay_minutes > 15) else "Normal",
                priority_level=train.priority_level
            )
            ai_pred = predictor.predict_station_eta(stn_pred_input)
            ai_pred.station_name = stn.name if stn else s.station_code

        schedule_dtos.append(StationScheduleDTO(
            sequence_number=s.sequence_number,
            station_code=s.station_code,
            station_name=stn.name if stn else s.station_code,
            scheduled_arrival=s.scheduled_arrival,
            scheduled_departure=s.scheduled_departure,
            distance_from_origin_km=s.distance_from_origin_km,
            scheduled_platform=s.scheduled_platform,
            actual_or_predicted_arrival=ai_pred.predicted_arrival if ai_pred else s.scheduled_arrival,
            actual_or_predicted_departure=ai_pred.predicted_departure if ai_pred else s.scheduled_departure,
            delay_minutes=ai_pred.predicted_delay_minutes if ai_pred else (live.current_delay_minutes if live else 0),
            status=status,
            is_current=is_current,
            ai_prediction=ai_pred
        ))
        
    coaches_dtos = [
        CoachDTO(
            sequence_number=c.sequence_number,
            coach_code=c.coach_code,
            coach_type=c.coach_type,
            description=c.description
        ) for c in sorted(train.coaches, key=lambda c: c.sequence_number)
    ]
    
    live_dto = LiveStateDTO(
        current_station_code=live.current_station_code if live else schedules[0].station_code,
        current_station_name=curr_stn.name if curr_stn else "Source",
        next_station_code=live.next_station_code if live else schedules[1].station_code,
        next_station_name=next_stn.name if next_stn else "Next Station",
        current_status=live.current_status if live else "Scheduled",
        current_delay_minutes=live.current_delay_minutes if live else 0,
        distance_covered_km=live.distance_covered_km if live else 0.0,
        total_distance_km=train.total_distance_km,
        current_speed_kmph=live.current_speed_kmph if live else 0.0,
        current_lat=live.current_lat if live else (curr_stn.latitude if curr_stn else 13.0827),
        current_lng=live.current_lng if live else (curr_stn.longitude if curr_stn else 80.2707),
        progress_percentage=live.progress_percentage if live else 0.0,
        last_updated=live.last_updated.strftime("%H:%M:%S") if live else "Just now",
        is_simulated=True
    )

    return TrainDetailResponse(
        id=train.id,
        train_number=train.train_number,
        train_name=train.train_name,
        train_type=train.train_type,
        source_station_code=train.source_station_code,
        source_station_name=src_stn.name if src_stn else train.source_station_code,
        dest_station_code=train.dest_station_code,
        dest_station_name=dest_stn.name if dest_stn else train.dest_station_code,
        total_distance_km=train.total_distance_km,
        priority_level=train.priority_level,
        live_state=live_dto,
        schedules=schedule_dtos,
        coaches=coaches_dtos,
        next_station_prediction=next_pred
    )

@router.get("/{train_id_or_number}/map")
def get_train_map_route(train_id_or_number: str, db: Session = Depends(get_db)):
    """Returns coordinates for the entire train route, station pins, and live train position."""
    train = db.query(Train).filter(
        (Train.train_number == train_id_or_number) | (Train.id == (int(train_id_or_number) if train_id_or_number.isdigit() else -1))
    ).first()
    
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    schedules = sorted(train.schedules, key=lambda s: s.sequence_number)
    stations_info = []
    
    for s in schedules:
        stn = db.query(Station).filter(Station.code == s.station_code).first()
        if stn:
            stations_info.append({
                "code": stn.code,
                "name": stn.name,
                "latitude": stn.latitude,
                "longitude": stn.longitude,
                "sequence": s.sequence_number,
                "scheduled_arrival": s.scheduled_arrival,
                "scheduled_departure": s.scheduled_departure,
                "scheduled_platform": s.scheduled_platform
            })
            
    live = train.live_state
    
    return {
        "train_number": train.train_number,
        "train_name": train.train_name,
        "live_position": {
            "latitude": live.current_lat if live else stations_info[0]["latitude"],
            "longitude": live.current_lng if live else stations_info[0]["longitude"],
            "speed_kmph": live.current_speed_kmph if live else 0.0,
            "delay_minutes": live.current_delay_minutes if live else 0,
            "current_station": live.current_station_code if live else train.source_station_code,
            "next_station": live.next_station_code if live else train.dest_station_code
        },
        "stations": stations_info
    }

@router.post("/predict", response_model=PredictionOutput)
def calculate_dynamic_eta(input_data: PredictionInput):
    """Direct API to trigger AI ETA prediction for any arbitrary station & running state."""
    predictor = get_eta_predictor()
    return predictor.predict_station_eta(input_data)
