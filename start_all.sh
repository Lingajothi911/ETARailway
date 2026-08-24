#!/usr/bin/env bash
echo "==================================================="
echo "  RailPredict Full-Stack System Launcher"
echo "  Dynamic AI-Powered Train ETA Forecasting"
echo "==================================================="
echo ""

echo "[1/3] Starting Python FastAPI Backend on port 8000..."
(cd backend && python3 -m uvicorn app.main:app --reload --port 8000) &

echo "[2/3] Starting Railway Officer Control Dashboard on port 5173..."
(cd officer-dashboard && npm run dev) &

echo "[3/3] Starting Passenger Mobile App (Flutter Web)..."
(cd passenger_app && flutter run -d chrome) &

echo ""
echo "Services launched in background."
echo "- Backend API:       http://localhost:8000/docs"
echo "- Officer Dashboard: http://localhost:5173"
echo "- Passenger App:     Flutter Web in Chrome"

wait
