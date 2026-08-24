from fastapi import APIRouter, HTTPException, Query
from app.services.simulation_service import simulator
from app.schemas.dto import SimulationControlRequest, SimulationStatusResponse

router = APIRouter(prefix="/simulation", tags=["Live Train Simulation Engine"])

@router.get("/status", response_model=SimulationStatusResponse)
def get_simulation_status():
    """Get current running state of the live demo simulation engine."""
    return SimulationStatusResponse(
        is_running=simulator.is_running,
        speed_multiplier=simulator.speed_multiplier,
        current_simulation_time=simulator.simulated_clock.strftime("%H:%M:%S"),
        active_trains_count=5,
        total_ticks=simulator.total_ticks
    )

@router.post("/start")
def start_simulation(speed: int = Query(5, description="Speed multiplier: 1, 5, 15")):
    """Start live train movement simulation."""
    simulator.start(speed=speed)
    return {
        "status": "started",
        "speed_multiplier": simulator.speed_multiplier,
        "simulated_time": simulator.simulated_clock.strftime("%H:%M:%S")
    }

@router.post("/pause")
def pause_simulation():
    """Pause live train simulation."""
    simulator.pause()
    return {"status": "paused"}

@router.post("/reset")
def reset_simulation():
    """Reset simulation time and train coordinates back to baseline."""
    simulator.reset()
    return {"status": "reset", "simulated_time": simulator.simulated_clock.strftime("%H:%M:%S")}

@router.post("/speed")
def set_simulation_speed(speed: int = Query(..., description="Speed multiplier (1 = real-time, 5 = fast demo, 15 = ultra fast)")):
    """Configure simulation acceleration factor."""
    simulator.set_speed(speed)
    return {"status": "updated", "speed_multiplier": simulator.speed_multiplier}

@router.post("/inject_delay")
def inject_train_delay(req: SimulationControlRequest):
    """
    Injects an operational delay anomaly into a train (e.g. +15 min delay at Katpadi)
    to visually demonstrate real-time dynamic AI ETA recalculation and conflict alerts.
    """
    if not req.train_number:
        raise HTTPException(status_code=400, detail="train_number is required")
    delay = req.added_delay_minutes if req.added_delay_minutes is not None else 10
    result = simulator.inject_delay(req.train_number, delay, req.target_station_code)
    return result
