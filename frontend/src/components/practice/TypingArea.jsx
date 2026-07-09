import React, { useEffect, useRef } from 'react';
import { useTyping } from '../../hooks/useTyping';
import './Typingarea.css';

const TypingArea = ({ 
    text = '', 
    onComplete = () => {},
    className = '',
    language = 'es' 
}) => {
    const hiddenInputRef = useRef(null);
    const {
        currentIndex,
        errors,
        typedChars,
        isComplete,
        reset,
        progress,
        errorCount,
        accuracy
    } = useTyping(text, onComplete);

    useEffect(() => {
        // Enfocar automáticamente al cargar y cuando se hace clic
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    }, []);

    // Si no hay texto, mostrar mensaje
    if (!text) {
        return <div className="typing-empty">No hay texto para practicar</div>;
    }

    const getCharClass = (index) => {
        // Si el índice es mayor o igual que el actual, está pendiente
        if (index > currentIndex) return 'char-pending';
        
        // Si es el índice actual (el que se está escribiendo ahora)
        if (index === currentIndex) return 'char-current';
        
        // Si ya fue tipeado, verificar si fue error
        const errorIndex = index;
        if (errors[errorIndex] === true) return 'char-incorrect';
        if (errors[errorIndex] === false) return 'char-correct';
        
        return 'char-pending';
    };

    return (
        <div className={`typing-area ${className}`}>
            <input
                ref={hiddenInputRef}
                type="text"
                className="hidden-input"
                autoFocus
                readOnly
                aria-label="Área de tipeo - presiona cualquier tecla para comenzar"
                placeholder="Presiona cualquier tecla para comenzar..."
            />
            <div className="text-display" onClick={() => hiddenInputRef.current?.focus()}>
                {text.split('').map((char, index) => {
                    // Manejar espacios en blanco
                    const displayChar = char === ' ' ? '\u00A0' : char;
                    
                    return (
                        <span
                            key={index}
                            className={`char ${getCharClass(index)}`}
                            data-index={index}
                            data-char={char}
                        >
                            {displayChar}
                        </span>
                    );
                })}
            </div>

            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="typing-stats">
                <div className="stat-item">
                    <span className="stat-label">Progreso:</span>
                    <span className="stat-value">{Math.round(progress)}%</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Caracteres:</span>
                    <span className="stat-value">{typedChars.length} / {text.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Errores:</span>
                    <span className={`stat-value ${errorCount > 0 ? 'has-errors' : ''}`}>
                        {errorCount}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Precisión:</span>
                    <span className="stat-value">{Math.round(accuracy)}%</span>
                </div>
            </div>
            {isComplete && (
                <div className="completion-message">
                    <h3>🎉 ¡Felicidades! Has completado el texto</h3>
                    <p>Precisión: {Math.round(accuracy)}%</p>
                    <p>Errores: {errorCount}</p>
                    <button 
                        className="reset-button"
                        onClick={() => reset()}
                    >
                        Volver a intentar
                    </button>
                </div>
            )}
        </div>
    );
};

export default TypingArea;
