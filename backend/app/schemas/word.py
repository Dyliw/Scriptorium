from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
import re

class WordBase(BaseModel):
    id_word: int
    user_id: int
    id_chapter: Optional[int]=None
    word: str
    content_sentence: Optional[str] = None

class WordResponse(WordBase):
    contex_sentence: Optional[str] = None
    class Config:
        from_attributes= True

class WordListResponse(WordBase):
    word: str = Field(min_length=0, max_length=50)
    content_sentence: str = Field(min_length=0, max_length=250)
