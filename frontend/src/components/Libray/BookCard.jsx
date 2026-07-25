import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Clock, Star } from 'lucide-react';

const BookCard = ({ book, language = 'es' }) => {
  const getTitle = () => {
    return book[`title_${language}`] || book.title_es || book.title_en || 'Sin título';
  };

  const getDescription = () => {
    const desc = book[`description_${language}`] || book.description_es || book.description_en;
    return desc ? desc.substring(0, 150) + '...' : 'Sin descripción disponible';
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <Link to={`/library/book/${book.id_book}`}>
        <div className="p-6">
          {/* Encabezado */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
              {getTitle()}
            </h3>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[book.difficulty] || 'bg-gray-100 text-gray-800'}`}>
              {difficultyLabels[book.difficulty] || book.difficulty}
            </span>
          </div>

          {/* Autor */}
          <div className="flex items-center text-gray-600 mb-2">
            <User className="w-4 h-4 mr-2" />
            <span className="text-sm">{book.author || 'Autor desconocido'}</span>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {getDescription()}
          </p>

          {/* Estadísticas rápidas */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{book.chapters_count || 0} capítulos</span>
            </div>
            {book.avg_rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
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
