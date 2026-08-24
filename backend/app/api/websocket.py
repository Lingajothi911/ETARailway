import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.simulation_service import simulator

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/live")
async def live_telemetry_stream(websocket: WebSocket):
    """
    WebSocket channel for live train movement, dynamic ETA recalculation,
    and platform conflict alert broadcasts.
    """
    await websocket.accept()
    simulator.register_websocket(websocket)
    
    # Send initial snapshot
    await websocket.send_json({
        "type": "INITIAL_HANDSHAKE",
        "message": "Connected to RailPredict Live Telemetry Stream",
        "speed_multiplier": simulator.speed_multiplier,
        "is_running": simulator.is_running,
        "simulated_time": simulator.simulated_clock.strftime("%H:%M:%S")
    })
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ping/pong or client commands if any
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_json({"type": "pong"})
            except Exception:
                pass
    except WebSocketDisconnect:
        simulator.unregister_websocket(websocket)
    except Exception:
        simulator.unregister_websocket(websocket)
