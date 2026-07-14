import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTimer } from '../../hooks/useTimer';
import './TimerDisplay.css';

const TimerDisplay = ({ 
    initialDuration = 0,
    className = '', 
    showControls = false,
    autoStart = false,
    onStart = null,
    onPause = null,
    onReset = null,
    onComplete = null,
    durationLimit = null,
    compact = false,
    isTyping = false,
    isComplete = false,
    onTimeUpdate = null
}) => {
    const timer = useTimer(initialDuration);

    useEffect(() => {
        if (isComplete) {
            if (timer.isRunning) {
                timer.pause();
                if (onComplete) onComplete(timer.time);
            }
            return;
        }

        if (isTyping && !timer.isRunning) {
            timer.start();
            if (onStart) onStart();
        } else if (!isTyping && timer.isRunning && timer.time > 0) {
            timer.pause();
            if (onPause) onPause();
        }
    }, [isTyping, isComplete, timer.isRunning]);

    useEffect(() => {
        if (autoStart && !timer.isRunning) {
            timer.start();
        }
    }, []);

    useEffect(() => {
        if (durationLimit && timer.time >= durationLimit) {
            timer.pause();
            if (onComplete) {
                onComplete(timer.time);
            }
        }
    }, [timer.time, durationLimit]);

    useEffect(() => {
        if (onTimeUpdate) {
            onTimeUpdate({
                time: timer.time,
                isRunning: timer.isRunning,
                formattedTime: getDisplayTime()
            });
        }
    }, [timer.time, timer.isRunning]);

    const handleStart = () => {
        timer.start();
        if (onStart) onStart();
    };

    const handlePause = () => {
        timer.pause();
        if (onPause) onPause();
    };

    const handleReset = () => {
        timer.reset(0);
        if (onReset) onReset();
    };

    const getDisplayTime = () => {
        const hours = Math.floor(timer.time / 3600);
        const minutes = Math.floor((timer.time % 3600) / 60);
        const seconds = timer.time % 60;

        if (compact || hours === 0) {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`timer-display ${className} ${compact ? 'compact' : ''}`}>
            <div className="timer-header">
                <span className="timer-icon">⏱️</span>
                <span className="timer-label">Tiempo</span>
            </div>
            
            <div className={`timer-value ${timer.isRunning ? 'running' : 'paused'}`}>
                {getDisplayTime()}
            </div>
            
            {showControls && (
                <div className="timer-controls">
                    {!timer.isRunning ? (
                        <button 
                            className="timer-btn start" 
                            onClick={handleStart}
                            disabled={timer.time === 0}
                        >
                            ▶ Iniciar
                        </button>
                    ) : (
                        <button 
                            className="timer-btn pause" 
                            onClick={handlePause}
                        >
                            ⏸ Pausar
                        </button>
                    )}
                    <button 
                        className="timer-btn reset" 
                        onClick={handleReset}
                    >
                        ↺ Reiniciar
                    </button>
                    <button 
                        className="timer-btn duration" 
                        onClick={() => timer.setDuration(60)}
                    >
                        ⏱ 60s
                    </button>
                </div>
            )}
            
            <div className="timer-status">
                <span className={`status-dot ${timer.isRunning ? 'active' : 'inactive'}`} />
                <span>{timer.isRunning ? 'Corriendo' : 'Detenido'}</span>
            </div>
        </div>
    );
};

TimerDisplay.propTypes = {
    initialDuration: PropTypes.number,
    className: PropTypes.string,
    showControls: PropTypes.bool,
    autoStart: PropTypes.bool,
    onStart: PropTypes.func,
    onPause: PropTypes.func,
    onReset: PropTypes.func,
    onComplete: PropTypes.func,
    durationLimit: PropTypes.number,
    compact: PropTypes.bool,
    isTyping: PropTypes.bool,
    isComplete: PropTypes.bool,
    onTimeUpdate: PropTypes.func
};

TimerDisplay.defaultProps = {
    initialDuration: 0,
    showControls: false,
    autoStart: false,
    compact: false,
    isTyping: false,
    isComplete: false
};

export default TimerDisplay;
