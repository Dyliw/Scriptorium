import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título o autor..."
              className="w-full px-4 py-3 pl-12 outline-none text-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 text-gray-500 hover:text-gray-700 border-l"
          >
            <Filter className="w-5 h-5" />
          </button>
          
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 text-gray-400 hover:text-gray-600 border-l"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            Buscar
          </button>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <div className="flex gap-2">
                  {['es', 'en', 'de'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        language === lang
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Deutsch'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDifficultyChange('')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      difficulty === ''
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {['beginner', 'intermediate', 'advanced'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleDifficultyChange(diff)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        difficulty === diff
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
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
