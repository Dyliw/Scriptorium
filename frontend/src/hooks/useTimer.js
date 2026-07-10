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
            intervalRef.current = null;sa
        }
    })
}
