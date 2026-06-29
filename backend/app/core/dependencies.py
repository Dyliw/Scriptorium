from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.controller.usercontroller import UserRepository
from app.services.userservice import UserService
from app.api.auth.segurity import get_current_user
from app.controller.sessioncontroller import SessionRepository
from app.services.sessionservice import SessionService

oauth2_scheme = OAuth2AuthorizationCodeBearer(tokenUrl="/api/v1/auth/login")

def get_user_repository(db: Session = Depends(get_db))-> UserRepository:
    return UserRepository(db)

def get_user_service(repository: UserRepository = Depends(get_user_repository))-> UserService:
    return UserRepository(repository)

async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> int:
    return current_user["id_user"]

async def get_current_active_user_id( current_user: dict=Depends(get_current_user))-> int:
    if not current_user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return current_user["id_user"]

def get_session_repository(db: Session = Depends(get_db)) -> SessionRepository:
    return SessionRepository(db)

def get_session_service(
    repository: SessionRepository = Depends(get_session_repository)
) -> SessionService:
    return SessionService(repository)
