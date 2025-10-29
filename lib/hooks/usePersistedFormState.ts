// usePersistedFormState.ts
import { useState, useEffect } from 'react';

export function usePersistedFormState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedValue = window.localStorage.getItem(key);
                return storedValue ? JSON.parse(storedValue) : initialState;
            } catch (error) {
                console.error(`Error reading localStorage key "${key}":`, error);
                return initialState;
            }
        }
        return initialState;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.error(`Error writing localStorage key "${key}":`, error);
            }
        }
    }, [key, state]);

    return [state, setState];
}