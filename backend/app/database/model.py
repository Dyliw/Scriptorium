from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    # Datos principales
    id_user = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(30), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_public_id = Column(String(255), nullable=True)

    # Perfil
    profile_photo = Column(Text, nullable=True)
    description = Column(String(500), nullable=True)

    # Estado de la cuenta
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    email_verified_at = Column(TIMESTAMP, nullable=True)
    last_login = Column(TIMESTAMP, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(TIMESTAMP, nullable=True)

    # Fechas
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    verified_at = Column(DateTime, nullable=True)
    updated_at = Column(TIMESTAMP, onupdate=func.current_timestamp())
    
    # Relaciones
    email_tokens = relationship("EmailVerification", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
    typing_sessions = relationship("TypingSession", back_populates="user")
    saved_words = relationship("SavedWords", back_populates="user")
    
    settings_notifications = Column(Boolean, default=True)
    settings_public_profile = Column(Boolean, default=True)
    settings_show_stats = Column(Boolean, default=True)
    settings_language = Column(String(10), default='es')
    settings_theme = Column(String(20), default='light')
    settings_typing_sound = Column(Boolean, default=True)


    def to_dict(self):
        return {
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
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

    user = relationship("User", back_populates="email_tokens")


class PasswordReset(Base):
    __tablename__ = "password_reset"
    
    id_token = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete="CASCADE"))
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

    user = relationship("User", back_populates="reset_tokens")


class Books(Base):
    __tablename__ = "books"
    
    id_book = Column(Integer, primary_key=True, autoincrement=True)
    title_en = Column(String(200), nullable=True)
    title_es = Column(String(200), nullable=True)
    title_de = Column(String(200), nullable=True)
    author = Column(String(250), nullable=True)
    description_en = Column(Text, nullable=True)
    description_es = Column(Text, nullable=True)
    description_de = Column(Text, nullable=True)
    
    # Relación con capítulos
    chapters = relationship("Chapters", back_populates="book", cascade="all, delete-orphan")


class Chapters(Base):
    __tablename__ = "chapters"
    
    id_chapter = Column(Integer, primary_key=True, autoincrement=True)
    id_book = Column(Integer, ForeignKey("books.id_book", ondelete="CASCADE"))
    chapter_number = Column(Integer, nullable=True)
    title_en = Column(String(200), nullable=True)
    title_es = Column(String(200), nullable=True)
    title_de = Column(String(200), nullable=True)
    content_en = Column(Text, nullable=True)
    content_es = Column(Text, nullable=True)
    content_de = Column(Text, nullable=True)
    
    # Relaciones
    book = relationship("Books", back_populates="chapters")
    typing_sessions = relationship("TypingSession", back_populates="chapter")


class TypingSession(Base):
    __tablename__ = "typing_session"
    
    id_typing = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete="CASCADE"))
    id_chapter = Column(Integer, ForeignKey("chapters.id_chapter", ondelete="CASCADE"))
    mode = Column(String(30), default="Classic", nullable=False)
    started_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    completed_at = Column(TIMESTAMP, nullable=True)
    wpm = Column(DECIMAL(5,2), nullable=True)
    accuracy = Column(DECIMAL(5,2), nullable=True)
    total_keystrokes = Column(Integer, nullable=True)
    error_count = Column(Integer, nullable=True)
    
    # Relaciones
    user = relationship("User", back_populates="typing_sessions")
    chapter = relationship("Chapters", back_populates="typing_sessions")


class SavedWords(Base):
    __tablename__ = "saved_words"
    
    id_words = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete="CASCADE"))
    word = Column(String(255), nullable=True)
    context_sentence = Column(Text, nullable=True)
    id_chapter = Column(Integer, ForeignKey("chapters.id_chapter", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relaciones
    user = relationship("User", back_populates="saved_words")
    chapter = relationship("Chapters")


class RateLimit(Base):
    __tablename__ = "rate_limits"
    
    id_limit = Column(Integer, primary_key=True, autoincrement=True)
    ip_address = Column(String(45), nullable=False)
    action = Column(String(50), nullable=False)
    attempts = Column(Integer, default=1)
    first_attempt = Column(TIMESTAMP, server_default=func.current_timestamp())
    last_attempt = Column(TIMESTAMP, server_default=func.current_timestamp())

