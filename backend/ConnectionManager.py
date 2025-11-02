from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections = {} # { roomId: { "players": {}, "connections": {}, "gameState": GameState } }

    async def connect(self, websocket: WebSocket, roomId: int, clientId: str):
        await websocket.accept()
        connections = self.active_connections[roomId]['connections']
        connections[clientId] = websocket

    async def disconnect_player(self, websocket: WebSocket, roomId: int, clientId: str):
        players = self.active_connections[roomId]['players']
        connections = self.active_connections[roomId]['connections']

        if clientId in players:
            del players[clientId]
        if clientId in connections:
            del connections[clientId]

        await self.broadcast_everyone_except(
            message=f"Client #{clientId} disconnected.", 
            roomId=roomId, 
            websocket=websocket
        )
        try:
            await websocket.close()
        except Exception:
            pass  

    async def broadcast_everyone(self, message: str, roomId: int):
        if roomId in self.active_connections:
            connections = self.active_connections[roomId]['connections']
            for ws in connections.values():
                try:
                    await ws.send_text(message)
                except Exception:
                    pass  

    async def broadcast_everyone_except(self, message: str, roomId: int, websocket: WebSocket):
        if roomId in self.active_connections:
            connections = self.active_connections[roomId]['connections']
            for ws in connections.values():
                if ws != websocket:
                    try:
                        await ws.send_text(message)
                    except Exception:
                        pass  

