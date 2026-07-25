import React, { useState, useEffect } from 'react';
import { useBookContent } from '../../hooks/usebooks';
import './BookSelector.css';

const BookSelector = ({ 
    onSelectChapter, 
    initialBookId = null,
    className = '' 
}) => {
    const {
        books,
        chapters,
        currentBook,
        currentChapter,
        practiceContent,
        loading,
        error,
        selectBook,
        selectChapter,
        changeLanguage,
        language
    } = useBookContent(initialBookId);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState(initialBookId);
    const [selectedChapterId, setSelectedChapterId] = useState(null);

    // Seleccionar libro
    const handleBookSelect = async (bookId) => {
        setSelectedBookId(bookId);
        await selectBook(bookId);
        setSelectedChapterId(null);
        // Resetear selección de capítulo
        if (onSelectChapter) {
            onSelectChapter(null);
        }
    };

    // Seleccionar capítulo
    const handleChapterSelect = async (chapterId) => {
        setSelectedChapterId(chapterId);
        const result = await selectChapter(chapterId);

        if (result && onSelectChapter) {
            onSelectChapter({
                chapter: result.chapter,
                content: result.content,
                book: currentBook
            });
        }
        setIsOpen(false);
    };

    // Cambiar idioma
    const handleLanguageChange = (lang) => {
        changeLanguage(lang);
    };

    if (loading) {
        return (
            <div className="book-selector loading">
                <div className="spinner">⏳</div>
                <span>Cargando libros...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-selector error">
                <span className="error-icon">❌</span>
                <span>{error}</span>
                <button onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={`book-selector ${className}`}>
            <button 
                className="book-selector-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="selector-icon"></span>
                <span className="selector-text">
                    {currentChapter 
                        ? `${currentBook?.title || 'Libro'} - ${currentChapter.title}`
                        : 'Seleccionar texto'}
                </span>
                <span className={`selector-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="book-dropdown">
                    {/* Selector de idioma */}
                    <div className="language-selector">
                        <button 
                            className={`lang-btn ${language === 'es' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('es')}
                        >
                            🇪🇸 Español
                        </button>
                        <button 
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('en')}
                        >
                            🇬🇧 English
                        </button>
                        <button
                        className={`lang-btn ${language === 'de' ? 'active': ''}`}
                        onClick={() =>handleLanguageChange('de')}
                        >De deutsch</button>
                    </div>

                    <div className="book-content">
                        {/* Lista de libros */}
                        <div className="books-list">
                            <h4>Libros</h4>
                            {books.map((book) => (
                                <button
                                    key={book.id_book}
                                    className={`book-item ${selectedBookId === book.id_book ? 'active' : ''}`}
                                    onClick={() => handleBookSelect(book.id_book)}
                                >
                                    <span className="book-icon">📖</span>
                                    <div className="book-info">
                                        <span className="book-title">{book[`title_${language}`] ?? book.title_es ?? book.title_en ?? book.title_ge}</span>
                                        <span className="book-author">{book.author}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Lista de capítulos */}
                        {selectedBookId && (
                            <div className="chapters-list">
                                <h4>Capítulos</h4>
                                {chapters.map((chapter) => (
                                    <button
                                        key={chapter.id_chapter}
                                        className={`chapter-item ${selectedChapterId === chapter.id_chapter ? 'active' : ''}`}
                                        onClick={() => handleChapterSelect(chapter.id_chapter)}
                                    >
                                        <span className="chapter-icon">📄</span>
                                        <div className="chapter-info">
                                            <span className="chapter-title">{chapter[`title_${language}`] ?? chapter.title_en ?? chapter.title_es ?? chapter.title_ge}</span>
                                            <span className="chapter-difficulty">
                                                {chapter.difficulty || 'Intermedio'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookSelector;
