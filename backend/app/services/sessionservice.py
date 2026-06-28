from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from datetime import datetime
from app.schemas.session import (
    SessionBase, SessionFilter, SessionResponse, SessionStats
)

from app.controller.sessioncontroller import SessionRepository

class SessionService:
    def __init__(self, respository: SessionRepository):
        self.repository = respository

    def save_session(self, user_id: int, data: SessionBase)->SessionResponse:
        chapter = self.repository.get_chapter_by_id(data.id_chapter)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Capítulo con ID {data.id_chapter} no encontrado"
            )
        if data.wpm <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="WPM debe ser mayor a 0"
            )
        if data.accuracy < 0 or data.accuracy > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Accuracy debe estar entre 0 y 100"
            )
        if data.total_keystrokes <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total de keystrokes debe ser mayor a 0"
            )
        
        session_data = {
            "id_chapter": data.id_chapter,
            "mode": data.mode or "classic",
            "started_at": data.started_at or datetime.now(),
            "completed_at": data.completed_at or datetime.now(),
            "wpm": data.wpm,
            "accuracy": data.accuracy,
            "total_keystrokes": data.total_keystrokes,
            "error_count": data.error_count
        }

        session = self.repository.create_session(user_id, session_data)
        return SessionResponse(
            id_typing=session.id_typing,
            id_user=session.id_user,
            id_chapter=session.id_chapter,
            mode=session.mode,
            started_at=session.started_at,
            completed_at=session.completed_at,
            wpm=float(session.wpm),
            accuracy=float(session.accuracy),
            total_keystrokes=session.total_keystrokes,
            error_count=session.error_count
        )
    def get_my_sessions(self, user_id: int, skip: int = 0, limit: int = 300) -> List[SessionResponse]:
        sessions = self.repository.get_user_sessions(user_id, skip=skip, limit=limit)
        
        return [
            SessionResponse(
                id_typing=s.id_typing,
                id_user=s.id_user,
                id_chapter=s.id_chapter,
                mode=s.mode,
                started_at=s.started_at,
                completed_at=s.completed_at,
                wpm=float(s.wpm) if s.wpm else 0,
                accuracy=float(s.accuracy) if s.accuracy else 0,
                total_keystrokes=s.total_keystrokes or 0,
                error_count=s.error_count or 0
            )
            for s in sessions
        ]
    def get_my_stats(self, user_id: int)->SessionStats:
        stats = self.repository.get_user_stats(user_id)
        return SessionStats(
            total_sessions=stats["total_sessions"],
            avg_wpm=stats["avg_wpm"],
            avg_accuracy=stats["avg_accuracy"],
            total_errors=stats["total_errors"],
            best_wpm=stats["best_wpm"],
            total_time=stats["total_time"]
        )
    def get_session_detail(self, user_id: int, session_id: int)->SessionResponse:
        session= self.repository.get_session_by_id(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada"
            )
        if session.id_user != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta sesión"
            )
        
        return SessionResponse(
            id_typing=session.id_typing,
            id_user=session.id_user,
            id_chapter=session.id_chapter,
            mode=session.mode,
            started_at=session.started_at,
            completed_at=session.completed_at,
            wpm=float(session.wpm) if session.wpm else 0,
            accuracy=float(session.accuracy) if session.accuracy else 0,
            total_keystrokes=session.total_keystrokes or 0,
            error_count=session.error_count or 0
        )
    def get_chapter_stats(self, chapter_id: int)->SessionStats:
        stats = self.repository.get_chapter_stats(chapter_id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay estadísticas disponibles para este capítulo"
            )
        
        return stats
     
    def delete_session(self, user_id: int, session_id: int) -> bool:
        deleted = self.repository.delete_session(session_id, user_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada o no te pertenece"
            )
        
        return True
