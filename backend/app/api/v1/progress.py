from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.core.dependencies import (
    get_progress_service,
    get_current_active_user_id
)
from app.services.progressservice import ProgressService
from app.schemas.progress import (
    OverallProgress, BookProgress, ChapterProgress,
    ProgressTimeline, DetailedStats
)

router = APIRouter()

@router.get(
    "/me",
    response_model=OverallProgress,
    summary="Mi progreso",
    description="""
    Obtiene el progreso general del usuario autenticado.
    
    Incluye:
    - Resumen general (libros, capítulos, porcentaje)
    - Progreso detallado por libro
    - Próximo capítulo recomendado
    - Estadísticas de práctica
    """
)
async def get_my_progress(
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_overall_progress(user_id)
@router.get(
    "/me/books/{book_id}",
    response_model=BookProgress,
    summary="Progreso en un libro",
    description="Obtiene el progreso del usuario en un libro específico."
)
async def get_book_progress(
    book_id: int,
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_book_progress(user_id, book_id)

@router.get(
    "/me/chapters/{chapter_id}",
    response_model=ChapterProgress,
    summary="Progreso en un capítulo",
    description="Obtiene el progreso del usuario en un capítulo específico."
)
async def get_chapter_progress(
    chapter_id: int,
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_chapter_progress(user_id, chapter_id)

@router.get(
    "/me/timeline",
    response_model=ProgressTimeline,
    summary="Línea de tiempo",
    description="Obtiene la línea de tiempo de progreso del usuario."
)
async def get_progress_timeline(
    days: int = Query(30, ge=1, le=365, description="Número de días a incluir"),
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_progress_timeline(user_id, days)

@router.get(
    "/me/stats",
    response_model=DetailedStats,
    summary="Estadísticas detalladas",
    description="Obtiene estadísticas detalladas del usuario."
)
async def get_detailed_stats(
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_detailed_stats(user_id)

@router.get(
    "/me/recent",
    summary="Actividad reciente",
    description="Obtiene la actividad reciente del usuario."
)
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50, description="Número de actividades"),
    user_id: int = Depends(get_current_active_user_id),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.get_recent_activity(user_id, limit)

@router.get(
    "/users/{username}",
    response_model=OverallProgress,
    summary="Progreso de otro usuario",
    description="Obtiene el progreso público de otro usuario."
)
async def get_user_progress(
    username: str,
    progress_service: ProgressService = Depends(get_progress_service)
):

    from app.controller.usercontroller import UserRepository
    from app.database.db import get_db
    
    db = next(get_db())
    user_repo = UserRepository(db)
    user = user_repo.get_by_name(username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return progress_service.get_overall_progress(user.id_user)
