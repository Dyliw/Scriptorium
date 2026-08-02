import React from 'react';
import UserBookCard from './UserBookCard';
import { BookOpen, BookMarked, CheckCircle, Clock } from 'lucide-react';
import './UserBooksList.css';

const UserBooksList = ({ 
  books, 
  loading, 
  total, 
  favoritesCount, 
  completedCount, 
  inProgressCount,
  onToggleFavorite,
  onRemoveBook,
  onUpdateProgress,
  filter,
  onFilterChange
}) => {
  const filters = [
    { id: 'all', label: 'Todos', icon: BookOpen, count: total },
    { id: 'favorites', label: 'Favoritos', icon: BookMarked, count: favoritesCount },
    { id: 'completed', label: 'Completados', icon: CheckCircle, count: completedCount },
    { id: 'in_progress', label: 'En progreso', icon: Clock, count: inProgressCount }
  ];

  const getFilterParam = (filterId) => {
    switch(filterId) {
      case 'favorites': return { only_favorites: true };
      case 'completed': return { only_completed: true };
      case 'in_progress': return { only_in_progress: true };
      default: return {};
    }
  };

  return (
    <div className="user-books-list">
      {/* Filtros */}
      <div className="filter-container">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              const params = getFilterParam(f.id);
              onFilterChange({ ...params, only_favorites: f.id === 'favorites', only_completed: f.id === 'completed', only_in_progress: f.id === 'in_progress' });
            }}
            className={`filter-button ${filter === f.id ? 'active' : ''}`}
          >
            <f.icon className="filter-icon" />
            <span className="filter-label">{f.label}</span>
            <span className={`filter-count ${filter === f.id ? 'active' : ''}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de libros */}
      {loading && books.length === 0 ? (
        <div className="loader-container">
          <div className="loader-spinner"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <p className="empty-title">No hay libros en esta sección</p>
          <p className="empty-subtitle">
            Explora la biblioteca y agrega libros para comenzar a practicar
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <UserBookCard
              key={book.id_user_book}
              book={book}
              onToggleFavorite={onToggleFavorite}
              onRemove={onRemoveBook}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBooksList;
