from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from decimal import Decimal
from app.controller.userlibrary import UserLibraryRepository
from app.controller.book import BookRepository
from app.controller.chapter import ChapterRepository
from app.schemas.user_library import (
    UserBookCreate, UserBookUpdate, UserBookResponse,
    UserBookStatsResponse, UserBookStatsUpdate,
    LibraryResponse, UserLibrarySummary
)
from app.database.models import UserBooks
from sqlalchemy import func

class UserLibraryService:
    def __init__(
        self,
        library_repository: UserLibraryRepository,
        book_repository: BookRepository,
        chapter_repository: ChapterRepository
    ):
        self.library_repo = library_repository
        self.book_repo = book_repository
        self.chapter_repo = chapter_repository
    
    def add_book_to_library(
        self, 
        user_id: int, 
        data: UserBookCreate
    ) -> UserBookResponse:
        """Agregar un libro a la biblioteca del usuario"""
        # Verificar que el libro existe
        book = self.book_repo.get_book_by_id(data.id_book)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado"
            )
        
        # Verificar que no esté ya en la biblioteca
        existing = self.library_repo.get_user_book(user_id, data.id_book)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El libro ya está en tu biblioteca"
            )
        
        # Crear entrada en la biblioteca
        user_book = self.library_repo.add_book_to_user_library(
            user_id=user_id,
            book_id=data.id_book,
            data=data.dict(exclude={'id_book'}, exclude_none=True)
        )
        
        return self._to_response(user_book)
    
    def get_user_book(self, user_id: int, book_id: int) -> UserBookResponse:
        """Obtener un libro de la biblioteca del usuario"""
        user_book = self.library_repo.get_user_book(user_id, book_id)
        if not user_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado en tu biblioteca"
            )
        
        return self._to_response(user_book)
    
    def get_user_library(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        only_favorites: bool = False,
        only_completed: bool = False,
        only_in_progress: bool = False,
        search: Optional[str] = None
    ) -> LibraryResponse:
        """Obtener la biblioteca completa del usuario"""
        user_books = self.library_repo.get_user_library(
            user_id=user_id,
            skip=skip,
            limit=limit,
            only_favorites=only_favorites,
            only_completed=only_completed,
            only_in_progress=only_in_progress,
            search=search
        )
        
        total = self.library_repo.count_user_books(user_id)
        favorites_count = self.library_repo.count_user_books(
            user_id, only_favorites=True
        )
        completed_count = self.library_repo.count_user_books(
            user_id, only_completed=True
        )
        in_progress_count = self.library_repo.count_user_books(
            user_id, only_in_progress=True
        )
        
        return LibraryResponse(
            user_books=[self._to_response(ub) for ub in user_books],
            total=total,
            favorites_count=favorites_count,
            completed_count=completed_count,
            in_progress_count=in_progress_count
        )
    
    def update_user_book(
        self,
        user_id: int,
        book_id: int,
        data: UserBookUpdate
    ) -> UserBookResponse:
        """Actualizar el estado de un libro en la biblioteca"""
        user_book = self.library_repo.get_user_book(user_id, book_id)
        if not user_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado en tu biblioteca"
            )
        
        # Si se actualiza el progreso, actualizar last_practiced
        update_data = data.dict(exclude_none=True)
        if 'progress_percentage' in update_data:
            update_data['last_practiced'] = func.current_timestamp()
        
        user_book = self.library_repo.update_user_book(
            user_book.id_user_book,
            update_data
        )
        
        return self._to_response(user_book)
    
    def remove_book_from_library(self, user_id: int, book_id: int) -> bool:
        """Eliminar un libro de la biblioteca"""
        return self.library_repo.remove_book_from_library(user_id, book_id)
    
    def toggle_favorite(self, user_id: int, book_id: int) -> UserBookResponse:
        """Alternar favorito"""
        user_book = self.library_repo.toggle_favorite(user_id, book_id)
        if not user_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado en tu biblioteca"
            )
        
        return self._to_response(user_book)
    
    def get_stats(self, user_id: int, book_id: int) -> UserBookStatsResponse:
        """Obtener estadísticas de un libro"""
        user_book = self.library_repo.get_user_book(user_id, book_id)
        if not user_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado en tu biblioteca"
            )
        
        stats = self.library_repo.get_stats(user_book.id_user_book)
        if not stats:
            # Crear estadísticas vacías
            stats = self.library_repo.get_or_create_stats(user_book.id_user_book)
        
        return UserBookStatsResponse.from_orm(stats)
    
    def update_stats(
        self,
        user_id: int,
        book_id: int,
        data: UserBookStatsUpdate
    ) -> UserBookStatsResponse:
        """Actualizar estadísticas de un libro"""
        user_book = self.library_repo.get_user_book(user_id, book_id)
        if not user_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado en tu biblioteca"
            )
        
        stats = self.library_repo.update_stats(
            user_book.id_user_book,
            data.dict(exclude_none=True)
        )
        
        return UserBookStatsResponse.from_orm(stats)
    
    def get_library_summary(self, user_id: int) -> UserLibrarySummary:
        """Obtener resumen de la biblioteca"""
        summary = self.library_repo.get_library_summary(user_id)
        return UserLibrarySummary(**summary)
    
    def _to_response(self, user_book: UserBooks) -> UserBookResponse:
        """Convertir modelo a response"""
        # Obtener información del libro
        book = user_book.book
        chapters = self.book_repo.get_chapters_by_book(book.id_book)
        total_chapters = len(chapters)
        
        # Contar capítulos completados (progreso = 100%)
        completed_chapters = self.library_repo.db.query(
            func.count()
        ).filter(
            UserBooks.id_book == book.id_book,
            UserBooks.is_completed == True
        ).scalar() or 0
        
        # Obtener título en el orden de preferencia
        title = (
            book.title_es or 
            book.title_en or 
            book.title_de or 
            "Sin título"
        )
        
        return UserBookResponse(
            id_user_book=user_book.id_user_book,
            id_user=user_book.id_user,
            id_book=user_book.id_book,
            is_favorite=user_book.is_favorite,
            is_completed=user_book.is_completed,
            progress_percentage=user_book.progress_percentage,
            last_chapter_id=user_book.last_chapter_id,
            last_character_index=user_book.last_character_index,
            personal_note=user_book.personal_note,
            user_rating=user_book.user_rating,
            added_at=user_book.added_at,
            last_practiced=user_book.last_practiced,
            completed_at=user_book.completed_at,
            book_title=title,
            book_author=book.author,
            total_chapters=total_chapters,
            completed_chapters=completed_chapters
        )
