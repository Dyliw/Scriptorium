from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import datetime, timedelta
from app.database.models import User, TypingSession, SavedWords, Chapters, Books

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int)-> Optional[User]:
        return self.db.query(User).filter(User.id_user == user_id).first()
    def get_by_name(self, name:str)->Optional[User]:
        return self.db.query(User).filter(User.name == name).first()
    def get_by_email(self, email:str)->Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    def get_all(self, skip: int=0, limit: int=100, search: Optional[str]=None)-> List[User]:
        query = self.db.query(User).filter(User.is_active == True)
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}"),
                    User.email.ilike(f"%{search}")
                )
            )
            return query.offset(skip).limit(limit).all()

    def count_all(self, search: Optional[str] = None)->int:
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}"),
                    User.email.ilike(f"%{search}")
                )
            )
            return query.count()
    
    def update(self, user_id: int, data: Dict[str, Any])-> Optional[User]:
        user= self.get_by_id(user_id)

        if not user:
            return None
        for key, value in data.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        user.updated_at = datetime.now()

        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_last_login(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.last_login() = datetime.now()
            user.login_attempts=0
            self.db.commit()
            self.db.refresh(user)
        return user
    def login_increment(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.login_attempts += 1

            if user.login_attempts > 5:
                user.locked_until = datetime.now() + timedelta(minutes=15)
            self.db.commit()
            self.db.refresh(user)

        return user
    def activate_user(self, user_id: int) -> Optional[User]:
        user =self.get_by_id(user_id)

        if user:
            user.is_active = True
            user.email_verified = True
            user.email_verified_at = datetime.now()
            self.db.commit()
            self.db.refresh(user)
        return user
    def desactivate_user(self, user_id: int) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.is_active=False
            self.db.commit()
            self.db.refresh(user)
        return user
    def delete_user(self, user_id: int)->bool:
        user = self.get_by_id(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        sessions = self.db.query(TypingSession).filter(
            TypingSession.id_user == user_id,
            TypingSession.completed_at.isnot(None)
        )
        total_sessions = sessions.count()
        avg_wpm=sessions.with_entities(func.avg(TypingSession.wpm)).scalar()
        avg_accuracy=sessions.with_entities(func.avg(TypingSession.accuracy)).scalar()

        last_session = sessions.order_by(desc(TypingSession.completed_at)).firts()
        last_session_date =last_session.completed_at if last_session else None

        completed_chapters = sessions.with_entities(
            TypingSession.id_chapter
        ).distinct().all()
        completed_chapters_ids = [c[0] for c in completed_chapters if c[0]]
        total_chapters = len(completed_chapters_ids)

        books_completed = set()
        if completed_chapters_ids:
            chapters = self.db.query(Chapters).filter(
                Chapters.id_chapter.in_(completed_chapters_ids)
            ).all()
            books_completed = {c.id_book for c in chapters}


            total_words_saved = self.db.query(SavedWords).filter(
                SavedWords.id_user == user_id
            ).count()

            level = self._calculate_level(total_sessions, avg_wpm or 0, avg_accuracy or 0)
            return{
                "total_session": total_sessions,
                "total_books_completed": len(books_completed),
                "total_chapters_completed": total_chapters,
                "avg_wpm": float(avg_wpm) if avg_wpm else None,
                "avg_accuracy": float(avg_accuracy) if avg_accuracy else None,
                "total_words_saved": total_words_saved,
                "last_session_date": last_session_date,
                "level": level
            }

    def _calculate_level(self, session: int, wpm: float, accuracy: float)->str:
        if session == 0:
            return "Sin actividad"
        elif session < 5:
            return "Principiante"
        elif session < 20:
            return "Intermedio"
        elif session < 50 and wpm >= 40 and accuracy >= 90:
            return "Avanzado"
        elif session >= 50 and wpm >=50 and accuracy >=95:
            return "Experto"
        else:
            return "Intermedio-Avanzado"
        
