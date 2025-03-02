import { historicalCache } from './cacheService';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
if (!API_KEY) {
    throw new Error('Finnhub API key not found. Please check your environment variables.');
}

const BASE_URL = "https://finnhub.io/api/v1";

// Function to fetch historical data with caching
async function fetchHistoricalData(symbol) {
    // Check if we already have a pending request for this symbol
    const pendingRequest = historicalCache.getPendingRequest(symbol);
    if (pendingRequest) {
        return pendingRequest;
    }

    // Check if we have valid cached data
    if (historicalCache.isValid(symbol)) {
        return historicalCache.cache[symbol].data;
    }

    // Create new request
    const promise = new Promise(async (resolve, reject) => {
        try {
            // Get timestamp for 1 year of data
            const toTimestamp = Math.floor(Date.now() / 1000);
            const fromTimestamp = toTimestamp - (365 * 24 * 60 * 60); // 1 year ago

            const response = await fetch(
                `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${fromTimestamp}&to=${toTimestamp}&token=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.s === 'no_data') {
                throw new Error("No data available for this symbol");
            }

            // Transform Finnhub data into our required format
            const transformedData = {};
            for (let i = 0; i < data.t.length; i++) {
                const date = new Date(data.t[i] * 1000).toISOString().split('T')[0];
                transformedData[date] = {
                    "1. open": data.o[i].toString(),
                    "2. high": data.h[i].toString(),
                    "3. low": data.l[i].toString(),
                    "4. close": data.c[i].toString(),
                    "5. volume": data.v[i].toString()
                };
            }

            // Store in cache
            historicalCache.setData(symbol, transformedData);
            resolve(transformedData);
        } catch (error) {
            reject(error);
        }
    });

    // Store the promise in pending requests
    historicalCache.setPendingRequest(symbol, promise);
    return promise;
}

// Function to get real-time quote
async function getQuote(symbol) {
    const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
    );
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

export const getStocks = async (symbol, date) => {
    try {
        // Get historical data from cache or API
        const historicalData = await fetchHistoricalData(symbol);
        
        // Format the date to match API format (YYYY-MM-DD)
        const dateStr = date.toISOString().split('T')[0];
        
        // Get the data for the specific date
        const dayData = historicalData[dateStr];
        
        if (!dayData) {
            throw new Error("No data available for this date");
        }

        // Parse OHLC data
        const open = parseFloat(dayData["1. open"]);
        const high = parseFloat(dayData["2. high"]);
        const low = parseFloat(dayData["3. low"]);
        const close = parseFloat(dayData["4. close"]);
        const volume = parseInt(dayData["5. volume"]);

        // Calculate time progress through the trading day
        const marketOpen = new Date(date);
        marketOpen.setHours(9, 30, 0, 0);
        const marketClose = new Date(date);
        marketClose.setHours(16, 0, 0, 0);
        const totalTradingMinutes = (marketClose - marketOpen) / (1000 * 60);
        const currentMinutes = (date - marketOpen) / (1000 * 60);
        const timeProgress = Math.max(0, Math.min(1, currentMinutes / totalTradingMinutes));

        // Get the previous day's data
        const previousDate = new Date(date);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateStr = previousDate.toISOString().split('T')[0];
        const previousDayData = historicalData[previousDateStr];
        const previousClose = previousDayData ? parseFloat(previousDayData["4. close"]) : open;

        // Calculate current price based on time of day
        const price = simulateIntradayPrice(open, high, low, close, timeProgress);
        
        // Calculate price changes
        const change = price - previousClose;
        const changePercent = ((price - previousClose) / previousClose * 100).toFixed(2) + '%';

        return {
            symbol,
            open,
            high,
            low,
            price,
            volume,
            latestTradingDay: dateStr,
            previousClose,
            change,
            changePercent,
            lastUpdated: date.toLocaleString(),
            quantity: 0
        };
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
};

// Simplified price simulation function
function simulateIntradayPrice(open, high, low, close, progress) {
    if (progress <= 0) return open;
    if (progress >= 1) return close;

    // Simple linear interpolation between open and close with some randomness
    const basePrice = open + (close - open) * progress;
    const maxDeviation = (high - low) * 0.1;
    const randomDeviation = (Math.random() - 0.5) * maxDeviation;
    
    return basePrice + randomDeviation;
}

// Helper function to format currency
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Helper function to format large numbers
export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
};


