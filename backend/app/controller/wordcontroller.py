from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from datetime import datetime, timedelta
from app.database.models import SavedWords

class WordRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_word(self, user_id: int, data: Dict[str, Any]):
        word = SavedWords(id_user = user_id, **data)
        self.db.add(word)
        self.db.commit()
        self.db.refresh(word)
        return word
    def get_user_word(self, user_id: int, skip: int=0, limit: int=250):
        return self.db.query(SavedWords).filter(SavedWords.id_user==user_id).order_by(desc(SavedWords.word)).offset(skip).limit(limit).all()
    
    def get_word_by_id(self, user_id: int, word_id: int):
        user = self.db.query(SavedWords).filter(
            SavedWords.id_user==user_id,
            SavedWords.id_words != None
        )
        if user:
            return self.db.query(SavedWords).filter(SavedWords.id_words == word_id).first()
        
    def delete_word(self, word_id: int, user_id: int)-> Optional[bool]:
        user=self.get_word_by_id()

        if user:
            self.db.delete(word_id)
            self.db.commit()
            return True
        return False
    def get_user_count(self, user_id: int):
        words=self.db.query(SavedWords).filter(
            SavedWords.id_user==user_id,
            SavedWords.id_words != None
        )
        total_words=words.count()

    def get_words_by_chapter(self, chapter_id: int):
        word_chapter=self.db.query(SavedWords).filter(
            SavedWords.id_chapter == chapter_id,
            SavedWords.id_words != None
        )
        total_words_chapter = word_chapter.count()

        
