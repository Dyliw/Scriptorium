from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import re

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=3)
class UserRegister(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

    @validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Solo letras, números y guión bajo')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe de tener al menos 6 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('Debe de tener al menos una mayuscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('Debe de tener al menos un numero')
        return v
    @validator('confirm_password')
    def password_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v
    
class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

    @validator('confirm_password')
    def password_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

class VerifyEmail(BaseModel):
    token: str

class UserInfo(BaseModel):
    id_user: int
    name: str
    email: str
    is_active: bool
    email_verified: bool
    profile_photo: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime]

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
    expires_in: int

class MessageResponse(BaseModel):
    message: str
    success: bool = True
