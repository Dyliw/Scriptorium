import React, { useState } from 'react';
import { useUserLibrary, useLibrarySummary } from '../../hooks/useUserLibrary';
import { useWords } from '../../hooks/useWords';
import UserBooksList from '../../components/UserLibrary/UserBookList';
import FlashcardSection from '../../components/UserLibrary/FlashcardSection';
import LibraryStats from '../../components/UserLibrary/LibraryStats';
import { BookOpen, Layers, Search, Filter, X } from 'lucide-react';

const UserLibrary = () => {
  const [activeTab, setActiveTab] = useState('books'); 
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    books,
    loading: booksLoading,
    total,
    favoritesCount,
    completedCount,
    inProgressCount,
    params,
    updateParams,
    toggleFavorite,
    removeBook,
    updateBookProgress,
    refetch: refetchBooks
  } = useUserLibrary();

  const { summary, loading: summaryLoading } = useLibrarySummary();

  const {
    words,
    loading: wordsLoading,
    total: wordsTotal,
    deleteWord,
    saveWord,
    refetch: refetchWords
  } = useWords();

  const handleFilterChange = (newParams) => {
    updateParams(newParams);
    setFilter(
      newParams.only_favorites ? 'favorites' :
      newParams.only_completed ? 'completed' :
      newParams.only_in_progress ? 'in_progress' :
      'all'
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (activeTab === 'books') {
      updateParams({ search: value });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateParams({ search: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Biblioteca</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus libros y palabras guardadas
          </p>
        </div>

        <div className="mb-8">
          <LibraryStats summary={summary} loading={summaryLoading} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'books'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Mis Libros
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                {total}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'flashcards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Layers className="w-4 h-4 mr-2" />
              Flashcards
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                {wordsTotal}
              </span>
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'books' ? 'Buscar en mis libros...' : 'Buscar palabras...'}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'books' ? (
            <UserBooksList
              books={books}
              loading={booksLoading}
              total={total}
              favoritesCount={favoritesCount}
              completedCount={completedCount}
              inProgressCount={inProgressCount}
              onToggleFavorite={toggleFavorite}
              onRemoveBook={removeBook}
              onUpdateProgress={updateBookProgress}
              filter={filter}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <FlashcardSection
              words={words}
              onDeleteWord={deleteWord}
              onSaveWord={saveWord}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (activeTab === 'books') {
                refetchBooks();
              } else {
                refetchWords();
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLibrary;
