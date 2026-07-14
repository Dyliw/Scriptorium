
import React, { useState, useRef, useEffect } from 'react';
import { useTyping } from '../../hooks/useTyping';
import TimerDisplay from '../../components/common/TimerDisplay';
import StatsDisplay from '../../components/common/StatsDisplay';
import TypingArea from '../../components/Practice/Typingarea';


const TypingTest = () => {
    const [text, setText] = useState(
        "The quick brown fox jumps over the lazy dog. This is a typing test to measure your speed and accuracy."
    );
    
    const [typingState, setTypingState] = useState({
        errors: [],
        typedChars: [],
        currentIndex: 0,
        totalChars: 0,
        isComplete: false,
        accuracy: 100,
        errorCount: 0
    });
    
    // Estado para controlar el timer
    const [isTyping, setIsTyping] = useState(false);
    const [timerTime, setTimerTime] = useState(0);
    
    const typingAreaRef = useRef(null);

    // Handler cuando se completa el tipeo
    const handleComplete = (data) => {
        console.log('✅ Tipeo completado!', data);
        setIsTyping(false);
        
        setTypingState(prev => ({
            ...prev,
            isComplete: true,
            errors: data.errors || [],
            typedChars: data.typedChars || [],
            currentIndex: text.length,
            accuracy: data.accuracy || 100,
            errorCount: data.errorCount || 0
        }));
    };
    
    // Handler para el progreso
    const handleProgress = (data) => {
        setIsTyping(data.currentIndex > 0 && !data.isComplete);
        
        setTypingState({
            currentIndex: data.currentIndex || 0,
            errors: data.errors || [],
            typedChars: data.typedChars || [],
            totalChars: text.length,
            isComplete: data.isComplete || false,
            accuracy: data.accuracy || 100,
            errorCount: data.errorCount || 0
        });
    };
    
    // Función para reiniciar todo
    const handleReset = () => {
        setIsTyping(false);
        setTimerTime(0);
        setTypingState({
            errors: [],
            typedChars: [],
            currentIndex: 0,
            totalChars: text.length,
            isComplete: false,
            accuracy: 100,
            errorCount: 0
        });
        
        if (typingAreaRef.current && typingAreaRef.current.reset) {
            typingAreaRef.current.reset();
        }
    };
    
    // Cambiar texto de prueba
    const changeText = (newText) => {
        setText(newText);
        setIsTyping(false);
        setTimerTime(0);
        setTypingState({
            errors: [],
            typedChars: [],
            currentIndex: 0,
            totalChars: newText.length,
            isComplete: false,
            accuracy: 100,
            errorCount: 0
        });
    };

    // Handler para actualizaciones del timer
    const handleTimeUpdate = (timeData) => {
        setTimerTime(timeData.time);
    };

    return (
        <div className="typing-test-container">
            <header className="test-header">
                <h1>⌨️ Test de Mecanografía</h1>
                <div className="header-controls">
                    <button 
                        className="reset-btn" 
                        onClick={handleReset}
                    >
                        🔄 Reiniciar
                    </button>
                    <select 
                        className="text-selector"
                        onChange={(e) => changeText(e.target.value)}
                        value={text}
                    >
                        <option value="The quick brown fox jumps over the lazy dog. This is a typing test to measure your speed and accuracy.">
                            Texto Corto (Inglés)
                        </option>
                        <option value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.">
                            Texto Medio (Latín)
                        </option>
                        <option value="El arte de la programación requiere paciencia, práctica y perseverancia. Cada línea de código es una oportunidad para aprender algo nuevo.">
                            Texto en Español
                        </option>
                    </select>
                </div>
            </header>
            
            <div className="main-layout">
                <div className="typing-area-wrapper">
                    <TypingArea 
                        key={text}
                        ref={typingAreaRef}
                        text={text}
                        onComplete={handleComplete}
                        onProgress={handleProgress}
                        language="es"
                    />
                </div>

                <div className="side-panel">
                    <TimerDisplay 
                        initialDuration={0}
                        showControls={true}
                        autoStart={false}
                        compact={false}
                        className="timer-widget"
                        isTyping={isTyping}
                        isComplete={typingState.isComplete}
                        onTimeUpdate={handleTimeUpdate}
                        onComplete={(time) => console.log('Timer completado:', time)}
                    />
                    
                    <div className="quick-stats">
                        <div className="quick-stat">
                            <span className="qs-label">⏱️ Tiempo</span>
                            <span className="qs-value">
                                {formatTime(timerTime)}
                            </span>
                        </div>
                        <div className="quick-stat">
                            <span className="qs-label">📊 WPM</span>
                            <span className="qs-value">
                                {calcWPM(typingState.typedChars.length, timerTime)}
                            </span>
                        </div>
                        <div className="quick-stat">
                            <span className="qs-label">🎯 Precisión</span>
                            <span className="qs-value">
                                {typingState.accuracy?.toFixed(1) || 100}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Estadísticas completas */}
            <StatsDisplay 
                typingState={typingState}
                showDetailed={true}
                className="stats-full"
            />
            
            {/* Barra de estado */}
            <div className="status-bar">
                <span className="status-item">
                    <span className={`status-dot ${isTyping ? 'active' : ''}`} />
                    Estado: {typingState.isComplete ? '✅ Completado' : isTyping ? '⌨️ Escribiendo...' : '⏳ Esperando...'}
                </span>
                <span className="status-item">
                    Caracteres: {typingState.typedChars?.length || 0}
                </span>
                <span className="status-item">
                    Errores: {typingState.errorCount || 0}
                </span>
                <span className="status-item">
                    Precisión: {typingState.accuracy?.toFixed(1) || 100}%
                </span>
                <span className="status-item running">
                    ⏱️ {formatTime(timerTime)}
                </span>
            </div>
        </div>
    );
};

// Funciones auxiliares
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const calcWPM = (chars, seconds) => {
    if (seconds === 0 || chars === 0) return 0;
    const minutes = seconds / 60;
    const words = chars / 5;
    return Math.round(words / minutes);
};

export default TypingTest;
