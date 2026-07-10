import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar la lógica de tipeo
 * Soporta:
 * - Acentos (á, é, í, ó, ú, ü, ñ)
 * - Mayúsculas
 * - Borrado (Backspace)
 * - Caracteres especiales
 */
export const useTyping = (initialText = '', onComplete, onProgress) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [errors, setErrors] = useState([]);
    const [typedChars, setTypedChars] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isKeyDown, setIsKeyDown] = useState(false);
    const startTimeRef = useRef(null);
    const charCountRef = useRef(0);

    const reset = useCallback((newText = initialText) => {
        setCurrentIndex(0);
        setErrors([]);
        setTypedChars([]);
        setIsComplete(false);
        setIsKeyDown(false);
        startTimeRef.current = null;
        charCountRef.current = 0;
    }, [initialText]);

    const getActualChar = useCallback((event) => {
        if (event.key === 'Dead') {
            return null; 
        }
        return event.key;
    }, []);

    const handleKeyDown = useCallback((event) => {
        event.preventDefault();
        
        if (isComplete) return;
        if (isKeyDown) return;
        setIsKeyDown(true);

        const key = event.key;

        const ignoreKeys = [
            'Shift', 'Control', 'Alt', 'Meta', 
            'CapsLock', 'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4',
            'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Home', 'End', 'PageUp', 'PageDown', 'Insert',
            'PrintScreen', 'ScrollLock', 'Pause', 'ContextMenu'
        ];
        
        if (ignoreKeys.includes(key)) {
            setIsKeyDown(false);
            return;
        }

        if (key === 'Backspace') {
            if (currentIndex > 0 && typedChars.length > 0) {
                const newIndex = currentIndex - 1;
                setCurrentIndex(newIndex);
              
                setTypedChars(prev => prev.slice(0, -1));
                setErrors(prev => prev.slice(0, -1));
                if (isComplete) {
                    setIsComplete(false);
                }
            }
            setIsKeyDown(false);
            return;
        }
        if (key === 'Dead') {
            window._deadKey = event.code;
            setIsKeyDown(false);
            return;
        }
        let finalChar = key;
        if (window._deadKey) {
            const deadKey = window._deadKey;
            window._deadKey = null;
            
            const accentMap = {
                'Quote': { // Tecla de acento agudo (')
                    'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
                    'A': 'Á', 'E': 'É', 'I': 'Í', 'O': 'Ó', 'U': 'Ú'
                },
                'Semicolon': { // Tecla de diéresis (¨)
                    'u': 'ü', 'U': 'Ü'
                },
                'KeyN': { // Tecla de virgulilla (˜)
                    'n': 'ñ', 'N': 'Ñ'
                }
            };
            const deadMap = accentMap[deadKey] || {};
            if (deadMap[key]) {
                finalChar = deadMap[key];
            }
        }
        if (!initialText || initialText.length === 0) {
            setIsKeyDown(false);
            return;
        }

        if (currentIndex >= initialText.length) {
            setIsComplete(true);
            if (onComplete) {
                const finalErrors = [...errors];
                const finalTyped = [...typedChars];
                onComplete({
                    errors: finalErrors,
                    typedChars: finalTyped,
                    totalErrors: finalErrors.filter(e => e).length,
                    accuracy: finalTyped.length > 0 
                        ? ((finalTyped.length - finalErrors.filter(e => e).length) / finalTyped.length * 100)
                        : 100
                });
            }
            setIsKeyDown(false);
            return;
        }
        const expectedChar = initialText[currentIndex];
        const isError = finalChar !== expectedChar;
        
        const newTypedChars = [...typedChars, finalChar];
        setTypedChars(newTypedChars);
        
        const newErrors = [...errors, isError];
        setErrors(newErrors);
        
        // Contar caracteres para WPM
        charCountRef.current += 1;
        if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        
        const progress = (newIndex / initialText.length) * 100;
        
        let wpm = 0;
        if (startTimeRef.current) {
            const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
            const words = charCountRef.current / 5; // 5 caracteres = 1 palabra
            wpm = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0;
        }
        
        if (onProgress) {
            onProgress({
                currentIndex: newIndex,
                totalChars: initialText.length,
                progress,
                errors: newErrors,
                typedChars: newTypedChars,
                errorCount: newErrors.filter(e => e).length,
                accuracy: newTypedChars.length > 0 
                    ? ((newTypedChars.length - newErrors.filter(e => e).length) / newTypedChars.length * 100)
                    : 100,
                wpm
            });
        }
        if (newIndex >= initialText.length) {
            setIsComplete(true);
            if (onComplete) {
                onComplete({
                    errors: newErrors,
                    typedChars: newTypedChars,
                    totalErrors: newErrors.filter(e => e).length,
                    accuracy: newTypedChars.length > 0 
                        ? ((newTypedChars.length - newErrors.filter(e => e).length) / newTypedChars.length * 100)
                        : 100,
                    wpm
                });
            }
        }
        setTimeout(() => {
            setIsKeyDown(false);
        }, 10);
        
    }, [currentIndex, initialText, isComplete, isKeyDown, errors, typedChars, onComplete, onProgress]);

 
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

 
    useEffect(() => {
        return () => {
            window._deadKey = null;
        };
    }, []);

    return {
        currentIndex,
        errors,
        typedChars,
        isComplete,
        reset,
        handleKeyDown,
        progress: initialText.length > 0 ? (currentIndex / initialText.length) * 100 : 0,
        totalChars: initialText.length,
        typedCount: typedChars.length,
        errorCount: errors.filter(e => e).length,
        accuracy: typedChars.length > 0 
            ? ((typedChars.length - errors.filter(e => e).length) / typedChars.length * 100)
            : 100,
        wpm: 0 
    };
};
