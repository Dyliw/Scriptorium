from typing import Optional, Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from datetime import datetime, timedelta
from app.database.models import TypingSession, User

class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def created_session(self, typing_id: int, data: Dict[str, Any])->Session:
        session = TypingSession(id_typing = typing_id, **data)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
    def get_user_session(self, user_id: int, skip: int=0, limit: int=300):
        return self.db.query(TypingSession).filter(TypingSession.id_user == user_id).order_by(desc(TypingSession.started_at)).offset(skip).limit(limit).all()
    
    def get_user_stats(self, user_id: int):
        sessions = self.db.query(TypingSession).filter(
            TypingSession.id_user == user_id,
            TypingSession.completed_at.isnot(None)
        )
        total_sessions= sessions.count()
        avg_wpm = sessions.with_entities(func.avg(TypingSession.wpm)).scalar()
        avg_accuracy = sessions.with_entities(func.avg(TypingSession.accuracy)).scalar()
        total_errors= sessions.with_entities(func.sum(TypingSession.error_count)).scalar()
        best_wpm=sessions.with_entities(func.max(TypingSession.wpm)).scalar()
