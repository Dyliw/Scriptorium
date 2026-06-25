from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.schemas.chapter import ChapterResponse

class BookBase(BaseModel):
    title_en: Optional[str] = Field(None, max_length=200)
    title_es: Optional[str] = Field(None, max_length=200)
    title_de: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=250)
    description_en: Optional[str] = None
    description_es: Optional[str] = None
    description_de: Optional[str] = None

class BookCreate(BookBase):
    @validator('title_en', 'title_es', 'title_de')
    def at_least_one_title(cls, v, values):
        if not any([values.get('title_en'), values.get('title_es'), values.get('title_de')]):
            raise ValueError('Al menos un título es requerido')
        return v
    
class BookUpdate(BaseModel):
    title_en: Optional[str] = Field(None, max_length=200)
    title_es: Optional[str] = Field(None, max_length=200)
    title_de: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=250)
    description_en: Optional[str] = None
    description_es: Optional[str] = None
    description_de: Optional[str] = None

class BookResponse(BookBase):
    id_book: int
    created_at: Optional[datetime]
    chapters_count: int=0

    class Config:
        from_attributes = True

class BookDetailResponse(BookResponse):
    chapters: List['ChapterResponse'] = []

    
