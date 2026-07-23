from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class UserBookBase(BaseModel):
    is_favorite: Optional[bool] = False
    is_completed: Optional[bool] = False
    progress_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    last_chapter_id: Optional[int] = None
    last_character_index: Optional[int] = Field(0, ge=0)
    personal_note: Optional[str] = None
    user_rating: Optional[int] = Field(None, ge=1, le=5)

class UserBookCreate(UserBookBase):
    id_book: int

class UserBookUpdate(UserBookBase):
    pass

class UserBookResponse(UserBookBase):
    id_user_book: int
    id_user: int
    id_book: int
    added_at: datetime
    last_practiced: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    total_chapters: Optional[int] = 0
    completed_chapters: Optional[int] = 0
    
    class Config:
        from_attributes = True

class UserBookStatsBase(BaseModel):
    total_practice_time: Optional[int] = 0
    sessions_count: Optional[int] = 0
    avg_wpm: Optional[Decimal] = Field(None, ge=0)
    avg_accuracy: Optional[Decimal] = Field(None, ge=0, le=100)
    best_wpm: Optional[Decimal] = Field(None, ge=0)
    total_characters_typed: Optional[int] = 0
    total_errors: Optional[int] = 0
    words_learned: Optional[int] = 0

class UserBookStatsResponse(UserBookStatsBase):
    id_stat: int
    id_user_book: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserBookStatsUpdate(UserBookStatsBase):
    pass

class LibraryResponse(BaseModel):
    user_books: List[UserBookResponse]
    total: int
    favorites_count: int
    completed_count: int
    in_progress_count: int
    
class UserLibrarySummary(BaseModel):
    total_books: int
    completed_books: int
    in_progress_books: int
    favorite_books: int
    total_practice_time: int
    total_sessions: int
    average_wpm: Optional[Decimal] = None
    average_accuracy: Optional[Decimal] = None
