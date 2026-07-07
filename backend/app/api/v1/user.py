from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.dependencies import(get_user_service, get_current_active_user_id, get_current_user_id)
from app.services.userservice import UserService
from app.schemas.user import(
    UserUpdate, UserUpdatePassword, UserProfileResponse, UserPublicProfileResponse, UserPublicResponse, UserResponse, AvatarDeleteResponse, AvatarUploadResponse
)

router = APIRouter()
@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    user_id: int = Depends(get_current_active_user_id),
    user_service: UserService= Depends(get_user_service)
):
    return user_service.get_my_profile(user_id)
@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdate,
    user_id: int = Depends(get_current_active_user_id),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.update_profile(user_id, data)

@router.put("/me/password", response_model=dict)
async def change_my_password(
    data: UserUpdatePassword,
    user_id: int= Depends(get_current_active_user_id),
    user_service: UserService= Depends(get_user_service)
):
    success = user_service.change_password(
        user_id=user_id,
        current_password=data.current_password,
        new_password=data.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar la contraseña"
        )
    return {"message": "Contraseña actualizada exitosamente"}

@router.delete("/me", response_model=dict)
async def delete_my_account(
    password:str,
    user_id: int = Depends(get_current_active_user_id),
    user_service: UserService = Depends(get_user_service)
):
    success = user_service.delete_account(user_id, password)
    if not success: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar la cuenta"
        )
    return {"message": "Cuenta desactivada exitosamente"}

@router.get("/{username}", response_model=UserPublicProfileResponse)
async def get_user_profile(
    username: str,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_public_profile(username)

@router.get("/", response_model=List[UserPublicResponse])
async def list_users(
    skip: int = Query(0, ge=0, description="Numero de registros a saltar"),
    limit: int = Query(20, ge=1, le=100, description="Limite registros"),
    search: Optional[str] = Query(None, description="Busqueda por nombre"),
    user_service: UserService=Depends(get_user_service)

):
    return user_service.list_users(skip=skip, limit=limit, search=search)

@router.get("/me/stats", response_model=dict)
async def get_my_stats(
    user_id: int= Depends(get_current_active_user_id),
    user_service: UserService = Depends(get_user_service)
):
    profile = user_service.get_my_profile(user_id)
    return profile.stats

@router.get("/{username}/stats", response_model=dict)
async def get_user_stats_public(
    username: str,
    user_service: UserService = Depends(get_user_service)
):
    profile = user_service.get_public_profile(username)
    return profile.stats

@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(..., description="Imagen de perfil"),
    user_id: int = Depends(get_current_active_user_id),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.upload_avatar(user_id, file)

@router.delete("/me/avatar", response_model=AvatarDeleteResponse)
async def delete_avatar(
    user_id: int = Depends(get_current_active_user_id),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.remove_avatar(user_id)
