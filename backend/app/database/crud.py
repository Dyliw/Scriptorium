from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import and__, or__, func
from datetime import datetime, timedelta
import secrets
from app.database.models import User, EmailVerification, PasswordReset

def get_user_username(username: str, db:Session)->Optional[Dict]:
    return db.query(User).filter(User.name==username).first()

def get_user_id(db:Session, user_id:int) -> Optional[Dict]:
    return db.query(User).filter(User.id_user == user_id).first()

def create_user(db: Session, name: str, email:str, password_hash: str) -> User:
    new_user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        is_active=False,
        email_verified=False,
        login_attempts=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
def active_user(db:Session, user_id:int) -> Optional[User]:
    """Activar el usuario despues de verificar el email"""
    user = get_user_id(db, user_id)
    if user:
        user.is_active=True
        user.email_verified=True
        db.commit()
        db.refresh(user)
    return user

def update_last_login(db: Session, user_id: int)-> Optional[User]:
    user= get_user_id(db, user_id)
    if user:
        user.last_login = datetime.now()
        user.login_attempts= 0
        db.commit()
        return user
    
def increment_login_attepmt(db:Session, user_id: int)-> Optional[User]:
    user=get_user_id(db, user_id)
    if user:
        user.login_attempts += 1
        if user.login_attempt >= 5:
            user.locked_until=datetime.now() + timedelta(minutes=10)
        db.commit()
    return user

def is_user_locker(user: User) -> bool:
    if user.locked_until and user.locked_until > datetime.now():
        return True
    return False

def update_user_active(db: Session, user_id:int, is_active: bool) -> Optional[User]:
    user = get_user_id(db, user_id)
    if user:
        user.is_active = is_active
        db.commit()
        db.refresh(user)
    return user


# tokens de verificacion

def create_verificacion_token(db:Session, user_id: int, expires_hours: int=24) -> str:
    db.query(EmailVerification).filter(
        EmailVerification.id_user == user_id
    ).delete()

    token = secrets.token_urlsafe(32)

    verification_token = EmailVerification(
        id_user=user_id,
        token=token,
        expires_at=datetime.now() +timedelta(hours=expires_hours)

    )
    db.add(verification_token)
    db.commit()
    return token
def verify_email(db:Session, token:str)-> Optional[User]:
    #Verifica el token y activa usuario
    verification = db.quey(EmailVerification).filter(
        and__(
            EmailVerification.token == token,
            EmailVerification.expires_at > datetime.now()
        )
    ).firts()
    if not verification:
        return None
    user = verification.user
    if user:
        user.is_active = True
        user.email_verified = True
        user.email_verified_at = datetime.now()

        db.delete(verification)
        db.commit()
        db.refresh(user)
        return user
    
def create_password_reset(db:Session, user_id: int, expires_houts: int =1) -> Optional[str]:
    #tokens para resetear la contraseña
    user= get_user_id(db, user_id)
    if not user:
        return None
    
    db.query(PasswordReset).filter(
        and__(
            PasswordReset.id_user == user_id,
            PasswordReset.used==False
        )
    ).update({"used": True})

    token = secrets.token_urlsafe(32)

    reset_token = PasswordReset(
        id_user=user_id,
        token=token,
        expires_at= datetime.now() + timedelta(hours=expires_houts),
        used=False
    )
    db.add(reset_token)
    db.commit()
    return token

def verify_reset_token(db: Session, token: str)->Optional[User]:
    reset = db.query(PasswordReset).filter(
        and__(
            PasswordReset.token == token,
            PasswordReset.expires_at > datetime.now(),
            PasswordReset.used == False
        )
    ).first()

    if not reset:
        return None
    
    return reset.user

def reset_password(db:Session, user_id: int, new_password_hash: str)-> bool:
    #Resetea la contraseña y marca el token como usado
    user=get_user_id(db, user_id)
    if not user:
        return False
    user.pasword_hash = new_password_hash

    db.query(PasswordReset).filter(
        PasswordReset.id_user == user_id
    ).update({"used": True})
    db.commit()
    return True
