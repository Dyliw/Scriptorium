import React from 'react';
import './StatsDisplay.css';

const StatsDisplay = ({ 
    stats, 
    timer, 
    layout = 'grid',
    showDetails = true,
    className = ''
}) => {

    if (!stats) {
        return <div className="stats-error">⚠️ No hay estadísticas disponibles</div>;
    }

    const {
        wpm = 0,
        rawWpm = 0,
        netWpm = 0,
        accuracy = 100,
        errorCount = 0,
        totalKeystrokes = 0,
        totalChars = 0,
        getCorrectKeystrokes = () => 0,
        getProgress = () => 0,
        getElapsedTimeFormatted = () => '00:00',
        isComplete = false
    } = stats;

    const {
        time: timerTime = 0,
        isRunning: timerIsRunning = false,
        formatTime: formatTimer = () => '00:00:00'
    } = timer || {};

    const correctKeystrokes = getCorrectKeystrokes ? getCorrectKeystrokes() : 0;
    const progress = getProgress ? getProgress() : 0;
    const timeFormatted = getElapsedTimeFormatted ? getElapsedTimeFormatted() : '00:00';
    const timerFormatted = formatTimer ? formatTimer() : '00:00:00';


    const renderStatCard = (icon, label, value, subValue, color = 'blue') => {
        return (
            <div className={`stat-card stat-card-${color}`}>
                <div className="stat-icon">{icon}</div>
                <div className="stat-content">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                    {subValue && <div className="stat-sub">{subValue}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className={`stats-display stats-layout-${layout} ${className}`}>
            {renderStatCard(
                '⌨️',
                'WPM',
                wpm,
                showDetails ? `Bruto: ${rawWpm} | Neto: ${netWpm}` : null,
                'primary'
            )}

            {renderStatCard(
                '🎯',
                'Precisión',
                `${accuracy.toFixed(1)}%`,
                showDetails ? `${correctKeystrokes}/${totalKeystrokes} correctas` : null,
                accuracy >= 90 ? 'success' : accuracy >= 70 ? 'warning' : 'danger'
            )}

            {renderStatCard(
                '❌',
                'Errores',
                errorCount,
                showDetails ? `${totalKeystrokes} teclas totales` : null,
                errorCount === 0 ? 'success' : errorCount < 10 ? 'warning' : 'danger'
            )}

            {timer && (
                renderStatCard(
                    '⏱️',
                    'Tiempo Timer',
                    timerFormatted,
                    timerIsRunning ? '▶️ Corriendo' : '⏸️ Pausado',
                    timerIsRunning ? 'info' : 'secondary'
                )
            )}

            {renderStatCard(
                '⏰',
                'Tiempo Tipeo',
                timeFormatted,
                showDetails ? `Progreso: ${progress.toFixed(1)}%` : null,
                'info'
            )}

            {showDetails && (
                <div className="stat-card stat-card-progress">
                    <div className="stat-content full-width">
                        <div className="stat-label">Progreso</div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="stat-sub">
                            {isComplete ? '✅ Completado!' : `${progress.toFixed(0)}%`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default StatsDisplay;
