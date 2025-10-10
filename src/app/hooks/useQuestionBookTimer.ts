import { useState, useEffect, useRef } from 'react';
import { getQuestionBookTimer, saveQuestionBookTimer } from '@/question-books/timer/question-book-timer.action';

export function useQuestionBookTimer(questionBookId: string) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadTimer = async () => {
            const result = await getQuestionBookTimer(questionBookId);
            if (result.success && result.data) {
                setTime(result.data.elapsedTimeMs || 0);
                setIsRunning(true); 
            } else {
                console.warn('Could not load timer from backend:', result.error);
                setTime(0);
                setIsRunning(true);
            }
            setIsLoaded(true);
        };

        loadTimer();
    }, [questionBookId]);

    useEffect(() => {
        if (isRunning && isLoaded) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1000);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isLoaded]);

    const start = async () => {
        setIsRunning(true);
    };

    const pause = async () => {
        setIsRunning(false);
        await saveQuestionBookTimer(questionBookId, time);
    };

    const saveProgress = async () => {
        await saveQuestionBookTimer(questionBookId, time);
    };

    const formatedTime = () => {
        const seconds = Math.floor(time / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    };

    useEffect(() => {
        if (isRunning && time > 0 && time % 30000 === 0) {
            saveProgress();
        }
    }, [time, isRunning]);

    useEffect(() => {
        return () => {
            if (time > 0) {
                saveProgress();
            }
        };
    }, []);

    return {
        time,
        isRunning,
        isLoaded,
        start,
        pause,
        saveProgress,
        formattedTime: formatedTime()
    };
}
