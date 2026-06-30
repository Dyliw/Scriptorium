from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.models import TypingSession, Chapters, Books, User

class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_completed_chapters(self, user_id: int) -> List[int]:
        completed = self.db.query(TypingSession.id_chapter).filter(
            TypingSession.id_user == user_id,
            TypingSession.completed_at.isnot(None)
        ).distinct().all()
        
        return [c[0] for c in completed if c[0] is not None]
    
    def get_chapter_count_by_book(self) -> Dict[int, int]:
        counts = self.db.query(
            Chapters.id_book,
            func.count(Chapters.id_chapter).label('count')
        ).group_by(Chapters.id_book).all()
        
        return {c.id_book: c.count for c in counts}
    
    def get_book_titles(self) -> Dict[int, str]:
        books = self.db.query(Books).all()
        return {b.id_book: b.title_es or b.title_en for b in books}
    
    def get_best_chapter_stats(self, user_id: int, chapter_id: int) -> Dict:
        best = self.db.query(
            func.max(TypingSession.wpm).label('best_wpm'),
            func.max(TypingSession.accuracy).label('best_accuracy'),
            func.max(TypingSession.completed_at).label('last_practice')
        ).filter(
            TypingSession.id_user == user_id,
            TypingSession.id_chapter == chapter_id,
            TypingSession.completed_at.isnot(None)
        ).first()
        
        return {
            'best_wpm': float(best.best_wpm) if best.best_wpm else 0,
            'best_accuracy': float(best.best_accuracy) if best.best_accuracy else 0,
            'last_practice': best.last_practice
        }
