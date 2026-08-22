from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import func, and_

from app.database.db import get_db
from app.database.models import Books, Chapters, TypingSession, UserBooks, UserBookStats
from app.services.bookservice import BookService
from app.controller.book import BookRepository
from app.schemas.book_stats import (
    BookStatsResponse,
    ChapterStat,
    WpmHistoryPoint
)

router = APIRouter()

def get_book_repository(db: Session = Depends(get_db)) -> BookRepository:
    return BookRepository(db)

def get_book_service(repository: BookRepository = Depends(get_book_repository)) -> BookService:
    return BookService(repository)

@router.get("/{book_id}/stats", response_model=BookStatsResponse)
async def get_book_stats(
    book_id: int,
    db: Session = Depends(get_db),
    book_service: BookService = Depends(get_book_service)
):

    book = book_service.get_book(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Libro no encontrado"
        )
    
    total_readers = db.query(UserBooks).filter(
        UserBooks.id_book == book_id
    ).count()
    
    completed_users = db.query(UserBooks).filter(
        and_(
            UserBooks.id_book == book_id,
            UserBooks.is_completed == True
        )
    ).count()
    in_progress_users = db.query(UserBooks).filter(
        and_(
            UserBooks.id_book == book_id,
            UserBooks.is_completed == False,
            UserBooks.progress_percentage > 0
        )
    ).count()
    
    not_started_users = total_readers - completed_users - in_progress_users
    stats_agg = db.query(
        func.avg(TypingSession.wpm).label('avg_wpm'),
        func.avg(TypingSession.accuracy).label('avg_accuracy'),
        func.avg(TypingSession.duration_seconds).label('avg_duration')
    ).join(Chapters).filter(
        Chapters.id_book == book_id,
        TypingSession.completed_at.isnot(None)
    ).first()
    
    avg_wpm = float(stats_agg.avg_wpm) if stats_agg and stats_agg.avg_wpm else 0
    avg_accuracy = float(stats_agg.avg_accuracy) if stats_agg and stats_agg.avg_accuracy else 0
    avg_time = (float(stats_agg.avg_duration) / 60) if stats_agg and stats_agg.avg_duration else 0
    
    wpm_history = db.query(
        func.date(TypingSession.completed_at).label('date'),
        func.avg(TypingSession.wpm).label('avg_wpm')
    ).join(Chapters).filter(
        Chapters.id_book == book_id,
        TypingSession.completed_at.isnot(None),
        TypingSession.completed_at >= datetime.now() - timedelta(days=30)
    ).group_by(func.date(TypingSession.completed_at)).order_by(
        func.date(TypingSession.completed_at)
    ).all()
    
    wpm_history_data = [
        {"date": item.date.strftime("%Y-%m-%d"), "wpm": float(item.avg_wpm) if item.avg_wpm else 0}
        for item in wpm_history
    ]
    
    if not wpm_history_data:
        wpm_history_data = [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "wpm": 30 + (i * 2)}
            for i in range(6, -1, -1)
        ]
    
    chapters = db.query(Chapters).filter(
        Chapters.id_book == book_id
    ).order_by(Chapters.chapter_number).all()
    
    chapters_stats = []
    for chapter in chapters:
        chapter_stats = db.query(
            func.count(TypingSession.id_typing).label('sessions'),
            func.avg(TypingSession.wpm).label('avg_wpm'),
            func.avg(TypingSession.accuracy).label('avg_accuracy'),
            func.avg(TypingSession.duration_seconds).label('avg_duration')
        ).filter(
            TypingSession.id_chapter == chapter.id_chapter,
            TypingSession.completed_at.isnot(None)
        ).first()
        
        unique_readers = db.query(
            func.count(func.distinct(TypingSession.id_user))
        ).filter(
            TypingSession.id_chapter == chapter.id_chapter
        ).scalar() or 0
        
        chapters_stats.append(ChapterStat(
            id=chapter.id_chapter,
            number=chapter.chapter_number or 0,
            title=chapter.title_es or chapter.title_en or f"Capítulo {chapter.chapter_number}",
            readers=unique_readers,
            avg_wpm=float(chapter_stats.avg_wpm) if chapter_stats and chapter_stats.avg_wpm else 0,
            avg_accuracy=float(chapter_stats.avg_accuracy) if chapter_stats and chapter_stats.avg_accuracy else 0,
            avg_time=(float(chapter_stats.avg_duration) / 60) if chapter_stats and chapter_stats.avg_duration else 0
        ))
    
    difficulty_counts = {
        'beginner_count': 0,
        'intermediate_count': 0,
        'advanced_count': 0
    }
    
    if book.difficulty:
        diff_key = f"{book.difficulty}_count"
        if diff_key in difficulty_counts:
            difficulty_counts[diff_key] = total_readers
    
    return BookStatsResponse(
        total_readers=total_readers,
        avg_wpm=round(avg_wpm, 2),
        avg_accuracy=round(avg_accuracy, 2),
        avg_time=round(avg_time, 2),
        completed_users=completed_users,
        in_progress_users=in_progress_users,
        not_started_users=not_started_users,
        beginner_count=difficulty_counts['beginner_count'],
        intermediate_count=difficulty_counts['intermediate_count'],
        advanced_count=difficulty_counts['advanced_count'],
        wpm_history=wpm_history_data,
        chapters_stats=chapters_stats
    )
