from fastapi import APIRouter
import logging
from app.api.v1 import auth, book, user, progress, session, word, userlibrary


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(book.router, prefix="/books", tags=["Libros"])
api_router.include_router(user.router, prefix="/user", tags=["Usuarios"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progreso"])
api_router.include_router(session.router, prefix="/session", tags=["Sesión"])
api_router.include_router(word.router, prefix="/word", tags=["Palabras"])
api_router.include_router(userlibrary.router, prefix="/userlibrary", tags=["Libreria"])
