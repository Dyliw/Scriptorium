from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.model import Chapters
class ChapterRepository:
    def __init__(self, db:Session):
        self.db=db
def get_book_chapters_count(Self, book_id: int)->int:
    return Self.db.query(Chapters).filter(Chapters.id_book==book_id).count()

def create_chapter(self, book_id:int, data:Dict[str, Any])-> Chapters:
    chapter = Chapters(id_book = book_id, **data)
    self.db.add(chapter)
    self.db.commit()
    self.bd.refresh(chapter)

    return chapter

def get_chapter_by_id(self, chapter_id:int)->Optional[Chapters]:
    return self.db.query(Chapters).filter(Chapters.id_chapter == chapter_id).first()

def get_chapters_by_book(self, book_id:int, skip: int=0, limit: int=100)->List[Chapters]:
    return self.db.query(Chapters).filter(
        Chapters.id_book == book_id
    ).order_by(Chapters.chapter_numer).offset(skip).limit(limit).all()
def update_chapter(self, chapter_id: int, data: Dict[str, Any]) -> Optional[Chapters]:
    chapter = self.get_chapter_by_id(chapter_id)
    if not chapter:
        return None
    
    for key, value in data.items():
        if value is not None and hasattr(chapter, key):
            setattr(chapter, key, value)
    
    self.db.commit()
    self.db.refresh(chapter)
    return chapter
    
def delete_chapter(self, chapter_id: int)->bool:
    chapter = self.get_chapter_by_id(chapter_id)
    if chapter:
        self.db.delete(chapter)
        self.db.commit()
        return True
    return False
