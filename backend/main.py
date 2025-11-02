from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import uuid


from ConnectionManager import ConnectionManager
from Player import Player
from PlayerConnection import PlayerConnection
from GameState import GameState
import uvicorn

app = FastAPI()
manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json
@app.websocket("/ws/{roomId}")
async def websocket_endpoint(websocket: WebSocket, roomId: int):
    client_id = websocket.query_params.get("clientId")
    await manager.connect(websocket, roomId, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message['type']
            msg = message['data']

            if msg_type == 'broadcast_everyone_except':
                await manager.broadcast_everyone_except(json.dumps(msg), roomId, websocket)
            elif msg_type == 'broadcast_everyone':
                await manager.broadcast_everyone(msg, roomId)
    except WebSocketDisconnect:
        await manager.disconnect_player(websocket, roomId, client_id)

@app.get('/api/get_state_game/{roomId}')
async def get_state_game(roomId: int):
    if roomId not in manager.active_connections:
        return JSONResponse(
            status_code=404,
            content={"error": "Room not found"}
        )
    


@app.post("/api/create_room")
async def create_room(request: Request):
    data = await request.json()
    name, room_allowed = data.get("name"), int(data.get("roomAllowed"))
    roomId = 100000 + len(manager.active_connections) + 1
    clientId = str(uuid.uuid4())
    manager.active_connections[roomId] = {
                "gameState": GameState(
                    hostname=name,
                    capacityLimit=room_allowed,
                    currentDrawer=None,
                    currentWord=None,
                    round=0,
                    gameInsession=False
                ),
                "players": {
                    clientId: Player(
                        name=name,
                        host=True,
                        score=0,
                        isDrawing=False,
                        hasGuessed=False,
                        correctGuesses=0
                    )
                },
                "connections": {
                    clientId: PlayerConnection(None)
                }
            }

    return { "success": True, "roomId": roomId, "clientId": clientId }

@app.post("/api/join_room")
async def join_room(request: Request):
    data = await request.json()
    name, roomId = data.get("name"), int(data.get("roomId"))
    if roomId not in manager.active_connections:
        return { "success": False, "error": "Room does not exist." }


    gameState = manager.active_connections[roomId]['gameState']
    players = manager.active_connections[roomId]['players']
    connections = manager.active_connections[roomId]['connections']

    if len(players) >= gameState.capacityLimit:
        return { "success": False, "error": "Room is full." }
    
    clientId = str(uuid.uuid4())


    if clientId not in players and clientId not in connections:
        players[clientId] = Player(
            name=name,
            host=False,
            score=0,
            isDrawing=False,
            hasGuessed=False,
            correctGuesses=0
        )
        connections[clientId] = PlayerConnection(
            None
        )
    return { "success": True, "roomId": roomId, "clientId": clientId }
    
    

if __name__ == "__main__":
    # Run with: python main.py
    uvicorn.run(app, host="127.0.0.1", port=8000)