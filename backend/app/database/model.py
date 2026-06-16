from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    #Datos principales
    id_user = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(30), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    #perfil
    profile_photo = Column(Text, nullable=True)
    description = Column(String(500), nullable=True)

    #Estado de la cuenta
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(TIMESTAMP, nullable=True)
    last_login = Column(TIMESTAMP, nullable=True)
    login_attempts=Column(Integer, default=0)
    locked_until = Column(TIMESTAMP, nullable=True)

    #Verificacion
    verification_token = Column(String(255), nulleable=True, unique=True)
    reset_password_token = Column(String(255), nullable=True)
    reset_password_expires = Column(TIMESTAMP, nullable=True)

    #Fechas
    created_at= Column(TIMESTAMP, server_default=func.current_timestamp())
    verified_at = Column(DateTime, nulleable=True)
    updated_at = Column(TIMESTAMP, onupdate=func.current_timestamp())
    
    #Relaciones
    email_tokens = relationship("EmailVeficicacion", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        return{
            "id_user": self.id_user,
            "name": self.name,
            "email": self.email,
            "profile_photo": self.profile_photo,
            "description": self.description,
            "is_active": self.is_active,
            "email_verified": self.email_verified,
            "created_at": self.created_at
        }
    def to_public_dict(self):
        data = self.to_dict()
        data.pop("password_hash", None)
        return data
    
    class EmailVerification(Base):
        __tablename__ = "email_verification"
        id_token = Column(Integer, primary_key=True, autoincrement=True)
        id_user = Column(Integer, ForeignKey("users.id_user", ondelete="CASCADE"))
        token = Column(String(255), unique=True, nulleable=False)
        expires_at = Column(TIMESTAMP, nullable=False)
        created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

        user = relationship("User", back_populates="email_tokens")

    class PasswordReset(Base):
        __tablename__ = "password_reset"
        id_token = Column(Integer, primary_key=True, autoincrement=True)
        is_user=Column(Integer, ForeignKey("users.id_user", ondelete="CASCADE"))
        token = Column(String(255), unique=True, nulleable=False)
        expires_at = Column(TIMESTAMP, nullable=False)
        used = Column(Boolean, default=False)
        created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

        user = relationship("User", back_populates="reset_tokens")

    class Books(Base):
        id_book = Column(Integer, primary_key=True, autoincrement=True)
        tittle_en = Column(String(200), nullable=True)
        tittle_es = Column(String(200), nullable=True)
        tittle_de = Column(String(200), nullable=True)
        author = Column(String(250), nullable=True)
        description_en = Column(String, nullable=True)
        description_es = Column(String, nullable=True)
        description_de = Column(String, nullable=True)
