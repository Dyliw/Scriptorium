import React from 'react';
import PropTypes from 'prop-types';
import './StatsDisplay.css';

const StatsDisplay = ({ stats, className = '' }) => {
    if (!stats) {
        return (
            <div className={`stats-display ${className}`}>
                <div className="stat-card">
                    <span className="stat-label">📊 WPM</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">🎯 Precisión</span>
                    <span className="stat-value">--%</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">❌ Errores</span>
                    <span className="stat-value">--</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">⌨️ Teclas</span>
                    <span className="stat-value">--</span>
                </div>
            </div>
        );
    }

    const {
        wpm = 0,
        accuracy = 100,
        errorCount = 0,
        totalKeystrokes = 0,
        rawWpm = 0,
        netWpm = 0,
        getCorrectKeystrokes = () => 0,
        getDetailedStats = () => ({}),
        isComplete = false
    } = stats;

    const detailedStats = getDetailedStats ? getDetailedStats() : {};
    const correctKeystrokes = getCorrectKeystrokes ? getCorrectKeystrokes() : 0;

    return (
        <div className={`stats-display ${className}`}>
            <div className="stat-card stat-card-wpm">
                <div className="stat-header">
                    <span className="stat-icon">⚡</span>
                    <span className="stat-label">WPM</span>
                </div>
                <div className="stat-value">{Math.round(wpm)}</div>
                <div className="stat-sub">
                    <span>Bruto: {rawWpm}</span>
                    <span>Neto: {netWpm}</span>
                </div>
                {isComplete && (
                    <div className="stat-badge complete">✅ Completado</div>
                )}
            </div>

            <div className="stat-card stat-card-accuracy">
                <div className="stat-header">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-label">Precisión</span>
                </div>
                <div className="stat-value">{accuracy.toFixed(1)}%</div>
                <div className="stat-progress">
                    <div 
                        className="stat-progress-bar" 
                        style={{ width: `${accuracy}%` }}
                    />
                </div>
                <div className="stat-sub">
                    <span>✅ {correctKeystrokes}</span>
                    <span>❌ {errorCount}</span>
                </div>
            </div>

            <div className="stat-card stat-card-errors">
                <div className="stat-header">
                    <span className="stat-icon">❌</span>
                    <span className="stat-label">Errores</span>
                </div>
                <div className="stat-value">{errorCount}</div>
                <div className="stat-sub">
                    <span>Total teclas: {totalKeystrokes}</span>
                    <span>Tasa: {totalKeystrokes > 0 ? ((errorCount / totalKeystrokes) * 100).toFixed(1) : 0}%</span>
                </div>
            </div>
            <div className="stat-card stat-card-keystrokes">
                <div className="stat-header">
                    <span className="stat-icon">⌨️</span>
                    <span className="stat-label">Teclas</span>
                </div>
                <div className="stat-value">{totalKeystrokes}</div>
                <div className="stat-sub">
                    <span>Correctas: {correctKeystrokes}</span>
                    <span>KPM: {detailedStats.keystrokesPerMinute || 0}</span>
                </div>
            </div>
        </div>
    );
};

StatsDisplay.propTypes = {
    stats: PropTypes.shape({
        wpm: PropTypes.number,
        accuracy: PropTypes.number,
        errorCount: PropTypes.number,
        totalKeystrokes: PropTypes.number,
        rawWpm: PropTypes.number,
        netWpm: PropTypes.number,
        getCorrectKeystrokes: PropTypes.func,
        getDetailedStats: PropTypes.func,
        isComplete: PropTypes.bool
    }),
    className: PropTypes.string
};

export default StatsDisplay;
