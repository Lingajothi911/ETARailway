# RailPredict: Dynamic AI-Powered Train ETA Forecasting for Indian Railways

> **College AI/ML Hackathon Full-Stack Prototype**  
> Southern & South Western Corridor Demonstration (MAS ↔ SBC)

---

## 1. Product Vision & Innovation

### The Traditional Approach vs RailPredict

```
TRADITIONAL TRAIN TRACKING:
Scheduled Time + Current Delay = Static Arrival Estimate
(Ignores section speed buffers, green-wave clearing, congestion, and rake priority)

RAILPREDICT DYNAMIC FORECASTING:
Historical Section Profiles + Current Delay + Rake Priority + Downstream Line Density + Dwell Variance
   → Pluggable ML Prediction Engine
   → Dynamic, Adaptive ETA/ETD with Explainability Factors
   → Real-Time Platform Overlap Conflict Detection for Dispatch Controllers
```

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├──────────────────────────────┬──────────────────────────────┤
│    Passenger Mobile App      │  Railway Officer Dashboard   │
│       (Flutter / Dart)       │   (React + TypeScript + Vite)│
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │ REST APIs & WebSockets
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                     │
├─────────────────────────────────────────────────────────────┤
│  • REST API Endpoints (/api/trains, /api/officer, etc.)     │
│  • Live Simulation Manager (1x, 5x, 15x speeds)             │
│  • Platform Conflict & Safety Overlap Engine                │
│  • SQLAlchemy ORM (Corridor Schedules, Live Telemetry)      │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             Pluggable ML Prediction Architecture            │
├─────────────────────────────────────────────────────────────┤
│  • BaseETAPredictor (Standard Interface)                    │
│  • MockETAPredictor (Dynamic Simulation Heuristic)          │
│  • RealMLPredictor (Hot-swappable for XGBoost/LGBM/LSTM)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```
railpredict/
├── backend/
│   ├── app/
│   │   ├── api/             # REST & WebSocket routers (trains, officer, simulation, auth)
│   │   ├── core/            # Config & JWT security
│   │   ├── ml/              # BaseETAPredictor, MockETAPredictor, RealMLPredictor
│   │   ├── models/          # SQLAlchemy models (Train, Station, Schedule, PlatformConflict)
│   │   ├── schemas/         # Pydantic DTOs
│   │   ├── services/        # Simulation engine & Indian Railways database seed
│   │   └── main.py          # FastAPI application entry point
│   ├── requirements.txt
│   └── test_backend.py      # Automated API verification test suite
│
├── officer-dashboard/       # Railway Officer Control Room (React + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # LiveFleetTable, OperationalRailMap, PlatformConflictPanel, etc.
│   │   ├── services/        # Backend API client
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Control room main view
│   └── package.json
│
└── passenger_app/           # Passenger Mobile Application (Flutter + Material 3)
    ├── lib/
    │   ├── models/          # Data models
    │   ├── screens/         # Splash, Home, TrainDetails, StationBoard, Settings
    │   ├── services/        # API client & local persistent storage
    │   ├── widgets/         # AiEtaCard (Hero Differentiator), JourneyTimeline, CoachLayout
    │   └── main.dart        # Flutter entry point
    └── pubspec.yaml
```

---

## 4. How to Run

### Step 1: Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Root Info & Live Status: `http://localhost:8000/`

### Step 2: Start the Railway Officer Dashboard
```bash
cd officer-dashboard
npm run dev
```
- Open browser at `http://localhost:5173`
- Default Officer Credentials: `officer@railpredict.in` / `officer123`

### Step 3: Run the Passenger Mobile App
```bash
cd passenger_app
flutter run -d chrome # (Or flutter run for connected Android device/emulator)
```

---

## 5. Key Demo Features & Walkthrough

1. **AI ETA vs Traditional Estimate Hero Card**:
   - For any train (e.g. `12627 Karnataka Express`), view Scheduled Arrival, Traditional Estimate (`23:06`), and **AI Dynamic Predicted Arrival (`23:01`)** with a clear breakdown of delay recovery factors.
2. **"Why is this ETA?" Explainability Drawer**:
   - Transparently explains why the prediction differs (e.g. historical section speed buffer, priority green signal wave, downstream congestion).
3. **Live Simulation Controls**:
   - Toggle speed multipliers (`1x`, `5x`, `15x`), pause, and reset live train movement.
4. **Disruption & Delay Injection**:
   - Click **"Inject Operational Delay"** to inject +15 min delay and watch the dynamic ETA recalculate across all stations in real-time.
5. **Intelligent Platform Conflict Resolution**:
   - Detects unsafe overlapping train dwell times at Katpadi Junction Platform 2 and suggests reassignment to Platform 4 with one-click approval.
