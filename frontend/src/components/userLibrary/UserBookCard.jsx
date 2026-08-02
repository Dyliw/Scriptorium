import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trash2,
  ChevronRight,
  Award,
  Zap
} from 'lucide-react';
import './UserBookCard.css';

const UserBookCard = ({ book, onToggleFavorite, onRemove, onUpdateProgress }) => {
  const [showOptions, setShowOptions] = useState(false);

  const getTitle = () => {
    return book.book_title || book.title_es || book.title_en || 'Sin título';
  };

  const getProgress = () => {
    return Math.round(book.progress_percentage || 0);
  };

  const getStatus = () => {
    if (book.is_completed) {
      return { label: 'Completado', color: 'completed', bg: 'completed' };
    }
    if (book.progress_percentage > 0) {
      return { label: 'En progreso', color: 'in-progress', bg: 'in-progress' };
    }
    return { label: 'No iniciado', color: 'not-started', bg: 'not-started' };
  };

  const status = getStatus();

  return (
    <div className="user-book-card">
      <div className="user-book-card-content">
        <div className="user-book-card-header">
          {/* Título y autor */}
          <div className="user-book-info">
            <Link to={`/library/book/${book.id_book}`} className="user-book-title-link">
              <h3 className="user-book-title">
                {getTitle()}
              </h3>
            </Link>
            <p className="user-book-author">
              {book.book_author || 'Autor desconocido'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="user-book-actions">
            <button
              onClick={() => onToggleFavorite(book.id_book)}
              className={`favorite-button ${book.is_favorite ? 'active' : ''}`}
              title={book.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Star className={`favorite-icon ${book.is_favorite ? 'filled' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="options-toggle"
            >
              <ChevronRight className={`options-icon ${showOptions ? 'rotated' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-label">Progreso</span>
            <span className="progress-percentage">{getProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Estado y estadísticas rápidas */}
        <div className="book-stats">
          <span className={`status-badge ${status.color}`}>
            {status.label}
          </span>
          
          {book.total_chapters > 0 && (
            <span className="stat-item">
              <BookOpen className="stat-icon" />
              {book.completed_chapters || 0}/{book.total_chapters} capítulos
            </span>
          )}
          
          {book.user_rating && (
            <span className="stat-item">
              <Award className="stat-icon rating-icon" />
              {book.user_rating}/5
            </span>
          )}
        </div>

        {/* Opciones expandidas */}
        {showOptions && (
          <div className="options-container">
            <button
              onClick={() => onUpdateProgress(book.id_book, { progress_percentage: 100, is_completed: true })}
              className="option-button complete-button"
            >
              <CheckCircle className="option-icon" />
              Marcar como completado
            </button>
            
            <Link
              to={`/practice/${book.id_book}/${book.last_chapter_id || ''}`}
              className="option-button practice-button"
            >
              <Zap className="option-icon" />
              Continuar practicando
            </Link>
            
            <button
              onClick={() => onRemove(book.id_book)}
              className="option-button remove-button"
            >
              <Trash2 className="option-icon" />
              Eliminar
            </button>
          </div>
        )}

        {/* Fecha de última práctica */}
        {book.last_practiced && (
          <p className="last-practiced">
            Última práctica: {new Date(book.last_practiced).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserBookCard;
