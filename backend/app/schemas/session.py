from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
import re

class SessionBase(BaseModel):
    id_chapter: int = Field(..., description="ID del capítulo practicado")
    mode: Optional[str] = Field("classic", description="Modo de práctica")
    wpm: float = Field(..., gt=0, description="Palabras por minuto")
    accuracy: float = Field(..., ge=0, le=100, description="Precisión (0-100)")
    total_keystrokes: int = Field(..., gt=0, description="Total de tecleos")
    error_count: int = Field(..., ge=0, description="Número de errores")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    @validator('accuracy')
    def validate_accuracy(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Accuracy debe estar entre 0 y 100')
        return v
    
    @validator('mode')
    def validate_mode(cls, v):
        allowed_modes = ['classic', 'timed', 'custom', 'speed']
        if v and v.lower() not in allowed_modes:
            raise ValueError(f'Mode debe ser uno de: {", ".join(allowed_modes)}')
        return v
class SessionResponse(BaseModel):
    id_typing: int
    id_user: int
    id_chapter: int
    mode: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    wpm: float
    accuracy: float
    total_keystrokes: int
    error_count: int
    
    class Config:
        from_attributes = True

class SessionStats(BaseModel):
    total_sessions: int = Field(ge=0)
    avg_wpm: float = Field(ge=0, le=400)
    avg_accuracy: float = Field(ge= 0, le=100)
    total_errors: int = Field(ge=0)
    best_wpm: float = Field(ge=0, le=400)
    total_time: int = Field(ge=0, description="Tiempo total en minutos")

class SessionFilter(BaseModel):
    start_date: date | None = None
    end_date: date | None =None
    mode: Optional[str] | None = None

    
    
