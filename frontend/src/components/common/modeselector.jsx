import React, { useState } from 'react';
import './ModeSelector.css';

const MODES = {
    CLASSIC: {
        id: 'classic',
        label: 'Clásico'
    },
    TIMED: {
        id: 'timed',
        label: 'Con Tiempo'
    },
    WORDS: {
        id: 'words',
        label: 'Por Palabras'
    },
    QUOTE: {
        id: 'quote',
        label: 'Citas Famosas'
    },
    CUSTOM: {
        id: 'custom',
        label: 'Personalizado'
    }
};

const ModeSelector = ({ onModeChange, currentMode = 'classic' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState(currentMode);

    const handleModeSelect = (modeId) => {
        setSelectedMode(modeId);
        setIsOpen(false);
        if (onModeChange) {
            onModeChange(modeId);
        }
    };

    const currentModeData = MODES[selectedMode.toUpperCase()] || MODES.CLASSIC;

    return (
        <div className="mode-selector">
            <button 
                className="mode-selector-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="mode-icon">{currentModeData.icon}</span>
                <span className="mode-label">{currentModeData.label}</span>
                <span className={`mode-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="mode-dropdown">
                    {Object.values(MODES).map((mode) => (
                        <button
                            key={mode.id}
                            className={`mode-option ${selectedMode === mode.id ? 'active' : ''}`}
                            onClick={() => handleModeSelect(mode.id)}
                        >
                            <span className="mode-option-icon">{mode.icon}</span>
                            <div className="mode-option-content">
                                <span className="mode-option-label">{mode.label}</span>
                                <span className="mode-option-description">{mode.description}</span>
                            </div>
                            {selectedMode === mode.id && (
                                <span className="mode-option-check">✅</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModeSelector;
