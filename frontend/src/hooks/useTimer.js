import { useState, useEffect, useCallback, useRef } from "react";

export const useTimer = (initalDuration = 0)=>{
    const [time, setTime] = useState(initalDuration);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const timeRef = useRef(initalDuration);
    useEffect(()=>{
        return () =>{
            if (intervalRef.current){
                clearInterval(intervalRef.current);
            }
        }
    }, [])

    const start = useCallback(() =>{
        if (isRunning) return;

        setIsRunning(true);
        intervalRef.current = setInterval(() =>{
            setTime(prevTime => {
                const newTime = prevTime +1;
                timeRef.current = newTime;
                return newTime;
            });
        }, 1000);
    }, [isRunning]);

    const pause = useCallback(()=>{
        if (!isRunning) return;
        setIsRunning(false);
        if (intervalRef.current){
            clearInterval(intervalRef.current);
            intervalRef.current = null
        }
    }, [isRunning]);

    const reset = useCallback((resetValue=0)=>{
        if(intervalRef.current){
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setIsRunning(false);
        setTime(resetValue);
        timeRef.current = resetValue;
    }, []);

    const setDuration = useCallback((duration)=>{
        if(typeof duration !== 'number' || duratoin < 0){
            console.warn('La duración debe de ser un número positivo');
            return;
        }
        if (intervalRef.current){
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
        setTime(duration);
        timeRef.current = duration;
    }, []);

    const formatTime = useCallback(()=>{
        const hours = Math.floor(time/3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time %60;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        return `${formattedHours}: ${formattedMinutes}: ${formattedSeconds}`;

    }, [time]);
    return{
        time,
        isRunning, start, pause, reset, setDuration, formatTime
    };
};
