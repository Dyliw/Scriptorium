from typing import Optional, List
from fastapi import HTTPException, status
from datetime import datetime
from app.schemas.word import WordCreate, WordResponse, WordListResponse
from app.controller.word import WordRepository

class WordService:
    def __init__(self, repository: WordRepository):
        self.repository = repository
 
    def save_word(self, user_id: int, data: WordCreate) -> WordResponse:
        if not data.word or not data.word.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La palabra no puede estar vacía"
            )
        
        if data.id_chapter:
            chapter = self.repository.get_chapter_by_id(data.id_chapter)
            if not chapter:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Capítulo {data.id_chapter} no encontrado"
                )
        
        word_data = data.dict()
        word = self.repository.create_word(user_id, word_data)
        
        chapter_title = None
        if word.id_chapter:
            chapter = self.repository.get_chapter_by_id(word.id_chapter)
            if chapter:
                chapter_title = chapter.title_es or chapter.title_en
        
        return WordResponse(
            id_words=word.id_words,
            word=word.word,
            context_sentence=word.context_sentence,
            id_chapter=word.id_chapter,
            chapter_title=chapter_title,
            created_at=word.created_at
        )

    def get_my_words(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        search: Optional[str] = None,
        chapter_id: Optional[int] = None
    ) -> WordListResponse:
        words = self.repository.get_user_words(
            user_id, 
            skip=skip, 
            limit=limit,
            search=search,
            chapter_id=chapter_id
        )
        
        total = self.repository.count_user_words(
            user_id,
            search=search,
            chapter_id=chapter_id
        )
        
        word_responses = []
        for word in words:
            chapter_title = None
            if word.id_chapter:
                chapter = self.repository.get_chapter_by_id(word.id_chapter)
                if chapter:
                    chapter_title = chapter.title_es or chapter.title_en
            
            word_responses.append(WordResponse(
                id_words=word.id_words,
                word=word.word,
                context_sentence=word.context_sentence,
                id_chapter=word.id_chapter,
                chapter_title=chapter_title,
                created_at=word.created_at
            ))
        
        return WordListResponse(
            total=total,
            skip=skip,
            limit=limit,
            words=word_responses
        )
    
    def count_my_words(
        self, 
        user_id: int,
        search: Optional[str] = None,
        chapter_id: Optional[int] = None
    ) -> dict:
       
        total = self.repository.count_user_words(
            user_id,
            search=search,
            chapter_id=chapter_id
        )
        return {"total": total}

    def get_random_word(self, user_id: int) -> Optional[WordResponse]:
        word = self.repository.get_random_word(user_id)
        
        if not word:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes palabras guardadas"
            )
        
        chapter_title = None
        if word.id_chapter:
            chapter = self.repository.get_chapter_by_id(word.id_chapter)
            if chapter:
                chapter_title = chapter.title_es or chapter.title_en
        
        return WordResponse(
            id_words=word.id_words,
            word=word.word,
            context_sentence=word.context_sentence,
            id_chapter=word.id_chapter,
            chapter_title=chapter_title,
            created_at=word.created_at
        )

    def delete_word(self, user_id: int, word_id: int) -> bool:
        deleted = self.repository.delete_word(word_id, user_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Palabra no encontrada o no te pertenece"
            )
        
        return True
