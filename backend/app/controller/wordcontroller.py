from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from app.database.models import SavedWords, Chapters

class WordRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_word(self, user_id: int, data: Dict[str, Any]) -> SavedWords:
        """Crea una palabra guardada"""
        word = SavedWords(
            id_user=user_id,
            word=data.get('word'),
            context_sentence=data.get('context_sentence'),
            id_chapter=data.get('id_chapter')
        )
        self.db.add(word)
        self.db.commit()
        self.db.refresh(word)
        return word
    def get_user_words(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        search: Optional[str] = None,
        chapter_id: Optional[int] = None
    ) -> List[SavedWords]:
        query = self.db.query(SavedWords).filter(SavedWords.id_user == user_id)
        
        if search:
            query = query.filter(SavedWords.word.ilike(f"%{search}%"))
        
        if chapter_id:
            query = query.filter(SavedWords.id_chapter == chapter_id)
        
        return query.order_by(desc(SavedWords.created_at)).offset(skip).limit(limit).all()
    
    def count_user_words(
        self, 
        user_id: int, 
        search: Optional[str] = None,
        chapter_id: Optional[int] = None
    ) -> int:
        query = self.db.query(SavedWords).filter(SavedWords.id_user == user_id)
        
        if search:
            query = query.filter(SavedWords.word.ilike(f"%{search}%"))
        
        if chapter_id:
            query = query.filter(SavedWords.id_chapter == chapter_id)
        
        return query.count()
    
    def get_word_by_id(self, word_id: int, user_id: int) -> Optional[SavedWords]:
        return self.db.query(SavedWords).filter(
            SavedWords.id_words == word_id,
            SavedWords.id_user == user_id
        ).first()
    
    def get_random_word(self, user_id: int) -> Optional[SavedWords]:
        """Obtiene una palabra aleatoria del usuario"""
        return self.db.query(SavedWords).filter(
            SavedWords.id_user == user_id
        ).order_by(func.random()).first()
    
    def get_chapter_by_id(self, chapter_id: int) -> Optional[Chapters]:
        return self.db.query(Chapters).filter(
            Chapters.id_chapter == chapter_id
        ).first()
  
    def delete_word(self, word_id: int, user_id: int) -> bool:
        word = self.get_word_by_id(word_id, user_id)
        if word:
            self.db.delete(word)
            self.db.commit()
            return True
        return False
