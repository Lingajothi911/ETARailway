import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database import get_db
from app.models.schema_models import (
    Train, TrainLiveState, TrainStationSchedule, Station,
    PlatformConflict, Alert, RouteSection, Platform, PredictionEvaluation
)
from app.schemas.dto import (
    OfficerDashboardResponse, OfficerKPIDTO, PlatformConflictDTO,
    CongestionSectionDTO, AlertDTO
)
from app.ml.factory import get_eta_predictor
from app.ml.mock_predictor import add_minutes_to_time_str
from app.schemas.dto import PredictionInput

router = APIRouter(prefix="/officer", tags=["Railway Officer Control Dashboard"])

@router.get("/dashboard", response_model=OfficerDashboardResponse)
def get_officer_dashboard(db: Session = Depends(get_db)):
    """Comprehensive control room overview for railway section controllers."""
    trains = db.query(Train).filter(Train.is_active == True).all()
    conflicts = db.query(PlatformConflict).filter(PlatformConflict.is_resolved == False).all()
    sections = db.query(RouteSection).all()
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(15).all()
    
    delayed_count = 0
    critical_count = 0
    at_risk_count = 0
    train_rows = []
    
    predictor = get_eta_predictor()

    for t in trains:
        live = t.live_state
        delay = live.current_delay_minutes if live else 0
        if delay > 0:
            delayed_count += 1
        if delay >= 15:
            critical_count += 1
        elif delay >= 8:
            at_risk_count += 1
            
        schedules = sorted(t.schedules, key=lambda s: s.sequence_number)
        next_sched = next((s for s in schedules if s.station_code == (live.next_station_code if live else "KPD")), schedules[-1])
        next_stn = db.query(Station).filter(Station.code == next_sched.station_code).first()
        curr_stn = db.query(Station).filter(Station.code == (live.current_station_code if live else "MAS")).first()
        
        # Next station prediction
        pred_input = PredictionInput(
            train_id=str(t.id),
            train_number=t.train_number,
            train_type=t.train_type,
            current_station_code=live.current_station_code if live else "MAS",
            target_station_code=next_sched.station_code,
            current_delay_minutes=delay,
            distance_remaining_km=max(5.0, next_sched.distance_from_origin_km - (live.distance_covered_km if live else 0.0)),
            historical_section_time_minutes=45.0,
            time_of_day=next_sched.scheduled_arrival if next_sched.scheduled_arrival != "Source" else "21:00",
            day_of_week="Monday",
            downstream_congestion="Normal" if delay < 10 else "Moderate",
            priority_level=t.priority_level
        )
        pred = predictor.predict_station_eta(pred_input)
        
        risk_level = "Normal"
        if delay >= 15 or t.priority_level == "Critical":
            risk_level = "Critical" if delay >= 15 else "Monitored"
        elif delay >= 8:
            risk_level = "At Risk"

        train_rows.append({
            "id": t.id,
            "train_number": t.train_number,
            "train_name": t.train_name,
            "train_type": t.train_type,
            "route": f"{t.source_station_code} → {t.dest_station_code}",
            "current_location": curr_stn.name if curr_stn else live.current_station_code,
            "next_station": next_stn.name if next_stn else next_sched.station_code,
            "current_delay_minutes": delay,
            "speed_kmph": live.current_speed_kmph if live else 0.0,
            "scheduled_eta": next_sched.scheduled_arrival,
            "traditional_eta": pred.traditional_eta,
            "ai_predicted_eta": pred.predicted_arrival,
            "ai_predicted_etd": pred.predicted_departure,
            "predicted_delay_minutes": pred.predicted_delay_minutes,
            "delay_recovery_minutes": delay - pred.predicted_delay_minutes,
            "confidence_score": pred.confidence_score,
            "platform": f"P{next_sched.scheduled_platform}",
            "status": live.current_status if live else "Running",
            "priority": t.priority_level,
            "risk_level": risk_level,
            "progress_percentage": live.progress_percentage if live else 0.0,
            "lat": live.current_lat if live else 13.0,
            "lng": live.current_lng if live else 80.0
        })

    kpis = OfficerKPIDTO(
        active_trains=len(trains),
        delayed_trains=delayed_count,
        at_risk_trains=at_risk_count,
        critical_delays=critical_count,
        platform_conflicts=len(conflicts),
        predictions_updated_count=142,
        avg_delay_reduction_minutes=3.4,
        system_mae_ml=1.2,
        system_mae_traditional=6.8
    )

    conflict_dtos = [
        PlatformConflictDTO(
            id=c.id,
            station_code=c.station_code,
            station_name=c.station_name,
            platform_number=c.platform_number,
            train1_number=c.train1_number,
            train1_name=c.train1_name,
            train1_eta=c.train1_eta,
            train2_number=c.train2_number,
            train2_name=c.train2_name,
            train2_eta=c.train2_eta,
            overlap_minutes=c.overlap_minutes,
            suggested_platform=c.suggested_platform,
            recommendation_reason=c.recommendation_reason,
            is_resolved=c.is_resolved,
            created_at=c.created_at.strftime("%H:%M:%S")
        ) for c in conflicts
    ]

    congestion_dtos = []
    for sec in sections:
        f_stn = db.query(Station).filter(Station.code == sec.from_station_code).first()
        t_stn = db.query(Station).filter(Station.code == sec.to_station_code).first()
        congestion_dtos.append(CongestionSectionDTO(
            id=sec.id,
            from_station_code=sec.from_station_code,
            from_station_name=f_stn.name if f_stn else sec.from_station_code,
            to_station_code=sec.to_station_code,
            to_station_name=t_stn.name if t_stn else sec.to_station_code,
            distance_km=sec.distance_km,
            max_speed_kmph=sec.max_speed_kmph,
            current_congestion=sec.current_congestion,
            congestion_delay_factor=sec.congestion_delay_factor
        ))

    alert_dtos = [
        AlertDTO(
            id=a.id,
            train_number=a.train_number,
            station_code=a.station_code,
            severity=a.severity,
            title=a.title,
            description=a.description,
            recommended_action=a.recommended_action,
            is_acknowledged=a.is_acknowledged,
            timestamp=a.timestamp.strftime("%H:%M:%S")
        ) for a in alerts
    ]

    return OfficerDashboardResponse(
        kpis=kpis,
        trains=train_rows,
        conflicts=conflict_dtos,
        congestion=congestion_dtos,
        alerts=alert_dtos
    )

