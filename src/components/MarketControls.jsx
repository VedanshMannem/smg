import { useMarket } from '../context/MarketContext';

function MarketControls() {
    const {
        currentDate,
        isMarketOpen,
        simulationSpeed,
        isPaused,
        togglePause,
        changeSpeed,
        skipToNextDay,
        skipToPreviousDay
    } = useMarket();

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'America/New_York'
        }).format(date);
    };

    return (
        <div className="market-controls">
            <div className="market-status">
                <h3>Market Simulation</h3>
                <p className="current-date">{formatDate(currentDate)}</p>
                <p className={`market-state ${isMarketOpen ? 'open' : 'closed'}`}>
                    Market is {isMarketOpen ? 'Open' : 'Closed'}
                </p>
            </div>

            <div className="simulation-controls">
                <button onClick={skipToPreviousDay} className="control-button">
                    ◀◀ Previous Day
                </button>
                <button onClick={togglePause} className="control-button">
                    {isPaused ? '▶ Start' : '⏸ Pause'}
                </button>
                <button onClick={skipToNextDay} className="control-button">
                    Next Day ▶▶
                </button>
            </div>

            <div className="speed-controls">
                <label>Simulation Speed:</label>
                <div className="speed-buttons">
                    {[1, 2, 5, 10].map(speed => (
                        <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            className={`speed-button ${simulationSpeed === speed ? 'active' : ''}`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MarketControls; 