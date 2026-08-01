import React from 'react';
import UserBookCard from './UserBookCard';
import { BookOpen, BookMarked, CheckCircle, Clock } from 'lucide-react';

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
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              const params = getFilterParam(f.id);
              onFilterChange({ ...params, only_favorites: f.id === 'favorites', only_completed: f.id === 'completed', only_in_progress: f.id === 'in_progress' });
            }}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <f.icon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{f.label}</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              filter === f.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>
      {loading && books.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay libros en esta sección</p>
          <p className="text-gray-400 text-sm mt-2">
            Explora la biblioteca y agrega libros para comenzar a practicar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
