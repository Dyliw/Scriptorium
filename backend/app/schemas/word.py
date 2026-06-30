from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class WordCreate(BaseModel):
    word: str = Field(..., min_length=1, max_length=255)
    context_sentence: Optional[str] = Field(None, max_length=500)
    id_chapter: Optional[int] = None
    
    @validator('word')
    def normalize_word(cls, v):
        return v.strip().lower()
    
    @validator('id_chapter')
    def validate_chapter(cls, v):
        if v is not None and v <= 0:
            raise ValueError('id_chapter debe ser mayor a 0')
        return v

class WordResponse(BaseModel):
    id_words: int
    word: str
    context_sentence: Optional[str]
    id_chapter: Optional[int]
    chapter_title: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class WordListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    words: List[WordResponse]
