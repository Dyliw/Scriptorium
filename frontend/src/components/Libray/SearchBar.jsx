import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onFilterChange, initialSearch = '', initialLanguage = 'es' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [difficulty, setDifficulty] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    onFilterChange({ language: lang });
  };

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    onFilterChange({ difficulty: diff });
  };

  return (
    <div className="searchbar-wrapper">
      <form onSubmit={handleSubmit} className="searchbar-form">
        <div className="searchbar-container">
          <div className="searchbar-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título o autor..."
              className="searchbar-input"
            />
            <Search className="searchbar-icon" />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="searchbar-filter-btn"
          >
            <Filter className="filter-icon" />
          </button>
          
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="searchbar-clear-btn"
            >
              <X className="clear-icon" />
            </button>
          )}
          
          <button
            type="submit"
            className="searchbar-submit-btn"
          >
            Buscar
          </button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="searchbar-filters">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  Idioma
                </label>
                <div className="filter-options">
                  {['es', 'en', 'de'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`filter-option ${language === lang ? 'active' : ''}`}
                    >
                      {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Deutsch'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  Dificultad
                </label>
                <div className="filter-options">
                  <button
                    type="button"
                    onClick={() => handleDifficultyChange('')}
                    className={`filter-option ${difficulty === '' ? 'active' : ''}`}
                  >
                    Todos
                  </button>
                  {['beginner', 'intermediate', 'advanced'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleDifficultyChange(diff)}
                      className={`filter-option ${difficulty === diff ? 'active' : ''}`}
                    >
                      {diff === 'beginner' ? 'Principiante' : 
                       diff === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
