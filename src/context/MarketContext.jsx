import { createContext, useContext, useState, useEffect } from 'react';

const MarketContext = createContext();

// Generate a random start date between 2000 and 2023
const getRandomStartDate = () => {
    const start = new Date(2000, 0, 1).getTime();
    const end = new Date(2023, 11, 31).getTime();
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);
    // Set to market opening time (9:30 AM EST)
    date.setHours(9, 30, 0, 0);
    return date;
};

export function MarketProvider({ children }) {
    const [currentDate, setCurrentDate] = useState(() => {
        const saved = localStorage.getItem('marketDate');
        return saved ? new Date(saved) : getRandomStartDate();
    });

    const [isMarketOpen, setIsMarketOpen] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState(1); // 1 = real-time, 2 = 2x speed, etc.
    const [isPaused, setIsPaused] = useState(true);

    useEffect(() => {
        localStorage.setItem('marketDate', currentDate.toISOString());
    }, [currentDate]);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentDate(prevDate => {
                const newDate = new Date(prevDate);
                // Add 5 minutes * simulation speed
                newDate.setMinutes(newDate.getMinutes() + (5 * simulationSpeed));

                // Check if we've reached market closing time (4:00 PM EST)
                if (newDate.getHours() >= 16) {
                    setIsMarketOpen(false);
                    // Skip to next day at 9:30 AM
                    newDate.setDate(newDate.getDate() + 1);
                    newDate.setHours(9, 30, 0, 0);
                    setIsMarketOpen(true);
                }

                // Skip weekends
                if (newDate.getDay() === 0) { // Sunday
                    newDate.setDate(newDate.getDate() + 1);
                    newDate.setHours(9, 30, 0, 0);
                } else if (newDate.getDay() === 6) { // Saturday
                    newDate.setDate(newDate.getDate() + 2);
                    newDate.setHours(9, 30, 0, 0);
                }

                return newDate;
            });
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [isPaused, simulationSpeed]);

    const togglePause = () => setIsPaused(prev => !prev);
    
    const changeSpeed = (speed) => setSimulationSpeed(speed);
    
    const skipToNextDay = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 1);
            newDate.setHours(9, 30, 0, 0);
            
            // Skip weekends
            if (newDate.getDay() === 0) { // Sunday
                newDate.setDate(newDate.getDate() + 1);
            } else if (newDate.getDay() === 6) { // Saturday
                newDate.setDate(newDate.getDate() + 2);
            }
            
            return newDate;
        });
        setIsMarketOpen(true);
    };

    const skipToPreviousDay = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(9, 30, 0, 0);
            
            // Skip weekends
            if (newDate.getDay() === 0) { // Sunday
                newDate.setDate(newDate.getDate() - 2);
            } else if (newDate.getDay() === 6) { // Saturday
                newDate.setDate(newDate.getDate() - 1);
            }
            
            return newDate;
        });
        setIsMarketOpen(true);
    };

    return (
        <MarketContext.Provider value={{
            currentDate,
            isMarketOpen,
            simulationSpeed,
            isPaused,
            togglePause,
            changeSpeed,
            skipToNextDay,
            skipToPreviousDay
        }}>
            {children}
        </MarketContext.Provider>
    );
}

export function useMarket() {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarket must be used within a MarketProvider');
    }
    return context;
} 