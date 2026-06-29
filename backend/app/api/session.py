from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from app.core.dependencies import (
    get_session_service,
    get_current_active_user_id
)
from app.services.session_service import SessionService
from app.schemas.session import SessionBase, SessionResponse, SessionStats

router = APIRouter(prefix="/sessions", tags=["sesiones"])

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def save_session(
    data: SessionBase,
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service)
):

    return session_service.save_session(user_id, data)

@router.get("/me", response_model=List[SessionResponse])
async def get_my_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=300),
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service)
):

    return session_service.get_my_sessions(user_id, skip=skip, limit=limit)
@router.get("/me/stats", response_model=SessionStats)
async def get_my_stats(
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service)
):

    return session_service.get_my_stats(user_id)

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session_detail(
    session_id: int,
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service)
):

    return session_service.get_session_detail(user_id, session_id)

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service)
):

    session_service.delete_session(user_id, session_id)

@router.get("/chapters/{chapter_id}/stats")
async def get_chapter_stats(
    chapter_id: int,
    session_service: SessionService = Depends(get_session_service)
):

    return session_service.get_chapter_stats(chapter_id)
