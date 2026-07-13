import React from 'react';
import PropTypes from 'prop-types';
import './TimerDisplay.css';


const TimerDisplay = ({ 
    timer, 
    className = '', 
    showControls = false 
}) => {
    if (!timer) {
        return (
            <div className={`timer-display ${className}`}>
                <div className="timer-value">00:00</div>
            </div>
        );
    }

    const {
        time = 0,
        isRunning = false,
        formatTime = () => '00:00:00',
        start = () => {},
        pause = () => {},
        reset = () => {},
        setDuration = () => {}
    } = timer;

    const displayTime = formatTime ? formatTime() : '00:00:00';
    
    const getCompactTime = () => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`timer-display ${className}`}>
            <div className="timer-header">
                <span className="timer-icon">⏱️</span>
                <span className="timer-label">Tiempo</span>
            </div>
            
            <div className={`timer-value ${isRunning ? 'running' : 'paused'}`}>
                {getCompactTime()}
            </div>
            
            {showControls && (
                <div className="timer-controls">
                    {!isRunning ? (
                        <button 
                            className="timer-btn start" 
                            onClick={start}
                            disabled={time === 0}
                        >
                            ▶ Iniciar
                        </button>
                    ) : (
                        <button 
                            className="timer-btn pause" 
                            onClick={pause}
                        >
                            ⏸ Pausar
                        </button>
                    )}
                    <button 
                        className="timer-btn reset" 
                        onClick={() => reset(0)}
                    >
                        ↺
                    </button>
                    <button 
                        className="timer-btn duration" 
                        onClick={() => setDuration(60)}
                    >
                        ⏱ 60s
                    </button>
                </div>
            )}
            
            <div className="timer-status">
                <span className={`status-dot ${isRunning ? 'active' : 'inactive'}`} />
                <span>{isRunning ? 'Corriendo' : 'Detenido'}</span>
            </div>
        </div>
    );
};

TimerDisplay.propTypes = {
    timer: PropTypes.shape({
        time: PropTypes.number,
        isRunning: PropTypes.bool,
        formatTime: PropTypes.func,
        start: PropTypes.func,
        pause: PropTypes.func,
        reset: PropTypes.func,
        setDuration: PropTypes.func
    }),
    className: PropTypes.string,
    showControls: PropTypes.bool
};

export default TimerDisplay;
