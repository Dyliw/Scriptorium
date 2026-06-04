import React, { useState, useEffect, useRef } from 'react';
import './Contador.css';

function Timer({ 
    initialTime = 30, 
    mode = 'countdown',
    onTimeUp, 
    onTimeChange,
    size = 'medium',
    variant = 'default',
    isActive = true, 
    autoStart = true
}) {
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(autoStart && isActive);
    const timerRef = useRef(null);
    const initialTimeRef = useRef(initialTime); // Guardar initialTime

    // Reset cuando cambia initialTime
    useEffect(() => {
        setTime(initialTime);
        initialTimeRef.current = initialTime;
    }, [initialTime]);

    // Control del timer
    useEffect(() => {
        // Limpiar timer anterior
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Iniciar nuevo timer si está activo
        if (isActive && isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prev => {
                    let newTime;
                    if (mode === 'countdown') {
                        newTime = prev - 1;
                        if (newTime <= 0) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                            setIsRunning(false);
                            onTimeUp?.();
                            return 0;
                        }
                    } else {
                        newTime = prev + 1;
                    }
                    
                    onTimeChange?.(newTime);
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isActive, isRunning, mode, onTimeUp, onTimeChange]);

    // Actualizar isRunning cuando cambia isActive
    useEffect(() => {
        if (!isActive) {
            setIsRunning(false);
        } else if (autoStart) {
            setIsRunning(true);
        }
    }, [isActive, autoStart]);

    const formatTime = (seconds) => {
        const mins = Math.floor(Math.max(0, seconds) / 60);
        const secs = Math.floor(Math.max(0, seconds) % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getVariantClass = () => {
        if (mode === 'countdown') {
            const percentage = (time / initialTimeRef.current) * 100;
            if (percentage <= 20) return 'danger';
            if (percentage <= 50) return 'warning';
        }
        return variant;
    };

    const percentage = mode === 'countdown' ? (time / initialTimeRef.current) * 100 : 100;

    return (
        <div className={`timer-container timer-${size} timer-${getVariantClass()}`}>
            <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 100 100">
                    <circle
                        className="timer-circle-bg"
                        cx="50"
                        cy="50"
                        r="45"
                    />
                    {mode === 'countdown' && (
                        <circle
                            className="timer-circle-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 45}`,
                                strokeDashoffset: `${2 * Math.PI * 45 * (1 - percentage / 100)}`
                            }}
                        />
                    )}
                </svg>
                <div className="timer-display">
                    <span className="timer-time">{formatTime(time)}</span>
                    <span className="timer-label">
                        {mode === 'countdown' ? 'restante' : 'transcurrido'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Timer;
