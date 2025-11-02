from dataclasses import dataclass
from typing import Optional
@dataclass
class GameState: 
    hostname: str
    capacityLimit: int
    round: int
    gameInsession: bool
    currentDrawer: Optional[str] = None
    currentWord: Optional[str] = None