# app/api/v1/session.py - VERSIÓN FINAL CORREGIDA
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_active_user_id
from app.database.db import get_db
from app.services.sessionservice import SessionService
from app.controller.sessioncontroller import SessionRepository
from app.schemas.session import SessionBase, SessionFilter, SessionResponse, SessionStats
from app.database.models import ModeSession

router = APIRouter()

def get_session_repository(db: Session = Depends(get_db)) -> SessionRepository:
    return SessionRepository(db)

def get_session_service(
    repository: SessionRepository = Depends(get_session_repository)
) -> SessionService:
    return SessionService(repository)

@router.get("/modes/")
async def get_available_modes(
    db: Session = Depends(get_db),
    include_inactive: bool = False
):

    query = db.query(ModeSession)
    if not include_inactive:
        query = query.filter(ModeSession.is_active == True)
    
    modes = query.order_by(ModeSession.mode_name).all()
    
    return [
        {
            "id": mode.id_mode,
            "name": mode.mode_name,
            "description": mode.description,
            "icon": mode.icon,
            "is_active": mode.is_active
        }
        for mode in modes
    ]

@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def save_session(
    data: SessionBase,
    user_id: int = Depends(get_current_active_user_id),
    session_service: SessionService = Depends(get_session_service),
    db: Session = Depends(get_db)
):
    session_data = data.dict()
    
    mode_name = session_data.get('mode', 'classic')
    mode = db.query(ModeSession).filter(
        ModeSession.mode_name == mode_name,
        ModeSession.is_active == True
    ).first()
    
    if not mode:
        # Buscar classic por defecto
        mode = db.query(ModeSession).filter(
            ModeSession.mode_name == 'classic'
        ).first()
        
        if not mode:
            # Crear classic si no existe
            mode = ModeSession(
                mode_name='classic', 
                description='Modo clásico', 
                icon='⌨️',
                is_active=True
            )
            db.add(mode)
            db.flush()
            db.refresh(mode)
            db.commit()
    
    session_data['id_mode'] = mode.id_mode
    session_data.pop('mode', None) 
    
    if session_data.get('id_chapter', 0) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="id_chapter es requerido"
        )
    
    return session_service.save_session(user_id, session_data)

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
