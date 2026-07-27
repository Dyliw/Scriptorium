import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Clock, Star } from 'lucide-react';
import './BookCard.css';

const BookCard = ({ book, language = 'es' }) => {
  const getTitle = () => {
    return book[`title_${language}`] || book.title_es || book.title_en || 'Sin título';
  };

  const getDescription = () => {
    const desc = book[`description_${language}`] || book.description_es || book.description_en;
    return desc ? desc.substring(0, 150) + '...' : 'Sin descripción disponible';
  };

  const difficultyColors = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced'
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  return (
    <div className="book-card">
      <Link to={`/library/book/${book.id_book}`} className="book-card-link">
        <div className="book-card-content">
          {/* Encabezado */}
          <div className="book-card-header">
            <h3 className="book-card-title">
              {getTitle()}
            </h3>
            <span className={`difficulty-badge ${difficultyColors[book.difficulty] || ''}`}>
              {difficultyLabels[book.difficulty] || book.difficulty}
            </span>
          </div>

          <div className="book-card-author">
            <User className="card-author-icon" />
            <span className="card-author-name">{book.author || 'Autor desconocido'}</span>
          </div>

          <p className="book-card-description">
            {getDescription()}
          </p>

          <div className="book-card-stats">
            <div className="stat-item">
              <BookOpen className="stat-icon" />
              <span>{book.chapters_count || 0} capítulos</span>
            </div>
            {book.avg_rating && (
              <div className="stat-item">
                <Star className="stat-icon rating-star" />
                <span>{book.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BookCard;
