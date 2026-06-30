from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BookProgress(BaseModel):
    book_id: int
    book_title: str
    total_chapters: int
    completed_chapters: int
    percentage: float
    last_practice: Optional[datetime]

class ChapterProgress(BaseModel):
    chapter_id: int
    chapter_title: str
    chapter_number: int
    completed: bool
    best_wpm: Optional[float]
    best_accuracy: Optional[float]
    last_practice: Optional[datetime]

class OverallProgress(BaseModel):
    total_books: int
    completed_books: int
    total_chapters: int
    completed_chapters: int
    overall_percentage: float
    books: List[BookProgress]
    next_chapter: Optional[ChapterProgress]

class ProgressTimeline(BaseModel):
    date: datetime
    sessions: int
    chapters_completed: int
    avg_wpm: float
