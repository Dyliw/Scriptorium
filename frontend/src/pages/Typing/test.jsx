import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTyping } from '../../hooks/useTyping';
import TimerDisplay from '../../components/common/TimerDisplay';
import StatsDisplay from '../../components/common/StatsDisplay';
import TypingArea from '../../components/Practice/Typingarea';
import BookSelector from '../../components/Books/BookSelector';
import ModeSelector from '../../components/common/ModeSelector';
import './TypingTest.css';

const MODE_TEXTS = {
    classic: [
        "The quick brown fox jumps over the lazy dog. Practice makes perfect in everything you do.",
        "Coding is the art of teaching machines to think. Every line of code tells a story.",
        "The beautiful thing about learning is that nobody can take it away from you."
    ],
    timed: [
        "Speed is important, but accuracy matters more. Focus on typing correctly first.",
        "The faster you type, the more you can accomplish in less time."
    ],
    words: [
        "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim."
    ],
    quote: [
        '"The only way to do great work is to love what you do." - Steve Jobs',
        '"Innovation distinguishes between a leader and a follower." - Steve Jobs'
    ]
};

const TypingTest = () => {
    
    const [currentMode, setCurrentMode] = useState('classic');
    const [texts, setTexts] = useState(MODE_TEXTS.classic);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [text, setText] = useState(MODE_TEXTS.classic[0]);
    
    const [typingState, setTypingState] = useState({
        errors: [],
        typedChars: [],
        currentIndex: 0,
        totalChars: 0,
        isComplete: false,
        accuracy: 100,
        errorCount: 0
    });
    
    const [isTyping, setIsTyping] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [sessionSaved, setSessionSaved] = useState(false);
    
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    
    const typingAreaRef = useRef(null);
    const timerRef = useRef(null);
    
    
    const resetTest = useCallback(() => {
        setIsTyping(false);
        setShowResults(false);
        setSessionSaved(false);
        setTypingState({
            errors: [],
            typedChars: [],
            currentIndex: 0,
            totalChars: text.length,
            isComplete: false,
            accuracy: 100,
            errorCount: 0
        });
        
        // Resetear el área de tipeo
        if (typingAreaRef.current?.reset) {
            typingAreaRef.current.reset();
        }
        
        // Resetear el timer
        if (timerRef.current?.reset) {
            timerRef.current.reset(0);
        }
    }, [text]);

    const nextText = useCallback(() => {
        const nextIndex = (currentTextIndex + 1) % texts.length;
        setCurrentTextIndex(nextIndex);
        setText(texts[nextIndex]);
        resetTest();
    }, [texts, currentTextIndex, resetTest]);

    const changeText = useCallback((newText) => {
        setText(newText);
        resetTest();
    }, [resetTest]);
    
    const handleModeChange = useCallback((modeId) => {
        setCurrentMode(modeId);
        const newTexts = MODE_TEXTS[modeId] || MODE_TEXTS.classic;
        setTexts(newTexts);
        setCurrentTextIndex(0);
        setText(newTexts[0]);
        resetTest();
        
        // Cerrar selector de libros si está abierto
        setSelectedBook(null);
        setSelectedChapter(null);
    }, [resetTest]);

    
    const handleChapterSelect = useCallback((data) => {
        if (data) {
            setSelectedBook(data.book);
            setSelectedChapter(data.chapter);
            setText(data.content || '');
            // Cambiar a modo personalizado
            setCurrentMode('custom');
            resetTest();
        }
    }, [resetTest]);

    
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

        // En modo words o quote, pasar al siguiente texto después de 3 segundos
        if (currentMode === 'words' || currentMode === 'quote') {
            setTimeout(() => {
                if (currentTextIndex < texts.length - 1) {
                    nextText();
                } else {
                    // Si es el último, mostrar mensaje de finalización
                    console.log('🎉 Todos los textos completados!');
                }
            }, 3000);
        }
    }, [text, currentMode, texts, currentTextIndex, nextText]);


    const handleSessionSaved = useCallback(() => {
        setSessionSaved(true);
        console.log('✅ Sesión guardada exitosamente');
    }, []);


    return (
        <div className="typing-test-container">
            <header className="test-header">
                <h1>Test de Mecanografía</h1>
                <div className="header-controls">

                    
                    {/* Selector de libros */}
                    {currentMode === 'classic' && (
                        <BookSelector 
                            onSelectChapter={handleChapterSelect}
                            className="book-selector-header"
                        />
                    )}
                    
                </div>
            </header>

            <div className="mode-indicator">
                <span className="mode-badge">
                    {currentMode === 'classic' && 'Clásico'}
                    {currentMode === 'timed' && 'Contrarreloj'}
                    {currentMode === 'words' && `Texto ${currentTextIndex + 1}/${texts.length}`}
                    {currentMode === 'quote' && `Cita ${currentTextIndex + 1}/${texts.length}`}
                    {currentMode === 'custom' && selectedChapter && `📚 ${selectedChapter.title}`}
                </span>
                
                {(currentMode === 'words' || currentMode === 'quote') && (
                    <button 
                        onClick={nextText} 
                        className="next-text-btn"
                        disabled={currentTextIndex >= texts.length - 1}
                    >
                        Siguiente →
                    </button>
                )}
                
                {selectedBook && selectedChapter && (
                    <span className="book-info">
                        {selectedBook.title} - {selectedBook.author}
                    </span>
                )}
            </div>

            <div className="main-layout">

                {/* Área de tipeo */}
                <div className="typing-area-wrapper">
                    {text ? (
                        <TypingArea 
                            key={text}
                            ref={typingAreaRef}
                            text={text}
                            onComplete={handleComplete}
                            onProgress={handleProgress}
                            language="es"
                            className="typing-area"
                        />
                    ) : (
                        <div className="empty-state">
                            <h3>Selecciona un texto</h3>
                            <p>Elige un modo o selecciona un libro para comenzar</p>
                        </div>
                    )}
                    
                </div>
                <div className='lateral'>
                    <ModeSelector 
                        onModeChange={handleModeChange}
                        currentMode={currentMode}
                    />
                </div>
                {/* Panel lateral */}
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
                    
                </div>
            </div>

            <StatsDisplay 
                typingState={typingState}
                showDetailed={true}
                className="stats-full"
                bookId={selectedChapter?.id || null}
                chapterId={selectedChapter?.id || null}
                onStatsUpdate={(stats) => {
                    // Actualizar timer display
                    const timerDisplay = document.getElementById('timer-display');
                    if (timerDisplay && stats.elapsedTimeFormatted) {
                        timerDisplay.textContent = stats.elapsedTimeFormatted;
                    }
                }}
                onSessionSaved={handleSessionSaved}
            />

            {showResults && typingState.isComplete && (
                <div className="results-modal">
                    <div className="results-content">
                        <h2>🎉 ¡Texto Completado!</h2>
                        
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
                            {(currentMode === 'words' || currentMode === 'quote') && 
                             currentTextIndex < texts.length - 1 && (
                                <button onClick={nextText} className="btn-secondary">
                                    📝 Siguiente texto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

         
            {/* SHORTCUTS INFO */}
            <div className="shortcuts-info">
                <kbd>Ctrl + 1-5</kbd> Cambiar modo &nbsp;|&nbsp;
                <kbd>Ctrl + R</kbd> Reiniciar &nbsp;|&nbsp;
                <kbd>Backspace</kbd> Corregir error
            </div>
        </div>
    );
};

export default TypingTest;
