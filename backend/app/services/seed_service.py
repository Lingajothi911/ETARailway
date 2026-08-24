import datetime
from sqlalchemy.orm import Session
from app.models.database import SessionLocal, engine, Base
from app.models.schema_models import (
    Station, Train, RouteSection, TrainStationSchedule,
    TrainLiveState, Prediction, Platform, PlatformConflict,
    Alert, PredictionEvaluation, Coach, OfficerUser
)
from app.core.config import settings

def get_password_hash(password: str) -> str:
    # Use sha256 or bcrypt for simple demo auth
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database():
    """Initializes and seeds the database with realistic Indian Railways demo corridor data."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(Train).first():
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding RailPredict database...")

    # 1. Stations
    stations_data = [
        {"code": "MAS", "name": "Puratchi Thalaivar Dr. M.G.R. Chennai Central", "latitude": 13.0827, "longitude": 80.2707, "division": "MAS", "zone": "SR", "total_platforms": 12},
        {"code": "AJJ", "name": "Arakkonam Junction", "latitude": 13.0847, "longitude": 79.6698, "division": "MAS", "zone": "SR", "total_platforms": 5},
        {"code": "KPD", "name": "Katpadi Junction", "latitude": 12.9818, "longitude": 79.1350, "division": "MAS", "zone": "SR", "total_platforms": 5},
        {"code": "JTJ", "name": "Jolarpettai Junction", "latitude": 12.5574, "longitude": 78.5833, "division": "MAS", "zone": "SR", "total_platforms": 5},
        {"code": "BWT", "name": "Bangarapet Junction", "latitude": 12.9967, "longitude": 78.1969, "division": "SBC", "zone": "SWR", "total_platforms": 4},
        {"code": "KJM", "name": "Krishnarajapuram", "latitude": 12.9944, "longitude": 77.6780, "division": "SBC", "zone": "SWR", "total_platforms": 4},
        {"code": "BNC", "name": "Bengaluru Cant.", "latitude": 12.9926, "longitude": 77.5986, "division": "SBC", "zone": "SWR", "total_platforms": 3},
        {"code": "SBC", "name": "KSR Bengaluru City Junction", "latitude": 12.9781, "longitude": 77.5696, "division": "SBC", "zone": "SWR", "total_platforms": 10},
        {"code": "SA", "name": "Salem Junction", "latitude": 11.6643, "longitude": 78.1460, "division": "SA", "zone": "SR", "total_platforms": 5},
        {"code": "ED", "name": "Erode Junction", "latitude": 11.3410, "longitude": 77.7172, "division": "SA", "zone": "SR", "total_platforms": 4},
        {"code": "CBE", "name": "Coimbatore Junction", "latitude": 11.0016, "longitude": 76.9629, "division": "SA", "zone": "SR", "total_platforms": 6},
    ]

    for s in stations_data:
        station_obj = Station(**s)
        db.add(station_obj)
        db.flush()

        # Create platforms for station
        for p_num in range(1, s["total_platforms"] + 1):
            plat = Platform(
                station_code=s["code"],
                platform_number=str(p_num),
                is_occupied=False,
                status="Free"
            )
            db.add(plat)
    
    # 2. Route Sections & Congestion
    sections = [
        {"from_station_code": "MAS", "to_station_code": "AJJ", "distance_km": 68.0, "max_speed_kmph": 110.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "AJJ", "to_station_code": "KPD", "distance_km": 61.0, "max_speed_kmph": 110.0, "current_congestion": "Moderate", "congestion_delay_factor": 2.5},
        {"from_station_code": "KPD", "to_station_code": "JTJ", "distance_km": 84.0, "max_speed_kmph": 110.0, "current_congestion": "Heavy", "congestion_delay_factor": 4.5},
        {"from_station_code": "JTJ", "to_station_code": "BWT", "distance_km": 75.0, "max_speed_kmph": 100.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "BWT", "to_station_code": "KJM", "distance_km": 55.0, "max_speed_kmph": 90.0, "current_congestion": "Moderate", "congestion_delay_factor": 2.0},
        {"from_station_code": "KJM", "to_station_code": "BNC", "distance_km": 9.0, "max_speed_kmph": 60.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "BNC", "to_station_code": "SBC", "distance_km": 4.0, "max_speed_kmph": 40.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "JTJ", "to_station_code": "SA", "distance_km": 120.0, "max_speed_kmph": 110.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "SA", "to_station_code": "ED", "distance_km": 60.0, "max_speed_kmph": 110.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
        {"from_station_code": "ED", "to_station_code": "CBE", "distance_km": 100.0, "max_speed_kmph": 110.0, "current_congestion": "Normal", "congestion_delay_factor": 0.0},
    ]
    for sec in sections:
        db.add(RouteSection(**sec))

    # 3. Trains & Schedules
    trains_data = [
        {
            "train_number": "12627",
            "train_name": "Karnataka Express",
            "train_type": "Superfast Express",
            "source_station_code": "MAS",
            "dest_station_code": "SBC",
            "total_distance_km": 356.0,
            "priority_level": "High",
            "delay": 18,
            "current_station": "AJJ",
            "next_station": "KPD",
            "dist_cov": 95.0,
            "speed": 82.0,
            "lat": 13.0400,
            "lng": 79.4100,
            "schedules": [
                {"code": "MAS", "seq": 1, "arr": "Source", "dep": "21:00", "dist": 0.0, "plat": "2"},
                {"code": "AJJ", "seq": 2, "arr": "21:58", "dep": "22:00", "dist": 68.0, "plat": "1"},
                {"code": "KPD", "seq": 3, "arr": "22:48", "dep": "22:50", "dist": 129.0, "plat": "2"},
                {"code": "JTJ", "seq": 4, "arr": "00:08", "dep": "00:10", "dist": 213.0, "plat": "3"},
                {"code": "BWT", "seq": 5, "arr": "01:18", "dep": "01:20", "dist": 288.0, "plat": "2"},
                {"code": "KJM", "seq": 6, "arr": "02:08", "dep": "02:10", "dist": 343.0, "plat": "4"},
                {"code": "BNC", "seq": 7, "arr": "02:28", "dep": "02:30", "dist": 352.0, "plat": "1"},
                {"code": "SBC", "seq": 8, "arr": "02:50", "dep": "Dest", "dist": 356.0, "plat": "5"}
            ],
            "coaches": [
                ("ENG", "WAP-7 Electric Locomotive"),
                ("GEN", "Unreserved General Coach"),
                ("S1", "Sleeper Class (SL)"),
                ("S2", "Sleeper Class (SL)"),
                ("S3", "Sleeper Class (SL)"),
                ("S4", "Sleeper Class (SL)"),
                ("B1", "AC 3 Tier (3A)"),
                ("B2", "AC 3 Tier (3A)"),
                ("B3", "AC 3 Tier (3A)"),
                ("A1", "AC 2 Tier (2A)"),
                ("A2", "AC 2 Tier (2A)"),
                ("H1", "AC First Class (1A)"),
                ("GEN", "Unreserved General & Luggage (SLR)")
            ]
        },
        {
            "train_number": "20607",
            "train_name": "Vande Bharat Express",
            "train_type": "Vande Bharat Express",
            "source_station_code": "MAS",
            "dest_station_code": "SBC",
            "total_distance_km": 356.0,
            "priority_level": "Critical",
            "delay": 2,
            "current_station": "KPD",
            "next_station": "JTJ",
            "dist_cov": 170.0,
            "speed": 115.0,
            "lat": 12.7800,
            "lng": 78.8500,
            "schedules": [
                {"code": "MAS", "seq": 1, "arr": "Source", "dep": "05:50", "dist": 0.0, "plat": "8"},
                {"code": "KPD", "seq": 2, "arr": "07:13", "dep": "07:15", "dist": 129.0, "plat": "1"},
                {"code": "JTJ", "seq": 3, "arr": "08:18", "dep": "08:20", "dist": 213.0, "plat": "1"},
                {"code": "BWT", "seq": 4, "arr": "09:08", "dep": "09:10", "dist": 288.0, "plat": "1"},
                {"code": "KJM", "seq": 5, "arr": "09:50", "dep": "09:52", "dist": 343.0, "plat": "2"},
                {"code": "SBC", "seq": 6, "arr": "10:15", "dep": "Dest", "dist": 356.0, "plat": "7"}
            ],
            "coaches": [
                ("ENG", "Aerodynamic Driver Trailer Coach (DTC)"),
                ("C1", "AC Chair Car (CC)"),
                ("C2", "AC Chair Car (CC)"),
                ("C3", "AC Chair Car (CC)"),
                ("C4", "AC Chair Car (CC)"),
                ("E1", "Executive Chair Car (EC)"),
                ("C5", "AC Chair Car (CC)"),
                ("ENG", "Driver Trailer Coach (DTC)")
            ]
        },
        {
            "train_number": "12007",
            "train_name": "Chennai - Mysuru Shatabdi Express",
            "train_type": "Shatabdi Express",
            "source_station_code": "MAS",
            "dest_station_code": "SBC",
            "total_distance_km": 356.0,
            "priority_level": "Critical",
            "delay": 5,
            "current_station": "MAS",
            "next_station": "AJJ",
            "dist_cov": 35.0,
            "speed": 98.0,
            "lat": 13.0830,
            "lng": 79.9500,
            "schedules": [
                {"code": "MAS", "seq": 1, "arr": "Source", "dep": "06:00", "dist": 0.0, "plat": "1"},
                {"code": "AJJ", "seq": 2, "arr": "06:48", "dep": "06:50", "dist": 68.0, "plat": "2"},
                {"code": "KPD", "seq": 3, "arr": "07:38", "dep": "07:40", "dist": 129.0, "plat": "1"},
                {"code": "JTJ", "seq": 4, "arr": "08:48", "dep": "08:50", "dist": 213.0, "plat": "2"},
                {"code": "BWT", "seq": 5, "arr": "09:43", "dep": "09:45", "dist": 288.0, "plat": "3"},
                {"code": "BNC", "seq": 6, "arr": "10:33", "dep": "10:35", "dist": 352.0, "plat": "2"},
                {"code": "SBC", "seq": 7, "arr": "10:50", "dep": "Dest", "dist": 356.0, "plat": "6"}
            ],
            "coaches": [
                ("ENG", "WAP-7 High Speed"),
                ("C1", "AC Chair Car"),
                ("C2", "AC Chair Car"),
                ("C3", "AC Chair Car"),
                ("C4", "AC Chair Car"),
                ("E1", "Executive Class"),
                ("C5", "AC Chair Car"),
                ("EOG", "End On Generation Power Van")
            ]
        },
        {
            "train_number": "16021",
            "train_name": "Kaveri Express",
            "train_type": "Express",
            "source_station_code": "MAS",
            "dest_station_code": "SBC",
            "total_distance_km": 356.0,
            "priority_level": "Normal",
            "delay": 14,
            "current_station": "AJJ",
            "next_station": "KPD",
            "dist_cov": 88.0,
            "speed": 65.0,
            "lat": 13.0600,
            "lng": 79.3500,
            "schedules": [
                {"code": "MAS", "seq": 1, "arr": "Source", "dep": "21:15", "dist": 0.0, "plat": "5"},
                {"code": "AJJ", "seq": 2, "arr": "22:18", "dep": "22:20", "dist": 68.0, "plat": "3"},
                {"code": "KPD", "seq": 3, "arr": "23:08", "dep": "23:10", "dist": 129.0, "plat": "2"}, # Note: Platform 2 conflict with 12627!
                {"code": "JTJ", "seq": 4, "arr": "00:38", "dep": "00:40", "dist": 213.0, "plat": "1"},
                {"code": "BWT", "seq": 5, "arr": "01:48", "dep": "01:50", "dist": 288.0, "plat": "1"},
                {"code": "KJM", "seq": 6, "arr": "02:38", "dep": "02:40", "dist": 343.0, "plat": "3"},
                {"code": "BNC", "seq": 7, "arr": "03:00", "dep": "03:02", "dist": 352.0, "plat": "2"},
                {"code": "SBC", "seq": 8, "arr": "03:30", "dep": "Dest", "dist": 356.0, "plat": "4"}
            ],
            "coaches": [
                ("ENG", "WAP-4 Electric"),
                ("GEN", "General Unreserved"),
                ("S1", "Sleeper Class"),
                ("S2", "Sleeper Class"),
                ("S3", "Sleeper Class"),
                ("B1", "AC 3 Tier"),
                ("A1", "AC 2 Tier"),
                ("GEN", "General Unreserved")
            ]
        },
        {
            "train_number": "12675",
            "train_name": "Kovai Superfast Express",
            "train_type": "Superfast Express",
            "source_station_code": "MAS",
            "dest_station_code": "CBE",
            "total_distance_km": 495.0,
            "priority_level": "High",
            "delay": 8,
            "current_station": "JTJ",
            "next_station": "SA",
            "dist_cov": 260.0,
            "speed": 86.0,
            "lat": 12.1500,
            "lng": 78.3600,
            "schedules": [
                {"code": "MAS", "seq": 1, "arr": "Source", "dep": "06:10", "dist": 0.0, "plat": "9"},
                {"code": "AJJ", "seq": 2, "arr": "07:08", "dep": "07:10", "dist": 68.0, "plat": "1"},
                {"code": "KPD", "seq": 3, "arr": "07:58", "dep": "08:00", "dist": 129.0, "plat": "1"},
                {"code": "JTJ", "seq": 4, "arr": "09:18", "dep": "09:20", "dist": 213.0, "plat": "2"},
                {"code": "SA", "seq": 5, "arr": "10:52", "dep": "10:55", "dist": 333.0, "plat": "4"},
                {"code": "ED", "seq": 6, "arr": "11:55", "dep": "12:00", "dist": 393.0, "plat": "3"},
                {"code": "CBE", "seq": 7, "arr": "13:30", "dep": "Dest", "dist": 495.0, "plat": "2"}
            ],
            "coaches": [
                ("ENG", "WAP-7 Electric"),
                ("GEN", "Second Sitting"),
                ("D1", "Second Sitting (2S)"),
                ("D2", "Second Sitting (2S)"),
                ("C1", "AC Chair Car"),
                ("C2", "AC Chair Car"),
                ("GEN", "Second Sitting")
            ]
        }
    ]

    for t_data in trains_data:
        train_obj = Train(
            train_number=t_data["train_number"],
            train_name=t_data["train_name"],
            train_type=t_data["train_type"],
            source_station_code=t_data["source_station_code"],
            dest_station_code=t_data["dest_station_code"],
            total_distance_km=t_data["total_distance_km"],
            priority_level=t_data["priority_level"],
            is_active=True
        )
        db.add(train_obj)
        db.flush()

        # Live State
        live_state = TrainLiveState(
            train_id=train_obj.id,
            current_station_code=t_data["current_station"],
            next_station_code=t_data["next_station"],
            current_status="Running" if t_data["delay"] < 15 else "Delayed",
            current_delay_minutes=t_data["delay"],
            distance_covered_km=t_data["dist_cov"],
            current_speed_kmph=t_data["speed"],
            current_lat=t_data["lat"],
            current_lng=t_data["lng"],
            progress_percentage=round((t_data["dist_cov"] / t_data["total_distance_km"]) * 100, 1),
            last_updated=datetime.datetime.utcnow(),
            is_simulated=True
        )
        db.add(live_state)

        # Schedules
        for s in t_data["schedules"]:
            sched = TrainStationSchedule(
                train_id=train_obj.id,
                station_code=s["code"],
                sequence_number=s["seq"],
                scheduled_arrival=s["arr"],
                scheduled_departure=s["dep"],
                distance_from_origin_km=s["dist"],
                scheduled_platform=s["plat"]
            )
            db.add(sched)

        # Coaches
        for seq, (c_code, c_type) in enumerate(t_data["coaches"], start=1):
            coach = Coach(
                train_id=train_obj.id,
                coach_code=c_code,
                coach_type=c_type,
                sequence_number=seq,
                description=f"Coach #{seq} ({c_code})"
            )
            db.add(coach)

    # 4. Platform Conflict Seed (Intelligent Feature)
    conflict = PlatformConflict(
        station_code="KPD",
        station_name="Katpadi Junction",
        platform_number="2",
        train1_number="12627",
        train1_name="Karnataka Express",
        train1_eta="23:06",
        train2_number="16021",
        train2_name="Kaveri Express",
        train2_eta="23:12",
        overlap_minutes=6,
        suggested_platform="4",
        recommendation_reason="AI Conflict Detector: Train 12627 and Train 16021 predicted to arrive within 6 minutes on Platform 2. Platform 4 has zero scheduled occupancy between 22:30 and 23:45.",
        is_resolved=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(conflict)

    # 5. Operational Alerts
    alerts = [
        Alert(
            train_number="12627",
            station_code="KPD",
            severity="WARNING",
            title="Dynamic ETA Adjusted (Delay Recovery)",
            description="Karnataka Express dynamic ETA to Katpadi updated to 23:06 (+18m delay reduced to +16m due to clear section speed profile).",
            recommended_action="Prepare Platform 2 for arrival at 23:06.",
            is_acknowledged=False,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=3)
        ),
        Alert(
            train_number="16021",
            station_code="KPD",
            severity="CRITICAL",
            title="Platform Conflict Detected",
            description="Potential overlap with 12627 on Platform 2 at Katpadi. Predicted safety buffer violation (6 min overlap).",
            recommended_action="Reassign Train 16021 to Platform 4 (Free).",
            is_acknowledged=False,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        ),
        Alert(
            train_number="20607",
            station_code="JTJ",
            severity="INFO",
            title="Green Corridor Clearance Maintained",
            description="Vande Bharat Express running on-time (delay 2m). Approaching Jolarpettai Junction on schedule.",
            recommended_action="Maintain main through-line signal priority.",
            is_acknowledged=True,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=12)
        )
    ]
    for a in alerts:
        db.add(a)

    # 6. Historical Evaluation Records (For Analytics Recharts)
    eval_records = [
        ("12627", "AJJ", "MAS-AJJ", "21:58", "22:15", "22:14", "22:18", 1.0, 3.0),
        ("12627", "KPD", "AJJ-KPD", "22:48", "23:05", "23:06", "23:14", 1.0, 9.0),
        ("12007", "AJJ", "MAS-AJJ", "06:48", "06:52", "06:53", "06:56", 1.0, 4.0),
        ("12007", "KPD", "AJJ-KPD", "07:38", "07:42", "07:43", "07:48", 1.0, 6.0),
        ("20607", "KPD", "MAS-KPD", "07:13", "07:15", "07:15", "07:18", 0.0, 3.0),
        ("20607", "JTJ", "KPD-JTJ", "08:18", "08:20", "08:21", "08:27", 1.0, 7.0),
        ("16021", "AJJ", "MAS-AJJ", "22:18", "22:31", "22:30", "22:36", 1.0, 5.0),
        ("12675", "AJJ", "MAS-AJJ", "07:08", "07:16", "07:15", "07:22", 1.0, 6.0),
        ("12675", "KPD", "AJJ-KPD", "07:58", "08:06", "08:05", "08:14", 1.0, 8.0),
        ("12675", "JTJ", "KPD-JTJ", "09:18", "09:27", "09:26", "09:34", 1.0, 7.0),
        ("12627", "JTJ", "KPD-JTJ", "00:08", "00:23", "00:22", "00:32", 1.0, 9.0),
        ("12627", "BWT", "JTJ-BWT", "01:18", "01:31", "01:30", "01:42", 1.0, 11.0),
    ]
    for r in eval_records:
        rec = PredictionEvaluation(
            train_number=r[0],
            station_code=r[1],
            section_name=r[2],
            scheduled_arrival=r[3],
            actual_arrival=r[4],
            predicted_arrival=r[5],
            traditional_arrival=r[6],
            ml_error_minutes=r[7],
            traditional_error_minutes=r[8],
            recorded_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        db.add(rec)

    # 7. Officer User
    officer = OfficerUser(
        email="officer@railpredict.in",
        hashed_password=get_password_hash("officer123"),
        full_name="Rajesh Sharma",
        role="Senior Section Controller",
        division="Southern Railway - Chennai & Bangalore Division",
        is_active=True
    )
    db.add(officer)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
