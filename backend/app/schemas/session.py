from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re

class SessionBase(BaseModel):
    id_chapter: int = Field(..., description="ID del capítulo practicado")
    id_mode: int = Field("classic", description="Modo de práctica") 
    wpm: float = Field(..., gt=0, description="Palabras por minuto")
    accuracy: float = Field(..., ge=0, le=100, description="Precisión (0-100)")
    total_keystrokes: int = Field(..., gt=0, description="Total de tecleos")
    error_count: int = Field(..., ge=0, description="Número de errores")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    language: str = Field("es", description="Idioma")
    duration_secons: Optional[int] = None
    character_count: Optional[int]=None

    @validator('accuracy')
    def validate_accuracy(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Accuracy debe estar entre 0 y 100')
        return v
    


class SessionResponse(BaseModel):
    id_typing: int
    id_user: int
    id_chapter: int
    id_mode: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    wpm: float
    accuracy: float
    total_keystrokes: int
    error_count: int
    language: str
    
    class Config:
        from_attributes = True

class SessionStats(BaseModel):
    total_sessions: int = Field(ge=0)
    avg_wpm: float = Field(ge=0, le=400)
    avg_accuracy: float = Field(ge=0, le=100)
    total_errors: int = Field(ge=0)
    best_wpm: float = Field(ge=0, le=400)
    total_time: int = Field(ge=0, description="Tiempo total en minutos")

class SessionFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    mode: Optional[str] = None
