import asyncio
import datetime
import math
import random
from typing import Dict, Any, List, Set
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.schema_models import (
    Train, TrainLiveState, TrainStationSchedule, Station,
    PlatformConflict, Alert, RouteSection, Platform
)
from app.ml.factory import get_eta_predictor
from app.schemas.dto import PredictionInput

class SimulationManager:
    """
    Real-Time Train Simulation Service for RailPredict.
    
    Provides:
    - Configurable multi-speed simulation (1x, 5x, 15x)
    - Realistic kinematic train movement between GPS coordinates
    - Continuous dynamic ETA recalculation via the ML prediction engine
    - Live platform conflict detection & alert broadcasting
    - Manual delay injection to simulate operational anomalies
    """
    
    def __init__(self):
        self.is_running: bool = False
        self.speed_multiplier: int = 5 # default 5x for good demo experience
        self.tick_interval: float = 1.0 # 1 second real-time tick
        self.total_ticks: int = 0
        self.active_websockets: Set[Any] = set()
        self._task: asyncio.Task = None
        self.simulated_clock: datetime.datetime = datetime.datetime.now().replace(hour=22, minute=10, second=0)

    def register_websocket(self, ws: Any):
        self.active_websockets.add(ws)

    def unregister_websocket(self, ws: Any):
        self.active_websockets.discard(ws)

    async def broadcast_event(self, message: Dict[str, Any]):
        """Broadcasts a JSON message to all connected WebSocket clients (mobile & dashboard)."""
        dead_sockets = set()
        for ws in self.active_websockets:
            try:
                await ws.send_json(message)
            except Exception:
                dead_sockets.add(ws)
        for dead in dead_sockets:
            self.active_websockets.discard(dead)

    def start(self, speed: int = 5):
        self.speed_multiplier = speed
        self.is_running = True
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._simulation_loop())

    def pause(self):
        self.is_running = False

    def set_speed(self, speed: int):
        self.speed_multiplier = max(1, min(30, speed))

    def reset(self):
        self.pause()
        self.total_ticks = 0
        self.simulated_clock = datetime.datetime.now().replace(hour=22, minute=10, second=0)
        # Reset train positions back to starting seed positions in DB
        db: Session = SessionLocal()
        try:
            from app.services.seed_service import seed_database
            # Reset states
            trains = db.query(Train).all()
            for t in trains:
                if t.live_state:
                    if t.train_number == "12627":
                        t.live_state.current_delay_minutes = 18
                        t.live_state.distance_covered_km = 95.0
                        t.live_state.current_station_code = "AJJ"
                        t.live_state.next_station_code = "KPD"
                        t.live_state.current_lat = 13.0400
                        t.live_state.current_lng = 79.4100
                    elif t.train_number == "20607":
                        t.live_state.current_delay_minutes = 2
                        t.live_state.distance_covered_km = 170.0
                        t.live_state.current_station_code = "KPD"
                        t.live_state.next_station_code = "JTJ"
                        t.live_state.current_lat = 12.7800
                        t.live_state.current_lng = 78.8500
                    elif t.train_number == "16021":
                        t.live_state.current_delay_minutes = 14
                        t.live_state.distance_covered_km = 88.0
                        t.live_state.current_station_code = "AJJ"
                        t.live_state.next_station_code = "KPD"
                        t.live_state.current_lat = 13.0600
                        t.live_state.current_lng = 79.3500
            db.commit()
        finally:
            db.close()

    def inject_delay(self, train_number: str, added_delay_minutes: int, station_code: str = None) -> Dict[str, Any]:
        """Manually injects delay into a train to demonstrate dynamic ETA recalculation in real time."""
        db: Session = SessionLocal()
        try:
            train = db.query(Train).filter(Train.train_number == train_number).first()
            if not train or not train.live_state:
                return {"success": False, "error": f"Train {train_number} not found"}

            train.live_state.current_delay_minutes += added_delay_minutes
            if train.live_state.current_delay_minutes > 15:
                train.live_state.current_status = "Delayed"
            
            # Create an operational alert
            alert = Alert(
                train_number=train_number,
                station_code=station_code or train.live_state.next_station_code,
                severity="WARNING" if added_delay_minutes < 15 else "CRITICAL",
                title=f"Manual Delay Injected: +{added_delay_minutes} min",
                description=f"Train {train_number} ({train.train_name}) delayed by +{added_delay_minutes} min near {train.live_state.next_station_code}. AI ETA recalculating.",
                recommended_action="Notify station master and recalculate platform occupancy buffer.",
                is_acknowledged=False,
                timestamp=datetime.datetime.utcnow()
            )
            db.add(alert)
            db.commit()
            
            # Recalculate predictions
            predictor = get_eta_predictor()
            pred_input = PredictionInput(
                train_id=str(train.id),
                train_number=train.train_number,
                train_type=train.train_type,
                current_station_code=train.live_state.current_station_code,
                target_station_code=train.live_state.next_station_code,
                current_delay_minutes=train.live_state.current_delay_minutes,
                distance_remaining_km=45.0,
                historical_section_time_minutes=40.0,
                time_of_day="22:30",
                day_of_week="Monday",
                downstream_congestion="Moderate",
                priority_level=train.priority_level
            )
            prediction = predictor.predict_station_eta(pred_input)
            
            return {
                "success": True,
                "train_number": train_number,
                "new_delay_minutes": train.live_state.current_delay_minutes,
                "ai_predicted_eta": prediction.predicted_arrival,
                "traditional_eta": prediction.traditional_eta,
                "confidence": prediction.confidence_score
            }
        finally:
            db.close()

    async def _simulation_loop(self):
        while True:
            if not self.is_running:
                await asyncio.sleep(0.5)
                continue

            try:
                self.total_ticks += 1
                simulated_minutes_passed = self.speed_multiplier * (self.tick_interval / 60.0)
                self.simulated_clock += datetime.timedelta(minutes=simulated_minutes_passed)

                db: Session = SessionLocal()
                trains = db.query(Train).filter(Train.is_active == True).all()
                predictor = get_eta_predictor()
                
                updated_trains = []

                for t in trains:
                    state = t.live_state
                    if not state:
                        continue

                    # Move train along route
                    speed_km_per_sec = (state.current_speed_kmph / 3600.0) * self.speed_multiplier
                    state.distance_covered_km = min(t.total_distance_km, state.distance_covered_km + (speed_km_per_sec * self.tick_interval))
                    state.progress_percentage = round((state.distance_covered_km / t.total_distance_km) * 100, 1)

                    # Update coordinates smoothly between current & next station
                    schedules = sorted(t.schedules, key=lambda s: s.sequence_number)
                    curr_sched = next((s for s in schedules if s.station_code == state.current_station_code), schedules[0])
                    next_sched = next((s for s in schedules if s.station_code == state.next_station_code), schedules[-1])
                    
                    curr_stn = db.query(Station).filter(Station.code == curr_sched.station_code).first()
                    next_stn = db.query(Station).filter(Station.code == next_sched.station_code).first()
                    
                    if curr_stn and next_stn:
                        sec_dist = max(1.0, next_sched.distance_from_origin_km - curr_sched.distance_from_origin_km)
                        dist_in_sec = max(0.0, state.distance_covered_km - curr_sched.distance_from_origin_km)
                        ratio = min(1.0, max(0.0, dist_in_sec / sec_dist))
                        
                        state.current_lat = round(curr_stn.latitude + (next_stn.latitude - curr_stn.latitude) * ratio, 4)
                        state.current_lng = round(curr_stn.longitude + (next_stn.longitude - curr_stn.longitude) * ratio, 4)
                        
                        # Check if arrived at next station
                        if ratio >= 0.98 and state.next_station_code != schedules[-1].station_code:
                            # Advance to next station
                            next_idx = schedules.index(next_sched)
                            if next_idx + 1 < len(schedules):
                                state.current_station_code = next_sched.station_code
                                state.next_station_code = schedules[next_idx + 1].station_code

                    # Slight operational delay variance (+/- 1 min randomly once every 10 ticks)
                    if self.total_ticks % 10 == 0:
                        drift = random.choice([-1, 0, 1])
                        state.current_delay_minutes = max(0, state.current_delay_minutes + drift)

                    state.last_updated = datetime.datetime.utcnow()
                    
                    # Calculate dynamic prediction for next station
                    pred_input = PredictionInput(
                        train_id=str(t.id),
                        train_number=t.train_number,
                        train_type=t.train_type,
                        current_station_code=state.current_station_code,
                        target_station_code=state.next_station_code,
                        current_delay_minutes=state.current_delay_minutes,
                        distance_remaining_km=max(5.0, next_sched.distance_from_origin_km - state.distance_covered_km),
                        historical_section_time_minutes=45.0,
                        time_of_day=next_sched.scheduled_arrival if next_sched.scheduled_arrival != "Dest" else "23:00",
                        day_of_week="Monday",
                        downstream_congestion="Normal" if state.current_delay_minutes < 10 else "Moderate",
                        priority_level=t.priority_level
                    )
                    prediction = predictor.predict_station_eta(pred_input)

                    updated_trains.append({
                        "train_number": t.train_number,
                        "train_name": t.train_name,
                        "current_station": state.current_station_code,
                        "next_station": state.next_station_code,
                        "current_delay_minutes": state.current_delay_minutes,
                        "distance_covered_km": round(state.distance_covered_km, 1),
                        "current_speed_kmph": state.current_speed_kmph,
                        "current_lat": state.current_lat,
                        "current_lng": state.current_lng,
                        "progress_percentage": state.progress_percentage,
                        "ai_predicted_eta": prediction.predicted_arrival,
                        "traditional_eta": prediction.traditional_eta,
                        "confidence": prediction.confidence_score,
                        "prediction_source": prediction.prediction_source
                    })

                db.commit()
                db.close()

                # Broadcast live updates to WebSocket listeners
                if self.active_websockets:
                    payload = {
                        "type": "SIMULATION_TICK",
                        "tick": self.total_ticks,
                        "simulated_time": self.simulated_clock.strftime("%H:%M:%S"),
                        "speed_multiplier": self.speed_multiplier,
                        "trains": updated_trains
                    }
                    await self.broadcast_event(payload)

            except Exception as e:
                print(f"Simulation tick error: {e}")

            await asyncio.sleep(self.tick_interval)

# Singleton simulator instance
simulator = SimulationManager()
