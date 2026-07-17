import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessionStats } from './useStats';

export const useTypingStats = (typingState) => {
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [wpm, setWpm] = useState(0);
    const [rawWpm, setRawWpm] = useState(0);
    const [netWpm, setNetWpm] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const startTimeRef = useRef(null);
    const [finalStats, setFinalStats] = useState(null);
    const [isCompleteFrozen, setIsCompleteFrozen] = useState(false);
    const frozenElapsedTimeRef = useRef(0);
    
    const {
        sessions,
        stats: dbStats,
        chapterStats,
        loading: dbLoading,
        error: dbError,
        saveSession,
        loadMySessions,
        loadMyStats,
        loadChapterStats,
        deleteSession
    } = useSessionStats();

    const calculateStats = useCallback(() => {
        const { 
            errors = [], 
            typedChars = [], 
            totalChars: total = 0,
            isComplete = false
        } = typingState || {};
        
        if (isCompleteFrozen && finalStats) {
            return finalStats;
        }
        
        const keystrokes = typedChars.length;
        const errorsCount = errors.filter(e => e).length;
        let accuracyValue = 100;
        
        if (keystrokes > 0) {
            accuracyValue = ((keystrokes - errorsCount) / keystrokes) * 100;
        }
        
        const roundedAccuracy = Math.round(accuracyValue * 100) / 100;
        
        let rawWpmValue = 0;
        let netWpmValue = 0;
        let wpmValue = 0;
        
        if (startTimeRef.current && keystrokes > 0) {
            let elapsedMs;
            if (isComplete && isCompleteFrozen) {
                elapsedMs = frozenElapsedTimeRef.current;
            } else {
                elapsedMs = Date.now() - startTimeRef.current;
            }
            
            const elapsedMinutes = elapsedMs / 60000;
            
            if (elapsedMinutes > 0) {
                const wordsTyped = keystrokes / 5;
                rawWpmValue = Math.round(wordsTyped / elapsedMinutes);
                
                const correctKeystrokes = keystrokes - errorsCount;
                const netWordsTyped = correctKeystrokes / 5;
                netWpmValue = Math.round(netWordsTyped / elapsedMinutes);
                wpmValue = netWpmValue;
            }
        }
        
        if (isComplete && keystrokes > 0) {
            if (startTimeRef.current) {
                frozenElapsedTimeRef.current = Date.now() - startTimeRef.current;
            }
            
            const finalData = {
                totalKeystrokes: keystrokes,
                errorCount: errorsCount,
                accuracy: roundedAccuracy,
                wpm: wpmValue,
                rawWpm: rawWpmValue,
                netWpm: netWpmValue,
                totalChars: total,
                isComplete: true
            };
            
            setFinalStats(finalData);
            setIsCompleteFrozen(true);
            return finalData;
        }
        
        return {
            totalKeystrokes: keystrokes,
            errorCount: errorsCount,
            accuracy: roundedAccuracy,
            wpm: wpmValue,
            rawWpm: rawWpmValue,
            netWpm: netWpmValue,
            totalChars: total,
            isComplete: false
        };
    }, [typingState, isCompleteFrozen, finalStats]);

    const saveCurrentSession = useCallback(async (bookId, chapterId, additionalData = {}) => {
        if (!typingState?.isComplete || !finalStats) {
            console.warn('No hay estadísticas completas para guardar');
            return null;
        }

        const sessionData = {
            bookId,
            chapterId,
            wpm: finalStats.wpm,
            accuracy: finalStats.accuracy,
            errors: finalStats.errorCount,
            totalKeystrokes: finalStats.totalKeystrokes,
            duration: Math.floor(frozenElapsedTimeRef.current / 1000),
            completed: true,
            ...additionalData
        };

        const result = await saveSession(sessionData);
        if (result) {
            console.log('✅ Sesión guardada:', result);
            await loadMyStats();
            if (chapterId) {
                await loadChapterStats(chapterId);
            }
        }
        return result;
    }, [typingState, finalStats, saveSession, loadMyStats, loadChapterStats]);

    const resetStats = useCallback(() => {
        setTotalKeystrokes(0);
        setErrorCount(0);
        setAccuracy(100);
        setWpm(0);
        setRawWpm(0);
        setNetWpm(0);
        setTotalChars(0);
        setFinalStats(null);
        setIsCompleteFrozen(false);
        frozenElapsedTimeRef.current = 0;
        startTimeRef.current = null;
    }, []);

    useEffect(() => {
        const { typedChars = [] } = typingState || {};
        
        if (typedChars.length > 0 && !startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        
        const stats = calculateStats();
        
        setTotalKeystrokes(stats.totalKeystrokes);
        setErrorCount(stats.errorCount);
        setAccuracy(stats.accuracy);
        setWpm(stats.wpm);
        setRawWpm(stats.rawWpm);
        setNetWpm(stats.netWpm);
        setTotalChars(stats.totalChars);
        
        if (stats.isComplete) {
            return;
        }
        
        const intervalId = setInterval(() => {
            if (!isCompleteFrozen && typedChars.length > 0) {
                const updatedStats = calculateStats();
                setTotalKeystrokes(updatedStats.totalKeystrokes);
                setErrorCount(updatedStats.errorCount);
                setAccuracy(updatedStats.accuracy);
                setWpm(updatedStats.wpm);
                setRawWpm(updatedStats.rawWpm);
                setNetWpm(updatedStats.netWpm);
                setTotalChars(updatedStats.totalChars);
            }
        }, 500);
        
        return () => clearInterval(intervalId);
    }, [typingState, calculateStats, isCompleteFrozen]);

    const getElapsedTime = useCallback(() => {
        if (!startTimeRef.current) return 0;
        
        if (isCompleteFrozen && frozenElapsedTimeRef.current > 0) {
            return Math.floor(frozenElapsedTimeRef.current / 1000);
        }
        
        return Math.floor((Date.now() - startTimeRef.current) / 1000);
    }, [isCompleteFrozen]);

    const getElapsedTimeFormatted = useCallback(() => {
        const seconds = getElapsedTime();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [getElapsedTime]);

    const getProgress = useCallback(() => {
        const { currentIndex = 0, totalChars: total = 0 } = typingState || {};
        if (total === 0) return 0;
        return (currentIndex / total) * 100;
    }, [typingState]);

    const getCorrectKeystrokes = useCallback(() => {
        return totalKeystrokes - errorCount;
    }, [totalKeystrokes, errorCount]);

    const getDetailedStats = useCallback(() => {
        const elapsedTime = getElapsedTime();
        return {
            totalKeystrokes,
            errorCount,
            accuracy,
            wpm,
            rawWpm,
            netWpm,
            totalChars,
            correctKeystrokes: getCorrectKeystrokes(),
            elapsedTime,
            elapsedTimeFormatted: getElapsedTimeFormatted(),
            progress: getProgress(),
            isComplete: typingState?.isComplete || false,
            errorRate: totalKeystrokes > 0 ? (errorCount / totalKeystrokes) * 100 : 0,
            keystrokesPerMinute: totalKeystrokes > 0 && elapsedTime > 0 
                ? Math.round(totalKeystrokes / (elapsedTime / 60))
                : 0,
            isFrozen: isCompleteFrozen
        };
    }, [
        totalKeystrokes, 
        errorCount, 
        accuracy, 
        wpm, 
        rawWpm, 
        netWpm, 
        totalChars,
        getCorrectKeystrokes,
        getElapsedTime,
        getElapsedTimeFormatted,
        getProgress,
        typingState?.isComplete,
        isCompleteFrozen
    ]);

    return {
        // Estadísticas de tipeo
        totalKeystrokes,
        errorCount,
        accuracy,
        wpm,
        rawWpm,
        netWpm,
        totalChars,
        isFrozen: isCompleteFrozen,
        finalStats,
        
        // Métodos de tipeo
        resetStats,
        getElapsedTime,
        getElapsedTimeFormatted,
        getProgress,
        getCorrectKeystrokes,
        getDetailedStats,
        
        // Métodos de sesiones
        saveSession: saveCurrentSession,
        loadMySessions,
        loadMyStats,
        loadChapterStats,
        deleteSession,
        
        // Datos de sesiones
        sessions,
        dbStats,
        chapterStats,
        dbLoading,
        dbError,
        
        isComplete: typingState?.isComplete || false,
        isTyping: typingState?.currentIndex > 0 && !typingState?.isComplete
    };
};
