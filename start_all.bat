@echo off
echo ===================================================
echo   RailPredict Full-Stack System Launcher
echo   Dynamic AI-Powered Train ETA Forecasting
echo ===================================================
echo.

echo [1/3] Starting Python FastAPI Backend on port 8000...
start "RailPredict Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting Railway Officer Control Dashboard on port 5173...
start "RailPredict Officer Dashboard" cmd /k "cd officer-dashboard && npm run dev"

echo [3/3] Starting Passenger Mobile App (Flutter Web)...
start "RailPredict Passenger App" cmd /k "cd passenger_app && flutter run -d chrome"

echo.
echo ===================================================
echo   All 3 services are launching in separate windows!
echo   - Backend API:       http://localhost:8000/docs
echo   - Officer Dashboard: http://localhost:5173
echo   - Passenger App:     Flutter Web in Chrome
echo ===================================================
pause
