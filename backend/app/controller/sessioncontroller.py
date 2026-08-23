from typing import Optional, Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from datetime import datetime, timedelta
from app.database.models import TypingSession, User, Chapters

class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, user_id: int, data: Dict[str, Any])->Session:
        session = TypingSession(id_user = user_id, **data)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    def get_user_sessions(self, user_id: int, skip: int=0, limit: int=300):
        return self.db.query(TypingSession).filter(TypingSession.id_user == user_id).order_by(desc(TypingSession.started_at)).offset(skip).limit(limit).all()
    
    def get_user_stats(self, user_id: int):
        sessions = self.db.query(TypingSession).filter(
            TypingSession.id_user == user_id,
            TypingSession.completed_at.isnot(None)
        )
        total_sessions= sessions.count()
        if total_sessions == 0:
            return {
                "total_sessions": 0,
                "avg_wpm": 0.0,
                "avg_accuracy": 0.0,
                "total_errors": 0,
                "best_wpm": 0.0,
                "total_time": 0 
            }
        avg_wpm = sessions.with_entities(func.avg(TypingSession.wpm)).scalar()
        avg_accuracy = sessions.with_entities(func.avg(TypingSession.accuracy)).scalar()
        total_errors= sessions.with_entities(func.sum(TypingSession.error_count)).scalar()
        best_wpm=sessions.with_entities(func.max(TypingSession.wpm)).scalar()
        total_keystrokes = sessions.with_entities(func.sum(TypingSession.total_keystrokes)).scalar() or 0
        total_time = total_keystrokes // 60 if total_keystrokes > 0 else 0 
        
        return {
            "total_sessions": total_sessions,
            "avg_wpm": float(avg_wpm),
            "avg_accuracy": float(avg_accuracy),
            "total_errors": total_errors,
            "best_wpm": float(best_wpm),
            "total_time": total_time
        }

    def get_session_by_id(self, session_id: int)->Optional[TypingSession]:
        return self.db.query(TypingSession).filter(TypingSession.id_typing == session_id).first()
    
    def delete_session(self, session_id: int)-> bool:
        session=self.get_session_by_id(session_id)
        if session:
            self.db.delete(session)
            self.db.commit()
            return True
        return False
    
    def get_chapter_by_id(self, chapter_id: int) -> Optional[Chapters]:
        """Obtiene un capítulo por ID"""
        return self.db.query(Chapters).filter(
            Chapters.id_chapter == chapter_id
        ).first()
    
    def get_chapter_stats(self, chapter_id: int)->Optional[Dict]:
        completed_sessions= self.db.query(TypingSession).filter(
            TypingSession.id_chapter == chapter_id,
            TypingSession.completed_at.isnot(None)
        )
        if completed_sessions.count() ==0:
            return None
        
        stats = completed_sessions.with_entities(
            func.count(func.distinct(TypingSession.id_user)).label('total_users'),
            func.avg(TypingSession.wpm).label('avg_wpm'),
            func.avg(TypingSession.accuracy).label('avg_accuracy')
        ).first()
        return {
            'total_users': stats.total_users,
            'average_wpm': stats.avg_wpm,
            'average_accuracy': float(stats.avg_accuracy) if stats.avg_accuracy else 0
        }
