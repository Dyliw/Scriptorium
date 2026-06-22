from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re

class UserBase(BaseModel):
    id_user: int
    name: str
    email: EmailStr
    profile_photo:Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    email_verified: bool
    created_at: Optional[datetime] = None

class UserResponse(UserBase):
    last_login: Optional[datetime] = None
    class Config:
        from_attributes=True
class UserPublicResponse(UserBase):
    class Config:
        from_attributes=True
class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=30)
    description: Optional[str] = Field(None, max_length=1200)
    profile_photo: Optional[str] =None

    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            if not re.match(r'^[a-zA-Z0-9_\s]+$',v):
                raise ValueError('Sólo letras, números, espacios y guión bajo')
        return v
        
class UserUpdateEmail(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserUpdatePassword(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

    @validator('confirm_password')
    def password_match(cls, v, values):
        if 'new_password' in values and v!=values['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('La constraseña debe tener al menos 6 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('Debe de tener al menos una mayuscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('Debe de tener al menos un número')
        return v
class UserStats(BaseModel):
    total_session: int=0
    total_books_completed: int=0
    total_chapters_completed: int=0
    avg_wpm: Optional[float] = None
    avg_accuracy: Optional[float] = None
    total_words_saved: int=0
    last_session_date: Optional[datetime] = None
    level: str = 'Nuv'

    class Config:
        from_attributes = True
class UserProfileResponse(UserResponse):
    stats: Optional[UserStats]= None

class UserPublicProfileResponse(UserPublicResponse):
    stats: Optional[UserStats]=None
    
