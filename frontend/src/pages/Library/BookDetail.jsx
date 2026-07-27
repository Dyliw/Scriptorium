import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookDetail } from '../../hooks/useBook';
import ChapterList from '../../components/Library/ChapterList';
import BookStats from '../../components/Library/BookStats';
import { ArrowLeft,User, BookOpen, Star, Clock, Calendar, MessageSquare, Loader} from 'lucide-react';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [language, setLanguage] = useState('es');
  const [showStats, setShowStats] = useState(true);
  const { book, loading, error } = useBookDetail(bookId, language);

  if (loading) {
    return (
      <div className="detail-loader">
        <Loader className="loader-icon" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error-container">
        <div className="detail-error-content">
          <p className="error-text">{error}</p>
          <Link to="/library" className="error-link">
            Volver a la biblioteca
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="detail-error-container">
        <div className="detail-error-content">
          <p className="not-found-text">Libro no encontrado</p>
          <Link to="/library" className="error-link">
            Volver a la biblioteca
          </Link>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    return book[`title_${language}`] || book.title_es || book.title_en || 'Sin título';
  };

  const getDescription = () => {
    return book[`description_${language}`] || book.description_es || book.description_en || 'Sin descripción';
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <Link to="/library" className="back-button">
          <ArrowLeft className="back-icon" />
          Volver a la biblioteca
        </Link>

        <div className="detail-language-selector">
          <div className="language-wrapper">
            <span className="language-label">Idioma:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        <div className="book-info-card">
          <div className="book-info-content">
            <div className="book-info-layout">
              <div className="book-cover-container">
                <div className="book-cover-placeholder">
                  <BookOpen className="cover-icon" />
                </div>
              </div>

              <div className="book-details">
                <h1 className="book-title">
                  {getTitle()}
                </h1>
                
                <div className="book-author">
                  <User className="author-icon" />
                  <span className="author-name">{book.author || 'Autor desconocido'}</span>
                </div>

                <div className="book-tags">
                  <span className={`difficulty-tag ${
                    book.difficulty === 'beginner' ? 'beginner' :
                    book.difficulty === 'intermediate' ? 'intermediate' :
                    'advanced'
                  }`}>
                    {difficultyLabels[book.difficulty] || book.difficulty}
                  </span>
                  <span className="chapters-tag">
                    {book.chapters_count || 0} capítulos
                  </span>
                </div>

                <p className="book-description">
                  {getDescription()}
                </p>

                <div className="book-meta">
                  <div className="meta-item">
                    <Calendar className="meta-icon" />
                    <span>Publicado: {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {book.avg_rating && (
                    <div className="meta-item">
                      <Star className="meta-icon rating-icon" />
                      <span>{book.avg_rating.toFixed(1)} / 5.0</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              onClick={() => setShowStats(false)}
              className={`tab-button ${!showStats ? 'active' : ''}`}
            >
              Capítulos
            </button>
            <button
              onClick={() => setShowStats(true)}
              className={`tab-button ${showStats ? 'active' : ''}`}
            >
              Estadísticas
            </button>
          </div>
        </div>

        <div className="tab-content">
          {showStats ? (
            <BookStats bookId={bookId} />
          ) : (
            <ChapterList
              chapters={book.chapters || []}
              bookId={bookId}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
