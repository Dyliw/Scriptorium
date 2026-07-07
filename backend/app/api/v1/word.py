from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.core.dependencies import (
    get_word_service,
    get_current_active_user_id
)
from app.services.wordservice import WordService
from app.schemas.word import (
    WordCreate, WordResponse, WordListResponse
)

router = APIRouter()
@router.post(
    "/",
    response_model=WordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Guardar una palabra",
    description="Guarda una nueva palabra en el vocabulario del usuario."
)
async def save_word(
    data: WordCreate,
    user_id: int = Depends(get_current_active_user_id),
    word_service: WordService = Depends(get_word_service)
):
    return word_service.save_word(user_id, data)

@router.get(
    "/me",
    response_model=WordListResponse,
    summary="Listar mis palabras",
    description="Obtiene todas las palabras guardadas por el usuario con paginación."
)
async def get_my_words(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Búsqueda por palabra"),
    chapter_id: Optional[int] = Query(None, description="Filtrar por capítulo"),
    user_id: int = Depends(get_current_active_user_id),
    word_service: WordService = Depends(get_word_service)
):
    return word_service.get_my_words(
        user_id,
        skip=skip,
        limit=limit,
        search=search,
        chapter_id=chapter_id
    )

@router.get(
    "/me/count",
    summary="Contar mis palabras",
    description="Cuenta el total de palabras guardadas por el usuario."
)
async def count_my_words(
    search: Optional[str] = Query(None, description="Búsqueda por palabra"),
    chapter_id: Optional[int] = Query(None, description="Filtrar por capítulo"),
    user_id: int = Depends(get_current_active_user_id),
    word_service: WordService = Depends(get_word_service)
):
    return word_service.count_my_words(user_id, search=search, chapter_id=chapter_id)

@router.get(
    "/me/random",
    response_model=WordResponse,
    summary="Palabra aleatoria",
    description="Obtiene una palabra aleatoria del vocabulario del usuario."
)
async def get_random_word(
    user_id: int = Depends(get_current_active_user_id),
    word_service: WordService = Depends(get_word_service)
):
    return word_service.get_random_word(user_id)


@router.delete(
    "/{word_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar palabra",
    description="Elimina una palabra guardada por el usuario."
)
async def delete_word(
    word_id: int,
    user_id: int = Depends(get_current_active_user_id),
    word_service: WordService = Depends(get_word_service)
):
    word_service.delete_word(user_id, word_id)
