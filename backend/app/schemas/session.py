from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
import re

class SessionBase(BaseModel):
    id_chapter: int
    mode: Optional[str] = 'classic'
    started_at: datetime
    completed_at: datetime
    wpm: float
    accuracy: float
    total_keystrokes: int
    error_count: int

class SessionResponse(SessionBase):
    id_typing: int
    id_user: int

    class Config:
        from_attributes=True

class SessionStats(BaseModel):
    total_sessions: int = Field(ge=0)
    avg_wpm: float = Field(ge=0, le=400)
    avg_accuracy: float = Field(ge= 0, le=100)
    total_errors: int = Field(ge=0)
    best_wpm: float = Field(ge=0, le=400)
    total_time: int = Field(ge=0)

class SessionFilter(BaseModel):
    start_date: date | None = None
    end_date: date | None =None
    mode: enumerate | None = None

    
    
