from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from datetime import datetime
from app.schemas.word import (WordBase, WordListResponse, WordResponse)
from app.controller.word import WordRepository

class WordService:
    def __init__(self, respository: WordRepository):
        self.respository = respository

    def save_word(self, user_id: int, word_id: int)->WordListResponse:
        word = self.respository.get_word_by_id(word_id)

        if not word:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Palabra no encontrada"
            )
        normalized_word=word.strip()
        normalized_word= word.lower()
        return normalized_word
    def get_my_words(self, user_id: int, skip: int=0, limit: int=250)->Dict[WordListResponse]:
        words = self.respository.get_word_by_id(user_id, skip=skip, limit=limit)
        return[ WordResponse(
            id_word=w.id_word,
            user_id=w.id_user,
            id_chapter=w.id_chapter,
            word=w.word,
            contex_sentence=w.context_sentence,
            created_at=w.created_at
        )
        for w in words
        ] 
    def delete_word(self, user_id: int, word_id: int)->bool:
        delete=self.respository.delete_word(word_id, user_id)

        if not delete:
             raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Palabra no encontrada o no te pertenece"
            )
        
        return True
    def get_word_count(self, user_id: int):
        word= self.respository.get_user_count(user_id)
        return word

        
