from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, or_
from app.database.models import UserBooks, UserBookStats, Books, Chapters

class UserLibraryRepository:
    def __init__(self, db: Session):
        self.db = db
    def add_book_to_user_library(self, user_id: int, book_id: int, data: Dict[str, Any]) -> UserBooks:
        """Agregar un libro a la biblioteca del usuario"""
        user_book = UserBooks(
            id_user=user_id,
            id_book=book_id,
            **data
        )
        self.db.add(user_book)
        self.db.commit()
        self.db.refresh(user_book)
        return user_book
    
    def get_user_book(self, user_id: int, book_id: int) -> Optional[UserBooks]:
        """Obtener un libro específico de la biblioteca del usuario"""
        return self.db.query(UserBooks).filter(
            and_(
                UserBooks.id_user == user_id,
                UserBooks.id_book == book_id
            )
        ).first()
    
    def get_user_book_by_id(self, user_book_id: int) -> Optional[UserBooks]:
        return self.db.query(UserBooks).filter(
            UserBooks.id_user_book == user_book_id
        ).first()
    
    def get_user_library(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 20,
        only_favorites: bool = False,
        only_completed: bool = False,
        only_in_progress: bool = False,
        search: Optional[str] = None
    ) -> List[UserBooks]:
        query = self.db.query(UserBooks).filter(UserBooks.id_user == user_id)
        
        if only_favorites:
            query = query.filter(UserBooks.is_favorite == True)
        if only_completed:
            query = query.filter(UserBooks.is_completed == True)
        if only_in_progress:
            query = query.filter(
                and_(
                    UserBooks.is_completed == False,
                    UserBooks.progress_percentage > 0
                )
            )
        
        if search:
            query = query.join(Books).filter(
                or_(
                    Books.title_en.ilike(f"%{search}%"),
                    Books.title_es.ilike(f"%{search}%"),
                    Books.title_de.ilike(f"%{search}%"),
                    Books.author.ilike(f"%{search}%")
                )
            )
        
        return query.order_by(UserBooks.added_at.desc()).offset(skip).limit(limit).all()
    
    def count_user_books(self, user_id: int, **filters) -> int:
        query = self.db.query(UserBooks).filter(UserBooks.id_user == user_id)
        
        if filters.get('only_favorites'):
            query = query.filter(UserBooks.is_favorite == True)
        if filters.get('only_completed'):
            query = query.filter(UserBooks.is_completed == True)
        if filters.get('only_in_progress'):
            query = query.filter(
                and_(
                    UserBooks.is_completed == False,
                    UserBooks.progress_percentage > 0
                )
            )
        
        return query.count()
    
    def update_user_book(self, user_book_id: int, data: Dict[str, Any]) -> Optional[UserBooks]:
        user_book = self.get_user_book_by_id(user_book_id)
        if not user_book:
            return None
        
        for key, value in data.items():
            if value is not None and hasattr(user_book, key):
                setattr(user_book, key, value)
        
        if data.get('is_completed') and not user_book.completed_at:
            user_book.completed_at = func.current_timestamp()
        
        self.db.commit()
        self.db.refresh(user_book)
        return user_book
    
    def remove_book_from_library(self, user_id: int, book_id: int) -> bool:
        user_book = self.get_user_book(user_id, book_id)
        if user_book:
            self.db.delete(user_book)
            self.db.commit()
            return True
        return False
    
    def toggle_favorite(self, user_id: int, book_id: int) -> Optional[UserBooks]:
        user_book = self.get_user_book(user_id, book_id)
        if user_book:
            user_book.is_favorite = not user_book.is_favorite
            self.db.commit()
            self.db.refresh(user_book)
        return user_book

    def get_or_create_stats(self, user_book_id: int) -> UserBookStats:
        """Obtener o crear estadísticas para un user_book"""
        stats = self.db.query(UserBookStats).filter(
            UserBookStats.id_user_book == user_book_id
        ).first()
        
        if not stats:
            stats = UserBookStats(id_user_book=user_book_id)
            self.db.add(stats)
            self.db.commit()
            self.db.refresh(stats)
        
        return stats
    
    def update_stats(self, user_book_id: int, data: Dict[str, Any]) -> UserBookStats:
        stats = self.get_or_create_stats(user_book_id)
        
        for key, value in data.items():
            if value is not None and hasattr(stats, key):
                setattr(stats, key, value)
        
        self.db.commit()
        self.db.refresh(stats)
        return stats
    
    def get_stats(self, user_book_id: int) -> Optional[UserBookStats]:
        return self.db.query(UserBookStats).filter(
            UserBookStats.id_user_book == user_book_id
        ).first()
    

    def get_library_summary(self, user_id: int) -> Dict[str, Any]:
        total = self.db.query(UserBooks).filter(UserBooks.id_user == user_id).count()
        completed = self.db.query(UserBooks).filter(
            and_(
                UserBooks.id_user == user_id,
                UserBooks.is_completed == True
            )
        ).count()
        favorites = self.db.query(UserBooks).filter(
            and_(
                UserBooks.id_user == user_id,
                UserBooks.is_favorite == True
            )
        ).count()
        in_progress = self.db.query(UserBooks).filter(
            and_(
                UserBooks.id_user == user_id,
                UserBooks.is_completed == False,
                UserBooks.progress_percentage > 0
            )
        ).count()
        \
        stats_agg = self.db.query(
            func.sum(UserBookStats.total_practice_time).label('total_time'),
            func.sum(UserBookStats.sessions_count).label('total_sessions'),
            func.avg(UserBookStats.avg_wpm).label('avg_wpm'),
            func.avg(UserBookStats.avg_accuracy).label('avg_accuracy')
        ).join(UserBooks).filter(UserBooks.id_user == user_id).first()
        
        return {
            'total_books': total,
            'completed_books': completed,
            'in_progress_books': in_progress,
            'favorite_books': favorites,
            'total_practice_time': stats_agg.total_time or 0,
            'total_sessions': stats_agg.total_sessions or 0,
            'average_wpm': stats_agg.avg_wpm,
            'average_accuracy': stats_agg.avg_accuracy
        }
