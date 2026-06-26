from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from app.core.dependencies import get_user_service
from app.services.bookservice import BookService
from app.controller.book import BookRepository
from app.database.db import get_db
from sqlalchemy.orm import Session
from app.schemas.book import(
    BookCreate, BookUpdate, BookResponse, BookDetailResponse
)
from app.schemas.chapter import(
    ChapterCreate, ChapterUpdate, ChapterResponse, PracticeContent
)

router = APIRouter(prefix="/books", tags=["books"])

def get_book_repository(db:Session=Depends(get_db))-> BookRepository:
    return BookRepository(db)

def get_book_service(repository: BookRepository = Depends(get_book_repository))-> BookService:
    return BookService(repository)

@router.posrt("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    data: BookCreate,
    book_service: BookService = Depends(get_book_service)
):
    return book_service.create_nook(data)

@router.get("/", response_model=List[BookResponse])
async def list_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str]=Query(None, description="Busqueda por título o autor"),
    book_service: BookService = Depends(get_book_service)
):

    return book_service.get_book(book_id, language=language)

@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    data: BookUpdate,
    book_service: BookService = Depends(get_book_service)
):
    return book_service.update_book(book_id, data)

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id:int,
    book_service: BookService = Depends(get_book_service)
):
    deleted = book_service.delete_book(book_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Libro no encontrado"
        )
    
@router.post("/{book_id}/chapters", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    book_id: int,
    data: ChapterCreate,
    book_service: BookService = Depends(get_book_service)
):
    return book_service.create_chapter(book_id, data)
@router.get("/{book_id}/chapters", response_model=List[ChapterResponse])
async def list_chapters(
    book_id: int,
    skip: int=Query(0, ge=0),
    limit: int=Query(50, ge=1, le=100),
    book_service: BookService = Depends(get_book_service)
):
    return book_service.list_chapters(book_id, skip=skip, limit=limit)

@router.get("/chapters/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    chapter_id: int,
    langeage: str = Query('es', regex='^(en|es|de)$'),
    book_service: BookService = Depends(get_book_service)
):
    return book_service.get_chaper(chapter_id, langeage=langeage)

@router.get("/chapers/{chapter_id}/practice", response_model=PracticeContent)
async def get_practice_content(
    chapter_id: int,
    language: str = Query('es', regex='(en|es|de)$', description="Idioma para practicar"),
    book_service: BookService = Depends(get_book_service)
):
    return book_service.get_practice_content(chapter_id, language=language)

@router.put("/chapters/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(
    chapter_id: int,
    data: ChapterUpdate,
    book_service: BookService = Depends(get_book_service)
):
    
    return book_service.update_chapter(chapter_id, data)

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: int,
    book_service: BookService = Depends(get_book_service)
):
    deleted = book_service.delete_chapter(chapter_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Capitulo no encontrado"
        )