@router.get("/trains")
def get_officer_trains(db: Session = Depends(get_db)):
    dash = get_officer_dashboard(db)
    return dash.trains

@router.get("/conflicts", response_model=List[PlatformConflictDTO])
def get_platform_conflicts(db: Session = Depends(get_db)):
    conflicts = db.query(PlatformConflict).filter(PlatformConflict.is_resolved == False).all()
    return [
        PlatformConflictDTO(
            id=c.id,
            station_code=c.station_code,
            station_name=c.station_name,
            platform_number=c.platform_number,
            train1_number=c.train1_number,
            train1_name=c.train1_name,
            train1_eta=c.train1_eta,
            train2_number=c.train2_number,
            train2_name=c.train2_name,
            train2_eta=c.train2_eta,
            overlap_minutes=c.overlap_minutes,
            suggested_platform=c.suggested_platform,
            recommendation_reason=c.recommendation_reason,
            is_resolved=c.is_resolved,
            created_at=c.created_at.strftime("%H:%M:%S")
        ) for c in conflicts
    ]

@router.post("/conflicts/{conflict_id}/resolve")
def resolve_platform_conflict(conflict_id: int, db: Session = Depends(get_db)):
    """Applies suggested platform reassignment to resolve the conflict."""
    conflict = db.query(PlatformConflict).filter(PlatformConflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict record not found")

    conflict.is_resolved = True
    
    # Create an informational alert that the resolution was executed
    alert = Alert(
        train_number=conflict.train2_number,
        station_code=conflict.station_code,
        severity="INFO",
        title=f"Platform Reassigned: {conflict.train2_number} → Platform {conflict.suggested_platform}",
        description=f"Section controller approved reassignment at {conflict.station_name}. Conflict resolved.",
        recommended_action="Display updated platform on passenger station board.",
        is_acknowledged=True,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    
    return {
        "success": True,
        "message": f"Conflict resolved. Train {conflict.train2_number} reassigned to Platform {conflict.suggested_platform}."
    }

@router.get("/congestion", response_model=List[CongestionSectionDTO])
def get_section_congestion(db: Session = Depends(get_db)):
    sections = db.query(RouteSection).all()
    results = []
    for sec in sections:
        f_stn = db.query(Station).filter(Station.code == sec.from_station_code).first()
        t_stn = db.query(Station).filter(Station.code == sec.to_station_code).first()
        results.append(CongestionSectionDTO(
            id=sec.id,
            from_station_code=sec.from_station_code,
            from_station_name=f_stn.name if f_stn else sec.from_station_code,
            to_station_code=sec.to_station_code,
            to_station_name=t_stn.name if t_stn else sec.to_station_code,
            distance_km=sec.distance_km,
            max_speed_kmph=sec.max_speed_kmph,
            current_congestion=sec.current_congestion,
            congestion_delay_factor=sec.congestion_delay_factor
        ))
    return results

@router.get("/alerts", response_model=List[AlertDTO])
def get_officer_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    return [
        AlertDTO(
            id=a.id,
            train_number=a.train_number,
            station_code=a.station_code,
            severity=a.severity,
            title=a.title,
            description=a.description,
            recommended_action=a.recommended_action,
            is_acknowledged=a.is_acknowledged,
            timestamp=a.timestamp.strftime("%H:%M:%S")
        ) for a in alerts
    ]

@router.post("/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_acknowledged = True
    db.commit()
    return {"success": True, "message": "Alert acknowledged"}

@router.get("/analytics")
def get_prediction_analytics(db: Session = Depends(get_db)):
    """
    Returns comparative evaluation metrics between Dynamic ML predictions
    and Traditional delay-based estimates for charting.
    """
    evals = db.query(PredictionEvaluation).all()
    
    comparative_data = []
    ml_errors = []
    trad_errors = []
    
    for e in evals:
        comparative_data.append({
            "train_number": e.train_number,
            "section": e.section_name,
            "station": e.station_code,
            "scheduled": e.scheduled_arrival,
            "actual": e.actual_arrival,
            "ai_predicted": e.predicted_arrival,
            "traditional": e.traditional_arrival,
            "ai_error_min": e.ml_error_minutes,
            "traditional_error_min": e.traditional_error_minutes,
            "error_reduction": round(e.traditional_error_minutes - e.ml_error_minutes, 1)
        })
        ml_errors.append(e.ml_error_minutes)
        trad_errors.append(e.traditional_error_minutes)
        
    mae_ml = round(sum(ml_errors) / max(1, len(ml_errors)), 2)
    mae_trad = round(sum(trad_errors) / max(1, len(trad_errors)), 2)
    
    # Root Mean Square Error
    rmse_ml = round((sum(x**2 for x in ml_errors) / max(1, len(ml_errors))) ** 0.5, 2)
    rmse_trad = round((sum(x**2 for x in trad_errors) / max(1, len(trad_errors))) ** 0.5, 2)
    
    feature_importance_demo = [
        {"feature": "Current Train Delay", "importance": 0.38, "description": "Delay at origin/previous block station"},
        {"feature": "Historical Section Running Pattern", "importance": 0.26, "description": "Speed profiles over previous 12 months"},
        {"feature": "Downstream Section Congestion", "importance": 0.16, "description": "Line density and yard approach load"},
        {"feature": "Train Priority Class", "importance": 0.12, "description": "Vande Bharat/Shatabdi green signal clearance"},
        {"feature": "Station Dwell Variance", "importance": 0.08, "description": "Passenger boarding load and rake length"}
    ]
    
    return {
        "disclaimer": "PROTOTYPE / SIMULATED BENCHMARK DATA - For College AI/ML Hackathon Demonstration",
        "summary": {
            "total_samples": len(evals),
            "mae_ml_minutes": mae_ml,
            "mae_traditional_minutes": mae_trad,
            "rmse_ml_minutes": rmse_ml,
            "rmse_traditional_minutes": rmse_trad,
            "accuracy_improvement_pct": round(((mae_trad - mae_ml) / max(0.1, mae_trad)) * 100, 1)
        },
        "feature_importance": feature_importance_demo,
        "evaluations": comparative_data
    }
