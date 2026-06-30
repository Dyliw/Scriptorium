from typing import Optional, List, Dict
from fastapi import HTTPException, status
from app.schemas.progress import (
    OverallProgress, BookProgress, ChapterProgress, ProgressTimeline
)
from app.controller.progresscontroller import ProgressRepository
from app.controller.book import BookRepository
from backend.app.database.models import Chapters

class ProgressService:
    def __init__(self, progress_repo: ProgressRepository, book_repo: BookRepository):
        self.progress_repo = progress_repo
        self.book_repo = book_repo
    
    def get_overall_progress(self, user_id: int) -> OverallProgress:
        completed_chapter_ids = self.progress_repo.get_completed_chapters(user_id)
        completed_chapters = len(completed_chapter_ids)
        
        total_chapters = self.db.query(Chapters).count()  # Necesitas acceso a db
        
        chapter_count_by_book = self.progress_repo.get_chapter_count_by_book()
        book_titles = self.progress_repo.get_book_titles()
        
        completed_by_book = {}
        for chapter_id in completed_chapter_ids:
            chapter = self.db.query(Chapters).filter(
                Chapters.id_chapter == chapter_id
            ).first()
            if chapter:
                book_id = chapter.id_book
                if book_id not in completed_by_book:
                    completed_by_book[book_id] = []
                completed_by_book[book_id].append(chapter_id)
        
        book_progress = []
        completed_books = 0
        
        for book_id, total in chapter_count_by_book.items():
            completed = len(completed_by_book.get(book_id, []))
            if completed == total and total > 0:
                completed_books += 1
            
            book_progress.append(BookProgress(
                book_id=book_id,
                book_title=book_titles.get(book_id, f"Libro {book_id}"),
                total_chapters=total,
                completed_chapters=completed,
                percentage=(completed / total * 100) if total > 0 else 0
            ))
        
        next_chapter = None
        for book_id in chapter_count_by_book.keys():
            book_chapters = self.db.query(Chapters).filter(
                Chapters.id_book == book_id
            ).order_by(Chapters.chapter_number).all()
            
            for chapter in book_chapters:
                if chapter.id_chapter not in completed_chapter_ids:
                    stats = self.progress_repo.get_best_chapter_stats(
                        user_id, chapter.id_chapter
                    )
                    next_chapter = ChapterProgress(
                        chapter_id=chapter.id_chapter,
                        chapter_title=chapter.title_es or chapter.title_en,
                        chapter_number=chapter.chapter_number,
                        completed=False,
                        best_wpm=stats['best_wpm'],
                        best_accuracy=stats['best_accuracy'],
                        last_practice=stats['last_practice']
                    )
                    break
            if next_chapter:
                break
        
        return OverallProgress(
            total_books=len(chapter_count_by_book),
            completed_books=completed_books,
            total_chapters=total_chapters,
            completed_chapters=completed_chapters,
            overall_percentage=(completed_chapters / total_chapters * 100) if total_chapters > 0 else 0,
            books=book_progress,
            next_chapter=next_chapter
        )
