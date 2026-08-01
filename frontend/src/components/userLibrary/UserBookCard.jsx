import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, CheckCircle, Clock,Trash2,ChevronRight, Award, Zap } from 'lucide-react';

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
      return { label: 'Completado', color: 'text-green-600', bg: 'bg-green-100' };
    }
    if (book.progress_percentage > 0) {
      return { label: 'En progreso', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    return { label: 'No iniciado', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={`/library/book/${book.id_book}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                {getTitle()}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {book.book_author || 'Autor desconocido'}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onToggleFavorite(book.id_book)}
              className={`p-2 rounded-full transition-colors ${
                book.is_favorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={book.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Star className={`w-5 h-5 ${book.is_favorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${showOptions ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">{getProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          
          {book.total_chapters > 0 && (
            <span className="text-xs text-gray-500 flex items-center">
              <BookOpen className="w-3 h-3 mr-1" />
              {book.completed_chapters || 0}/{book.total_chapters} capítulos
            </span>
          )}
          
          {book.user_rating && (
            <span className="text-xs text-gray-500 flex items-center">
              <Award className="w-3 h-3 mr-1 text-yellow-400" />
              {book.user_rating}/5
            </span>
          )}
        </div>
        {showOptions && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            <button
              onClick={() => onUpdateProgress(book.id_book, { progress_percentage: 100, is_completed: true })}
              className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Marcar como completado
            </button>
            
            <Link
              to={`/practice/${book.id_book}/${book.last_chapter_id || ''}`}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center"
            >
              <Zap className="w-3 h-3 mr-1" />
              Continuar practicando
            </Link>
            
            <button
              onClick={() => onRemove(book.id_book)}
              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Eliminar
            </button>
          </div>
        )}
        {book.last_practiced && (
          <p className="mt-2 text-xs text-gray-400">
            Última práctica: {new Date(book.last_practiced).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserBookCard;
