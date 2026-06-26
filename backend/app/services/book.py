from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from app.schemas.book import (
    BookCreate, BookUpdate, BookDetailResponse, BookResponse
)
from app.schemas.chapter import (
    ChapterCreate, ChapterUpdate,  PracticeContent, ChapterResponse, ChapterBase
)
from app.controller.book import BookRepository

class BookService:
    def __init__(self, repository: BookRepository):
        self.repository = repository

    def create_nook(self, data:BookCreate)->BookResponse:
        book =self.repository.create_book(data.dict(exclude_none=True))

        return BookResponse(
            id_book=book.id_book,
            title_en=book.title_en,
            title_es=book.title_es,
            title_de=book.title_de,
            author=book.author,
            description_en=book.description_en,
            description_es=book.description_es,
            description_de=book.description_de,
            chapters_count=0  
        )
    
    def get_book(self, book_id:int, language: str = 'es')-> BookDetailResponse:
        book = self.repository.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado"
            )
        chapters =self.repository.get_chapters_by_book(book_id)
        chapters_count = len(chapters)
        title = getattr(book, f'title_{language}', None) or book.titile_es or book.titile_en
        return BookDetailResponse(
            id_book=book.id_book,
            title_en=book.title_en,
            title_es=book.title_es,
            title_de=book.title_de,
            author=book.author,
            description_en=book.description_en,
            description_es=book.description_es,
            description_de=book.description_de,
            chapters_count=chapters_count,
            chapters=[
                ChapterResponse(
                    id_chapter=c.id_chapter,
                    id_book=c.id_book,
                    chapter_number=c.chapter_number,
                    title_en=c.title_en,
                    title_es=c.title_es,
                    title_de=c.title_de,
                    content_en=c.content_en,
                    content_es=c.content_es,
                    content_de=c.content_de
                ) for c in chapters
            ]
        )
    
    def list_books(self, skip: int =0, limit: int=100, search: Optional[str]=None)->List[BookResponse]:
        books = self.repository.get_all_books(skip=skip, limit=limit, search=search)
        result = []
        for book in books:
            chapters_count = self.repository.get_book_chapters_count(book.id_book)
            result.append(BookResponse(
                id_book=book.id_book,
                title_en=book.title_en,
                title_es=book.title_es,
                title_de=book.title_de,
                author=book.author,
                description_en=book.description_en,
                description_es=book.description_es,
                description_de=book.description_de,
                chapters_count=chapters_count 
            ))
            return result
        
    def update_book(self, book_id: int, data: BookUpdate)->BookResponse:
        book = self.repository.update_book(book_id, data.dict(exclude_none=True))
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado"
            )
        chapters_count=self.repository.get_book_chapters_count(book_id)
        return BookResponse(
            id_book=book.id_book,
            title_en=book.title_en,
            title_es=book.title_es,
            title_de=book.title_de,
            author=book.author,
            description_en=book.description_en,
            description_es=book.description_es,
            description_de=book.description_de,
            chapters_count=chapters_count
        )
    
    def delete_book(self, book_id:int)-> bool:
        return self.repository.delete_book(book_id)
    
    def create_chapter(self, book_id: int, data:ChapterCreate)-> ChapterResponse:
        book = self.repository.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado"
            )
        chapter = self.repository.create_chapter(book_id, data.dict(exclude_none=True))

        return ChapterResponse(
            id_chapter=chapter.id_chapter,
            id_book=chapter.id_book,
            chapter_number=chapter.chapter_number,
            title_en=chapter.title_en,
            title_es=chapter.title_es,
            title_de=chapter.title_de,
            content_en=chapter.content_en,
            content_es=chapter.content_es,
            content_de=chapter.content_de
        )
    
    def get_chaper(self, chapter_id: int, language: str = 'es')-> ChapterResponse:
        chapter = self.repository.get_chapter_by_id(chapter_id)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capitulos no encontrado"
            )
        
        return ChapterResponse(
            id_chapter=chapter.id_chapter,
            id_book=chapter.id_book,
            chapter_number=chapter.chapter_number,
            title_en=chapter.title_en,
            title_es=chapter.title_es,
            title_de=chapter.title_de,
            content_en=chapter.content_en,
            content_es=chapter.content_es,
            content_de=chapter.content_de 
        )
    
    def get_practice_content(self, chapter_id: int, language: str = 'es')->PracticeContent:
        chapter = self.repository.fet_chapter_by_id(chapter_id)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capítulo no encontrado"
            )
        title = getattr(chapter, f'title_{language}', None) or chapter.title_es or chapter.titile_en

        content = getattr(chapter, f'content_{language}', None) or chapter.content_es or chapter.content_en

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contenido no disponible en {language}"
            )
        book = chapter.book
        book_title=getattr(book, f'title_{language}', None) or book.titile_es or book.title_en

        return PracticeContent(
            id_chapter=chapter.id_chapter,
            title=title,
            content=content,
            chapter_number=chapter.chapter_number,
            book_title=book_title,
            language=language
        )
    
    def update_chapter(self, chapter_id:int, data: ChapterUpdate)-> ChapterResponse:
        chapter = self.repository.update_chapter(chapter_id, data.dict(exclude_none=True))
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capítulos no encontrado"
            )
        return ChapterResponse(
            id_chapter=chapter.id_chapter,
            id_book=chapter.id_book,
            chapter_number=chapter.chapter_number,
            title_en=chapter.title_en,
            title_es=chapter.title_es,
            title_de=chapter.title_de,
            content_en=chapter.content_en,
            content_es=chapter.content_es,
            content_de=chapter.content_de
        )
    def delete_chapter(self,chapter_id: int)->bool:
        return self.repository.delete_chapter(chapter_id)
    
    def list_chapters(self, book_id:int, skip: int=0, limit: int=100)->List[ChapterResponse]:
        chapters = self.repository.get_chapters_by_book(book_id, skip=skip, limit=limit)
        return [
            ChapterResponse(
                id_chapter=c.id_chapter,
                id_book=c.id_book,
                chapter_number=c.chapter_number,
                title_en=c.title_en,
                title_es=c.title_es,
                title_de=c.title_de,
                content_en=c.content_en,
                content_es=c.content_es,
                content_de=c.content_de
            ) for c in chapters
        ]
