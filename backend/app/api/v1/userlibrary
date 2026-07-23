from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.controller.userlibrary import UserLibraryRepository
from app.controller.book import BookRepository
from app.controller.chapter import ChapterRepository
from app.services.userlibrary_service import UserLibraryService
from app.schemas.user_library import (
    UserBookCreate, UserBookUpdate, UserBookResponse,
    UserBookStatsResponse, UserBookStatsUpdate,
    LibraryResponse, UserLibrarySummary
)
from app.database.models import User

router = APIRouter(prefix="/library", tags=["Biblioteca del Usuario"])

def get_library_repository(db: Session = Depends(get_db)) -> UserLibraryRepository:
    return UserLibraryRepository(db)

def get_book_repository(db: Session = Depends(get_db)) -> BookRepository:
    return BookRepository(db)

def get_chapter_repository(db: Session = Depends(get_db)) -> ChapterRepository:
    return ChapterRepository(db)

def get_library_service(
    library_repo: UserLibraryRepository = Depends(get_library_repository),
    book_repo: BookRepository = Depends(get_book_repository),
    chapter_repo: ChapterRepository = Depends(get_chapter_repository)
) -> UserLibraryService:
    return UserLibraryService(library_repo, book_repo, chapter_repo)

@router.post("/books", response_model=UserBookResponse, status_code=status.HTTP_201_CREATED)
async def add_book_to_library(
    data: UserBookCreate,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.add_book_to_library(current_user.id_user, data)

@router.get("/books", response_model=LibraryResponse)
async def get_user_library(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    only_favorites: bool = Query(False, description="Solo favoritos"),
    only_completed: bool = Query(False, description="Solo completados"),
    only_in_progress: bool = Query(False, description="Solo en progreso"),
    search: Optional[str] = Query(None, description="Buscar por título o autor"),
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.get_user_library(
        user_id=current_user.id_user,
        skip=skip,
        limit=limit,
        only_favorites=only_favorites,
        only_completed=only_completed,
        only_in_progress=only_in_progress,
        search=search
    )

@router.get("/books/{book_id}", response_model=UserBookResponse)
async def get_user_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.get_user_book(current_user.id_user, book_id)

@router.put("/books/{book_id}", response_model=UserBookResponse)
async def update_user_book(
    book_id: int,
    data: UserBookUpdate,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.update_user_book(current_user.id_user, book_id, data)

@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_book_from_library(
    book_id: int,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    removed = service.remove_book_from_library(current_user.id_user, book_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Libro no encontrado en tu biblioteca"
        )

@router.post("/books/{book_id}/favorite", response_model=UserBookResponse)
async def toggle_favorite(
    book_id: int,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    """Alternar estado de favorito de un libro"""
    return service.toggle_favorite(current_user.id_user, book_id)

@router.get("/books/{book_id}/stats", response_model=UserBookStatsResponse)
async def get_book_stats(
    book_id: int,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.get_stats(current_user.id_user, book_id)

@router.put("/books/{book_id}/stats", response_model=UserBookStatsResponse)
async def update_book_stats(
    book_id: int,
    data: UserBookStatsUpdate,
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.update_stats(current_user.id_user, book_id, data)

@router.get("/summary", response_model=UserLibrarySummary)
async def get_library_summary(
    current_user: User = Depends(get_current_user),
    service: UserLibraryService = Depends(get_library_service)
):
    return service.get_library_summary(current_user.id_user)
