from dataclasses import dataclass
from typing import Optional
from fastapi import WebSocket

@dataclass
class PlayerConnection:
    websocket: Optional[WebSocket] = None