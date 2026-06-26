from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re

class SessionBase(BaseModel):
    id_chapter: int
    mode: Optional[str] = 'classic'
    starded_at: datetime
    completed_at: datetime
    wpm: float
    accuracy: float
    total_keystrockes: int
    error_count: int

class SessionResponse(SessionBase):
    id_typing: int
    id_user: int
    id_chapter: int
    mode: str = 'classic'
    starded_at: datetime
    completed_at: datetime
    wpm: float
    accuracy: float
    total_keystrockes: int
    error_count: int

    class Config:
        from_attributes=True
