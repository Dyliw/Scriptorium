from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.model import Books, Chapters

class BookRepository:
    def __init__(self, db:Session):
        self.db=db

def create_book(self, data: Dict[str, Any]) -> Books:
        book = Books(**data)
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

def get_book_by_id(self, book_id: int)-> Optional[Books]:
    return self.db.query(Books).filter(Books.id_book == book_id).first()

def get_all_books(self, skip: int=0, limit: int=100, search: Optional[str]=None)-> List[Books]:
    query = self.db.query(Books)
    if search:
        query = query.filter(
            Books.title_en.ilike(f"%{search}%") |
            Books.title_es.ilike(f"%{search}%") |
            Books.title_de.ilike(f"%{search}%") |
            Books.author.ilike(f"%{search}%")
        )
        return query.order_by(Books.id_book).offset(skip).limit(limit).all()
    
def count_books(self, search: Optional[str] = None)-> int:
    query = self.db.query(Books)

    if search:
        query = query.filter(
            Books.title_en.ilike(f"%{search}%") |
            Books.title_es.ilike(f"%{search}%") |
            Books.title_de.ilike(f"%{search}%") |
            Books.author.ilike(f"%{search}%")
        )
        return query.count()
    
def update_book(self, book_id: int, data:Dict[str, Any])-> Optional[Books]:
    book = self.get_book_by_id(book_id)
    if not book:
        return None
    
    for key, value in data.items():
        if value is not None and hasattr(book,key):
            setattr(book, key, value)

    self.db.commit()
    self.db.refresh(book)
    return book

def delete_book(self, book_id: int)->bool:
    book = self.get_book_by_id(book_id)
    if book:
        self.db.delete(book)
        self.db.commit()
        return True
    return False
