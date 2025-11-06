from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import uuid


from ConnectionManager import ConnectionManager
from DatabaseForGame import GameDatabase
from Player import Player
from PlayerConnection import PlayerConnection

from GameState import GameState
from dataclasses import asdict
import uvicorn

app = FastAPI()
manager = ConnectionManager()
gameDatabase = GameDatabase()

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
    players = manager.active_connections[roomId]['players']
    gameState = manager.active_connections[roomId]['gameState']
    
    # Convert to Json
    players_dict = {clientId: asdict(player) for clientId, player in players.items()}
    game_state_dict = asdict(gameState)

    await manager.broadcast_everyone(
        message=json.dumps({
            "type": 'update_game',
            "gameState": game_state_dict,
            "players": players_dict
        }),
        roomId=roomId
    )
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message['type']
            msg = message['data']
            if msg_type == 'drawing': # This is used in drawer to everyone about current drawing stroke
                await manager.broadcast_everyone_except(json.dumps(msg), roomId, websocket)
            elif msg_type == 'clearing':
                await manager.broadcast_everyone_except(json.dumps(msg), roomId, websocket)
            elif msg_type == 'answer_correct':
                clientId, score = msg['clientId'], msg['score']
                players = manager.active_connections[roomId]['players']

                players[clientId].score += score
                players[clientId].hasGuessed = True

                gameState = asdict(manager.active_connections[roomId]['gameState'])
                players = {clientId: asdict(player) for clientId, player in players.items()}

                msg = {
                    'type': 'update_game',
                    'gameState': gameState,
                    'players': players
                }
                await manager.broadcast_everyone(json.dumps(msg), roomId)
            elif msg_type == 'round_ended': # Drawer to everyone about the current has ended, server respond back
                round_reset(roomId)
                gameState = asdict(manager.active_connections[roomId]['gameState'])
                players = {clientId: asdict(player) for clientId, player in players.items()}
                msg = {
                    'type': 'update_game',
                    'gameState': gameState,
                    'players': players
                }
                print(msg)
                await manager.broadcast_everyone(json.dumps(msg), roomId)
            elif msg_type == 'game_start':
                game_start(roomId)
                msg = {
                    'type': 'game_start',
                    'gameState': asdict(manager.active_connections[roomId]['gameState'])
                }
                await manager.broadcast_everyone(json.dumps(msg), roomId)
            elif msg_type == 'host_close':
                msg = {
                    'type': 'host_close'
                }
                await manager.broadcast_everyone_except(json.dumps(msg), roomId, websocket)
            elif msg_type == 'player_close':
                clientId = msg['clientId']
                playerName = manager.active_connections[roomId]['players'][clientId].name
                await manager.remove_player(websocket, roomId, clientId)
                gameState = asdict(manager.active_connections[roomId]['gameState'])
                players = {clientId: asdict(player) for clientId, player in players.items()}
                msg = {
                    'type': 'player_close',
                    'gameState': gameState,
                    'players': players,
                    'closePlayer': playerName,
                }
                await manager.broadcast_everyone(json.dumps(msg), roomId)
                break
            elif msg_type == 'remove_room':
                await manager.remove_room(roomId)
                break
                
    except WebSocketDisconnect:
        await manager.disconnect_player(websocket, roomId, client_id)

def round_reset(roomId):
    if roomId not in manager.active_connections:
        return
    gameState = manager.active_connections[roomId]['gameState']

    
    gameState.gameInsession = False
    gameState.currentCategory = None
    gameState.currentWord = None
    gameState.currentDrawer = None

def game_start(roomId):
    import random
    gameState = manager.active_connections[roomId]['gameState']
    players = manager.active_connections[roomId]['players']

    gameState.round += 1
    gameState.gameInsession = True
    gameState.currentDrawer = random.choice(list(players.keys()))
    category, word = gameDatabase.getCategoryAndWord()
    gameState.currentCategory = category
    gameState.currentWord = word


@app.post("/api/create_room")
async def create_room(request: Request):
    data = await request.json()
    name, room_allowed = data.get("name"), int(data.get("roomAllowed"))
    roomId = 100000 + len(manager.active_connections) + 1
    clientId = str(uuid.uuid4())
    manager.active_connections[roomId] = {
                "gameState": GameState(
                    hostId=clientId,
                    capacityLimit=room_allowed,
                    round=0,
                    gameInsession=False,
                    currentDrawer=None,
                    currentCategory=None,
                    currentWord=None
                ),
                "players": {
                    clientId: Player(
                        name=name,
                        score=0,
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
            score=0,
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