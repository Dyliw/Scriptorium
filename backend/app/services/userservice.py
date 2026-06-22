from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.schemas.user import (
    UserUpdate, UserResponse, UserProfileResponse, UserPublicResponse, UserPublicProfileResponse, UserStats
)
from app.controller.usercontroller import UserRepository
from app.api.auth.segurity import verify_password, hash_password

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def get_my_profile(self, user_id: int)-> UserProfileResponse:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil no encontrado"
            )
        stats_data = self.repository.get_user_stats(user_id)
        stats = UserStats(**stats_data)

        user_dict = user.to_dict()
        user_dict["last_login"] = user.last_login

        return UserProfileResponse(
            **user_dict,
            stats=stats
        )
    def get_public_profile(self, username: str)-> UserPublicProfileResponse:
        user= self.repository.get_by_name(username)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El usuario se encuentra inactivo"
            )
        
        stats_data=self.repository.get_user_stats(user.id_user)
        stats=UserStats(**stats_data)
        return UserPublicProfileResponse(
            id_user=user.id_user,
            name=user.name,
            email="",
            profile_photo=user.profile_photo,
            description=user.description,
            is_active=user.is_active,
            email_verified=user.email_verified,
            created_at=user.created_at,
            stats=stats
        )
    def list_user(self, skip: int=0, limit: int=100, search: Optional[str] =None)-> List[UserPublicResponse]:
        users=self.repository.get_all(skip=skip, limit=limit, search=search)

        return[UserPublicResponse(
            id_user=u.id_user,
            name=u.name,
            email="",
            profile_photo=u.profile_photo,
            description=u.description,
            is_active=u.is_active,
            email_verified=u.email_verified,
            created_at=u.created_at
        )
        for u in users
        ]
    def update_profile(self, user_id: int, data: UserUpdate)->UserResponse:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        if data.name and data.name != user.name:
            existing = self.repository.get_by_name(data.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El nombre ya está en uso"
                )
        if data.description and len(data.description)>500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La descripción es muy larga, debe de tener 500 caracteres"
            )
        update_data = data.dict(exclude_none=True)
        updated_user=self.repository.update(user_id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no encontrado"
            )
        return UserResponse(
            id_user=updated_user.id_user,
            name=updated_user.name,
            description=updated_user.description,
            profile_photo=updated_user.profile_photo,
            is_active=updated_user.is_active,
            email_verified=updated_user.email,
            created_at=updated_user.created_at,
            last_login=updated_user.last_login
        )
    def change_password(self, user_id: int, current_password: str, new_password: str)->bool:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña actual incorrecta"
            )
        new_hash=hash_password(new_password)
        updated=self.repository.update(user_id, {"password_hash": new_hash})
        return updated is not None
    
    def delete_accont(self, user_id: int, password: str)->bool:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        if not verify_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        return self.repository.desactivate_user(user_id) is not None
    
    def verify_email(self, user_id: int) -> bool:
        user = self.repository.activate_user(user_id)
        return user is not None
