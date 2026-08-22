import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI } from '../../api/books';
import { sessionsAPI } from '../../api/sessions';
import TypingArea from '../../components/Practice/TypingArea';
import TimerDisplay from '../../components/common/TimerDisplay';
import StatsDisplay from '../../components/common/StatsDisplay';
import './ReadingMode.css';

const ReadingMode = () => {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [chapters, setChapters] = useState([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [sessionSaved, setSessionSaved] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingState, setTypingState] = useState({
        errors: [],
        typedChars: [],
        currentIndex: 0,
        totalChars: 0,
        isComplete: false,
        accuracy: 100,
        errorCount: 0
    });
    
    const timerRef = useRef(null);
    const typingAreaRef = useRef(null);

    useEffect(() => {
        const loadContent = async () => {
            if (!bookId) {
                setError('No se especificó un libro');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const bookData = await booksAPI.getById(parseInt(bookId));
                setBookTitle(bookData.title_es || bookData.title_en || 'Sin título');

                const chaptersData = await booksAPI.listChapters(parseInt(bookId));
                
                if (!chaptersData || chaptersData.length === 0) {
                    setError('Este libro no tiene capítulos');
                    setLoading(false);
                    return;
                }

                setChapters(chaptersData);

                let selectedIndex = 0;
                let selectedChapter = null;
                
                if (chapterId) {
                    selectedIndex = chaptersData.findIndex(c => c.id_chapter === parseInt(chapterId));
                    if (selectedIndex !== -1) {
                        selectedChapter = chaptersData[selectedIndex];
                    }
                }
                
                if (!selectedChapter) {
                    selectedChapter = chaptersData[0];
                    selectedIndex = 0;
                }

                setCurrentChapterIndex(selectedIndex);
                setChapterTitle(selectedChapter.title_es || selectedChapter.title_en || selectedChapter.title_ge || 'Capítulo');
                
                const content = selectedChapter.content_es || selectedChapter.content_en || selectedChapter.content_ge || '';
                setText(content);
                setIsComplete(false);
                setShowResults(false);
                setSessionSaved(false);
                resetTypingState(content);

            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'Error al cargar el libro');
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [bookId, chapterId]);

    const resetTypingState = useCallback((newText) => {
        setTypingState({
            errors: [],
            typedChars: [],
            currentIndex: 0,
            totalChars: newText?.length || text.length,
            isComplete: false,
            accuracy: 100,
            errorCount: 0
        });
        setIsTyping(false);
        setIsComplete(false);
        setShowResults(false);
        setSessionSaved(false);
        
        if (timerRef.current?.reset) {
            timerRef.current.reset(0);
        }
        
        if (typingAreaRef.current?.reset) {
            typingAreaRef.current.reset();
        }
    }, [text]);

    const loadChapter = useCallback((index) => {
        if (index < 0 || index >= chapters.length) return;
        
        const chapter = chapters[index];
        setCurrentChapterIndex(index);
        setChapterTitle(chapter.title_es || chapter.title_en || chapter.title_ge || 'Capítulo');
        const content = chapter.content_es || chapter.content_en || chapter.content_ge || '';
        setText(content);
        resetTypingState(content);
        
        navigate(`/reading/${bookId}/${chapter.id_chapter}`, { replace: true });
    }, [chapters, bookId, navigate, resetTypingState]);

    const goToNextChapter = useCallback(() => {
        if (currentChapterIndex < chapters.length - 1) {
            loadChapter(currentChapterIndex + 1);
        }
    }, [currentChapterIndex, chapters.length, loadChapter]);

    const goToPreviousChapter = useCallback(() => {
        if (currentChapterIndex > 0) {
            loadChapter(currentChapterIndex - 1);
        }
    }, [currentChapterIndex, loadChapter]);

    const handleProgress = useCallback((data) => {
        const isTypingNow = data.currentIndex > 0 && !data.isComplete;
        setIsTyping(isTypingNow);
        setShowResults(false);
        
        setTypingState({
            currentIndex: data.currentIndex || 0,
            errors: data.errors || [],
            typedChars: data.typedChars || [],
            totalChars: text.length,
            isComplete: data.isComplete || false,
            accuracy: data.accuracy || 100,
            errorCount: data.errorCount || 0
        });
    }, [text]);

    const handleComplete = useCallback((data) => {
        setIsTyping(false);
        setIsComplete(true);
        setShowResults(true);
        
        setTypingState(prev => ({
            ...prev,
            isComplete: true,
            errors: data.errors || [],
            typedChars: data.typedChars || [],
            currentIndex: text.length,
            accuracy: data.accuracy || 100,
            errorCount: data.errorCount || 0
        }));

        try {
            const elapsedTime = timerRef.current?.getTime?.() || 30;
            const totalChars = data.typedChars?.length || 0;
            const wpm = totalChars > 0 ? Math.round((totalChars / 5) / (elapsedTime / 60)) : 0;
            
            const chapterId = chapters[currentChapterIndex]?.id_chapter || 1;
            
            const sessionData = {
                id_chapter: chapterId,
                mode: 'reading',
                wpm: Math.max(wpm, 1),
                accuracy: Math.min(data.accuracy || 100, 100),
                total_keystrokes: totalChars,
                error_count: data.errorCount || 0,
                started_at: new Date(Date.now() - (elapsedTime * 1000)).toISOString(),
                completed_at: new Date().toISOString()
            };

            console.log('Guardando sesión de lectura:', sessionData);
            
            sessionsAPI.save(sessionData)
                .then(response => {
                    console.log('✅ Sesión guardada:', response);
                    setSessionSaved(true);
                })
                .catch(error => {
                    console.error('❌ Error al guardar:', error.response?.data);
                });
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }, [text, chapters, currentChapterIndex]);

    const resetTest = useCallback(() => {
        resetTypingState(text);
    }, [text, resetTypingState]);

    if (loading) {
        return <div className="reading-loading">Cargando libro...</div>;
    }

    if (error) {
        return (
            <div className="reading-error">
                <h3>❌ {error}</h3>
                <button onClick={() => navigate('/library')}>Volver a la biblioteca</button>
            </div>
        );
    }

    if (!text) {
        return (
            <div className="reading-empty">
                <h3>No hay texto para mostrar</h3>
                <button onClick={() => navigate('/library')}>Volver a la biblioteca</button>
            </div>
        );
    }

    return (
        <div className="reading-mode-container">
            <div className="reading-header">
                <button onClick={() => navigate('/library')} className="back-btn">
                    ← Biblioteca
                </button>
                <div className="header-info">
                    <h1>{bookTitle}</h1>
                    <span className="chapter-name">{chapterTitle}</span>
                </div>
                <div className="header-actions">
                    <button 
                        onClick={() => navigate(`/library/book/${bookId}`)}
                        className="info-btn"
                        title="Ver detalles del libro"
                    >
                        ℹ️
                    </button>
                </div>
            </div>

            <div className="main-layout">
                <div className="typing-area-wrapper">
                    <TypingArea 
                        key={text}
                        ref={typingAreaRef}
                        text={text}
                        onComplete={handleComplete}
                        onProgress={handleProgress}
                        language="es"
                        className="typing-area"
                    />
                </div>

                <div className="side-panel">
                    <TimerDisplay 
                        ref={timerRef}
                        initialDuration={0}
                        showControls={true}
                        autoStart={false}
                        isTyping={isTyping}
                        isComplete={typingState.isComplete}
                        className="timer-widget"
                        compact={false}
                    />
                    
                    <div className="chapter-navigation">
                        <button 
                            onClick={goToPreviousChapter}
                            disabled={currentChapterIndex === 0}
                            className="nav-btn prev-btn"
                        >
                            ← Anterior
                        </button>
                        
                        <span className="chapter-counter">
                            {currentChapterIndex + 1} / {chapters.length}
                        </span>
                        
                        <button 
                            onClick={goToNextChapter}
                            disabled={currentChapterIndex === chapters.length - 1}
                            className="nav-btn next-btn"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>

            <StatsDisplay 
                typingState={typingState}
                showDetailed={true}
                className="stats-full"
                bookId={parseInt(bookId)}
                chapterId={chapters[currentChapterIndex]?.id_chapter || null}
            />

            {showResults && typingState.isComplete && (
                <div className="results-modal">
                    <div className="results-content">
                        <h2>🎉 ¡Capítulo Completado!</h2>
                        
                        <div className="results-grid">
                            <div className="result-item">
                                <span className="result-label">⚡ Velocidad</span>
                                <span className="result-value">
                                    {Math.round((typingState.typedChars.length / 5) / (30 / 60))} PPM
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">🎯 Precisión</span>
                                <span className="result-value">
                                    {typingState.accuracy?.toFixed(1) || 100}%
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">❌ Errores</span>
                                <span className="result-value">
                                    {typingState.errorCount || 0}
                                </span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">⌨️ Teclas</span>
                                <span className="result-value">
                                    {typingState.typedChars?.length || 0}
                                </span>
                            </div>
                        </div>

                        {sessionSaved && (
                            <div className="session-saved">
                                ✅ Sesión guardada en la base de datos
                            </div>
                        )}
                        
                        <div className="results-actions">
                            <button onClick={resetTest} className="btn-primary">
                                🔄 Practicar de nuevo
                            </button>
                            {currentChapterIndex < chapters.length - 1 && (
                                <button onClick={goToNextChapter} className="btn-secondary">
                                    Siguiente capítulo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="shortcuts-info">
                <kbd>Ctrl + R</kbd> Reiniciar &nbsp;|&nbsp;
                <kbd>Backspace</kbd> Corregir error
            </div>
        </div>
    );
};

export default ReadingMode;
