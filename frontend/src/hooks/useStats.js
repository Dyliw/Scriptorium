import { useState, useEffect, useRef, useCallback } from 'react';


export const useStats = (typingState) => {
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [wpm, setWpm] = useState(0);
    const [rawWpm, setRawWpm] = useState(0);
    const [netWpm, setNetWpm] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const startTimeRef = useRef(null);
    const charCountRef = useRef(0);
    const errorCountRef = useRef(0);
    const lastUpdateRef = useRef(0);
    
    const calculateStats = useCallback(() => {
        const { 
            errors = [], 
            typedChars = [], 
            totalChars: total = 0,
            isComplete = false
        } = typingState;

        const keystrokes = typedChars.length;
        setTotalKeystrokes(keystrokes);
        setTotalChars(total);

        const errorsCount = errors.filter(e => e).length;
        setErrorCount(errorsCount);
        errorCountRef.current = errorsCount;

        let accuracyValue = 100;
        if (keystrokes > 0) {
            accuracyValue = ((keystrokes - errorsCount) / keystrokes) * 100;
        }
        setAccuracy(Math.round(accuracyValue * 100) / 100);

        if (startTimeRef.current && keystrokes > 0) {
            const elapsedMs = Date.now() - startTimeRef.current;
            const elapsedMinutes = elapsedMs / 60000;
            
            if (elapsedMinutes > 0) {
                const wordsTyped = keystrokes / 5;
                const rawWpmValue = Math.round(wordsTyped / elapsedMinutes);
                setRawWpm(rawWpmValue);
                
                const correctKeystrokes = keystrokes - errorsCount;
                const netWordsTyped = correctKeystrokes / 5;
                const netWpmValue = Math.round(netWordsTyped / elapsedMinutes);
                setNetWpm(netWpmValue);
                
                setWpm(netWpmValue);
            }
        }
        if (isComplete && startTimeRef.current) {
            const elapsedMs = Date.now() - startTimeRef.current;
            const elapsedMinutes = elapsedMs / 60000;
            
            if (elapsedMinutes > 0) {
                const wordsTyped = keystrokes / 5;
                const rawWpmValue = Math.round(wordsTyped / elapsedMinutes);
                setRawWpm(rawWpmValue);
                
                const correctKeystrokes = keystrokes - errorsCount;
                const netWordsTyped = correctKeystrokes / 5;
                const netWpmValue = Math.round(netWordsTyped / elapsedMinutes);
                setNetWpm(netWpmValue);
                setWpm(netWpmValue);
            }
        }

    }, [typingState]);

   
    const resetStats = useCallback(() => {
        setTotalKeystrokes(0);
        setErrorCount(0);
        setAccuracy(100);
        setWpm(0);
        setRawWpm(0);
        setNetWpm(0);
        setTotalChars(0);
        
        startTimeRef.current = null;
        charCountRef.current = 0;
        errorCountRef.current = 0;
        lastUpdateRef.current = 0;
    }, []);


    useEffect(() => {
        const { typedChars = [] } = typingState;
        
        if (typedChars.length > 0 && !startTimeRef.current) {
            startTimeRef.current = Date.now();
        }
        
        calculateStats();
        
        const interval = setInterval(() => {
            if (typedChars.length > 0) {
                calculateStats();
            }
        }, 500);
        
        return () => clearInterval(interval);
    }, [typingState, calculateStats]);

  
    useEffect(() => {
        const { currentIndex = 0, typedChars = [] } = typingState;
        
        if (currentIndex === 0 && typedChars.length === 0) {
            resetStats();
        }
    }, [typingState.currentIndex, typingState.typedChars, resetStats]);

    const getElapsedTime = useCallback(() => {
        if (!startTimeRef.current) return 0;
        return Math.floor((Date.now() - startTimeRef.current) / 1000);
    }, []);

    const getElapsedTimeFormatted = useCallback(() => {
        const seconds = getElapsedTime();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [getElapsedTime]);
    const getProgress = useCallback(() => {
        const { currentIndex = 0, totalChars = 0 } = typingState;
        if (totalChars === 0) return 0;
        return (currentIndex / totalChars) * 100;
    }, [typingState]);

    const getCorrectKeystrokes = useCallback(() => {
        return totalKeystrokes - errorCount;
    }, [totalKeystrokes, errorCount]);

    const getDetailedStats = useCallback(() => {
        return {
            totalKeystrokes,
            errorCount,
            accuracy,
            wpm,
            rawWpm,
            netWpm,
            totalChars,
            correctKeystrokes: getCorrectKeystrokes(),
            elapsedTime: getElapsedTime(),
            elapsedTimeFormatted: getElapsedTimeFormatted(),
            progress: getProgress(),
            isComplete: typingState.isComplete || false,
            errorRate: totalKeystrokes > 0 ? (errorCount / totalKeystrokes) * 100 : 0,
            keystrokesPerMinute: totalKeystrokes > 0 && getElapsedTime() > 0 
                ? Math.round(totalKeystrokes / (getElapsedTime() / 60))
                : 0
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
        typingState.isComplete
    ]);

    return {
        totalKeystrokes,
        errorCount,
        accuracy,
        wpm,
        rawWpm,
        netWpm,
        totalChars,
        resetStats,
        getElapsedTime,
        getElapsedTimeFormatted,
        getProgress,
        getCorrectKeystrokes,
        getDetailedStats,
        
        isComplete: typingState.isComplete || false,
        currentIndex: typingState.currentIndex || 0
    };
};

export default useStats;
