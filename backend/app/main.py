import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import trains, stations, officer, simulation, auth, websocket
from app.services.seed_service import seed_database
from app.services.simulation_service import simulator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_SUBTITLE} - Full-Stack Prototype for Indian Railways Coaching Trains",
    version="1.0.0"
)

# Enable CORS for React Dashboard & Flutter Web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(trains.router, prefix=settings.API_V1_STR)
app.include_router(stations.router, prefix=settings.API_V1_STR)
app.include_router(officer.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)

@app.on_event("startup")
def on_startup():
    """Seed database on first startup and initialize demo simulator."""
    seed_database()
    # Start simulator in the background with 5x speed for instant live experience
    simulator.start(speed=5)
    print("RailPredict FastAPI Backend initialized with Live Simulation Engine.")

@app.get("/")
def root_info():
    return {
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "status": "Operational",
        "api_docs": "/docs",
        "simulation_running": simulator.is_running,
        "simulation_speed": f"{simulator.speed_multiplier}x"
    }
