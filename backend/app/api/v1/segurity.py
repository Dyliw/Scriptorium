from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWSError, jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from app.database.crud import get_user_id
from app.database.db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str)->str:
    print("HASH INPUT:", repr(password))
    print("HASH LEN:", len(password))
    return pwd_context.hash(password)
    """Generate the hash of a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str)->bool:
    """Verfify if the password and the hash are the same"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta]=None)->str:
    """Create an acces token"""
    to_encode = data.copy()
    if  expires_delta:
        expire= datetime.now(timezone.utc) + expires_delta
    else:
        expire= datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt



def decode_token(token: str) ->Dict[str, Any]:
    """Decode and validate the JWT"""
    try:
        playload = jwt.decode(token, settings.secret_key,algorithms=settings.ALGORITHM)
        return playload
    except JWSError:
        raise ValueError("Invalid token")
    
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid token",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credential_exception
    except JWSError:
        raise credential_exception
    user=get_user_id(db, int(user_id))

    if user is None:
        raise credential_exception
    
    return{
        "id_user": user.id_user,
        "name": user.name,
        "email": user.email,
        "photo": user.profile_photo,
        "description": user.description,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }
def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get('activo', True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
