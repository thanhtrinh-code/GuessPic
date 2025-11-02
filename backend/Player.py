from dataclasses import dataclass
from typing import Optional
@dataclass
class Player:
    name: str
    host: bool
    score: int
    isDrawing: bool
    hasGuessed: bool
    correctGuesses: int
