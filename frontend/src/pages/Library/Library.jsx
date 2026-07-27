import React, { useState, useEffect } from 'react';
import { useBooks } from '../../hooks/useBook';
import BookCard from '../../components/Library/BookCard';
import SearchBar from '../../components/Library/SearchBar';
import { ChevronLeft, ChevronRight, BookOpen, Loader } from 'lucide-react';
import './Library.css';

const Library = () => {
  const [language, setLanguage] = useState('es');
  const { books, loading, error, total, params, updateParams, goToPage } = useBooks({
    language: 'es',
    limit: 12
  });

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / params.limit);

  const handleSearch = (searchTerm) => {
    updateParams({ search: searchTerm, skip: 0 });
    setCurrentPage(1);
  };

  const handleFilterChange = (filters) => {
    updateParams({ ...filters, skip: 0 });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && books.length === 0) {
    return (
      <div className="library-loader">
        <Loader className="loader-icon" />
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-container">
        {/* Barra de búsqueda */}
        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          initialSearch={params.search}
          initialLanguage={params.language}
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="library-content">
          {/* Cabecera con contador y selector de idioma */}
          <div className="library-header">
            <p className="result-count">
              {total} {total === 1 ? 'libro encontrado' : 'libros encontrados'}
            </p>
            <div className="language-selector">
              <span className="language-label">Idioma:</span>
              <select
                value={params.language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  handleFilterChange({ language: e.target.value });
                }}
                className="language-select"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Grid de libros */}
          {books.length === 0 && !loading ? (
            <div className="empty-state">
              <BookOpen className="empty-icon" />
              <p className="empty-title">No se encontraron libros</p>
              <p className="empty-subtitle">Intenta con otros filtros de búsqueda</p>
            </div>
          ) : (
            <div className="books-grid">
              {books.map((book) => (
                <BookCard key={book.id_book} book={book} language={params.language} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >
                <ChevronLeft />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-page ${
                      currentPage === pageNum ? 'active' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
