from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.schemas.progress import (
    OverallProgress, BookProgress, ChapterProgress,
    ProgressTimeline, TimelinePoint, DetailedStats, DailyProgress
)
from app.controller.progresscontroller import ProgressRepository
from app.controller.book import BookRepository
from app.controller.usercontroller import UserRepository

class ProgressService:
    
    def __init__(
        self,
        progress_repo: ProgressRepository,
        book_repo: BookRepository,
        user_repo: UserRepository
    ):
        self.progress_repo = progress_repo
        self.book_repo = book_repo
        self.user_repo = user_repo
    
    
    def get_overall_progress(self, user_id: int) -> OverallProgress:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        completed_chapter_ids = self.progress_repo.get_completed_chapter_ids(user_id)
        completed_chapters = len(completed_chapter_ids)
        
        chapter_stats = self.progress_repo.get_completed_chapter_ids_with_stats(user_id)
        chapters_by_book = self.progress_repo.get_chapters_by_book()
        chapter_count_by_book = {
            book_id: len(chapters) 
            for book_id, chapters in chapters_by_book.items()
        }
        book_titles = self.progress_repo.get_book_titles()
        book_progress = []
        completed_books = 0
        all_books_progress = []
        
        for book_id, chapters in chapters_by_book.items():
            completed_in_book = sum(
                1 for c in chapters 
                if c['id_chapter'] in completed_chapter_ids
            )
            total_in_book = len(chapters)
            best_wpm = 0.0
            last_practice = None
            
            for chapter in chapters:
                if chapter['id_chapter'] in chapter_stats:
                    stats = chapter_stats[chapter['id_chapter']]
                    if stats['best_wpm'] > best_wpm:
                        best_wpm = stats['best_wpm']
                    if stats['last_practice'] and (not last_practice or stats['last_practice'] > last_practice):
                        last_practice = stats['last_practice']
            
            is_completed = completed_in_book == total_in_book and total_in_book > 0
            if is_completed:
                completed_books += 1
            
            percentage = (completed_in_book / total_in_book * 100) if total_in_book > 0 else 0
            
            book_progress.append(BookProgress(
                book_id=book_id,
                book_title=book_titles.get(book_id, f"Libro {book_id}"),
                total_chapters=total_in_book,
                completed_chapters=completed_in_book,
                percentage=percentage,
                is_completed=is_completed,
                last_practice=last_practice,
                best_wpm=best_wpm if best_wpm > 0 else None
            ))
            
            all_books_progress.append({
                'book_id': book_id,
                'percentage': percentage,
                'completed': is_completed
            })
        
        next_chapter = self._find_next_chapter(
            user_id, 
            chapters_by_book, 
            completed_chapter_ids,
            chapter_stats
        )
        stats = self.progress_repo.get_user_stats(user_id)
        total_books = len(chapters_by_book)
        total_chapters = sum(chapter_count_by_book.values())
        
        return OverallProgress(
            total_books=total_books,
            completed_books=completed_books,
            total_chapters=total_chapters,
            completed_chapters=completed_chapters,
            overall_percentage=(completed_chapters / total_chapters * 100) if total_chapters > 0 else 0,
            books=book_progress,
            next_chapter=next_chapter,
            total_practice_time=stats['total_practice_time'],
            total_sessions=stats['total_sessions'],
            avg_wpm=stats['avg_wpm'],
            avg_accuracy=stats['avg_accuracy']
        )
    
    def _find_next_chapter(
        self, 
        user_id: int,
        chapters_by_book: Dict[int, List[Dict]],
        completed_chapter_ids: List[int],
        chapter_stats: Dict[int, Dict]
    ) -> Optional[ChapterProgress]:
        
        for book_id, chapters in chapters_by_book.items():
            for chapter in chapters:
                if chapter['id_chapter'] not in completed_chapter_ids:
                    stats = chapter_stats.get(chapter['id_chapter'], {})
                    book = self.progress_repo.get_book_by_id(book_id)
                    book_title = book.title_es or book.title_en if book else "Libro"
                    
                    return ChapterProgress(
                        chapter_id=chapter['id_chapter'],
                        chapter_number=chapter['chapter_number'],
                        chapter_title=chapter['title'],
                        book_id=book_id,
                        book_title=book_title,
                        completed=False,
                        best_wpm=stats.get('best_wpm'),
                        best_accuracy=stats.get('best_accuracy'),
                        times_practiced=stats.get('times_practiced', 0),
                        last_practice=stats.get('last_practice')
                    )
        
        return None
    
    def get_book_progress(self, user_id: int, book_id: int) -> BookProgress:
  
        book = self.progress_repo.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Libro no encontrado"
            )
        
        chapters = self.progress_repo.get_chapters_by_book().get(book_id, [])
        
        if not chapters:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El libro no tiene capítulos"
            )
        completed_chapter_ids = self.progress_repo.get_completed_chapter_ids(user_id)
        
        completed_in_book = sum(
            1 for c in chapters 
            if c['id_chapter'] in completed_chapter_ids
        )
        total_in_book = len(chapters)
        is_completed = completed_in_book == total_in_book
        
        chapter_stats = self.progress_repo.get_completed_chapter_ids_with_stats(user_id)
        best_wpm = 0.0
        last_practice = None
        
        for chapter in chapters:
            if chapter['id_chapter'] in chapter_stats:
                stats = chapter_stats[chapter['id_chapter']]
                if stats['best_wpm'] > best_wpm:
                    best_wpm = stats['best_wpm']
                if stats['last_practice'] and (not last_practice or stats['last_practice'] > last_practice):
                    last_practice = stats['last_practice']
        
        percentage = (completed_in_book / total_in_book * 100) if total_in_book > 0 else 0
        
        return BookProgress(
            book_id=book_id,
            book_title=book.title_es or book.title_en or f"Libro {book_id}",
            total_chapters=total_in_book,
            completed_chapters=completed_in_book,
            percentage=percentage,
            is_completed=is_completed,
            last_practice=last_practice,
            best_wpm=best_wpm if best_wpm > 0 else None
        )
    
    def get_chapter_progress(self, user_id: int, chapter_id: int) -> ChapterProgress:
        chapter = self.progress_repo.get_chapter_by_id(chapter_id)
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capítulo no encontrado"
            )
        completed_chapter_ids = self.progress_repo.get_completed_chapter_ids(user_id)
        chapter_stats = self.progress_repo.get_completed_chapter_ids_with_stats(user_id)
        stats = chapter_stats.get(chapter_id, {})
        
        book = self.progress_repo.get_book_by_id(chapter.id_book)
        book_title = book.title_es or book.title_en if book else "Libro"
        
        return ChapterProgress(
            chapter_id=chapter_id,
            chapter_number=chapter.chapter_number,
            chapter_title=chapter.title_es or chapter.title_en or f"Capítulo {chapter.chapter_number}",
            book_id=chapter.id_book,
            book_title=book_title,
            completed=chapter_id in completed_chapter_ids,
            best_wpm=stats.get('best_wpm'),
            best_accuracy=stats.get('best_accuracy'),
            times_practiced=stats.get('times_practiced', 0),
            last_practice=stats.get('last_practice')
        )
    
    # ============ LÍNEA DE TIEMPO ============
    
    def get_progress_timeline(self, user_id: int, days: int = 30) -> ProgressTimeline:
        daily = self.progress_repo.get_daily_progress(user_id, days)
        
        timeline = []
        for point in daily:
            timeline.append(TimelinePoint(
                date=point['date'],
                sessions_count=point['sessions_count'],
                chapters_completed=point['chapters_completed'],
                avg_wpm=point['avg_wpm'],
                avg_accuracy=point['avg_accuracy'],
                cumulative_chapters=point['cumulative_chapters']
            ))
        streak = self.progress_repo.calculate_streak(user_id)
        active_days = len(timeline)
        
        return ProgressTimeline(
            timeline=timeline,
            total_days=days,
            active_days=active_days,
            streak_days=streak
        )
    
    def get_detailed_stats(self, user_id: int) -> DetailedStats:
        stats = self.progress_repo.get_user_stats(user_id)
        
        modes = self.progress_repo.get_sessions_by_mode(user_id)
        
        completed_chapter_ids = self.progress_repo.get_completed_chapter_ids(user_id)
        
        chapters_by_book = self.progress_repo.get_chapters_by_book()
        completed_books = 0
        for book_id, chapters in chapters_by_book.items():
            completed_in_book = sum(
                1 for c in chapters 
                if c['id_chapter'] in completed_chapter_ids
            )
            if completed_in_book == len(chapters) and len(chapters) > 0:
                completed_books += 1
        
        words_count = self.progress_repo.get_words_count(user_id)
        
        longest_streak = self.progress_repo.get_longest_streak(user_id)
        
        return DetailedStats(
            total_sessions=stats['total_sessions'],
            total_practice_time=stats['total_practice_time'],
            total_errors=stats['total_errors'],
            total_keystrokes=stats['total_keystrokes'],
            avg_wpm=stats['avg_wpm'],
            avg_accuracy=stats['avg_accuracy'],
            best_wpm=stats['best_wpm'],
            best_accuracy=stats['best_accuracy'],
            longest_streak=longest_streak,
            sessions_by_mode=modes,
            chapters_completed=len(completed_chapter_ids),
            books_completed=completed_books,
            words_saved=words_count
        )
    def get_recent_activity(self, user_id: int, limit: int = 10) -> List[Dict]:
        return self.progress_repo.get_recent_activity(user_id, limit)
