// Cache historical data in localStorage to persist between sessions
const CACHE_KEY = 'stockHistoricalData';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load cache from localStorage
const loadCache = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            return data;
        }
    }
    return {};
};

// Save cache to localStorage
const saveCache = (cache) => {
    const cacheData = {
        data: cache,
        timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

class HistoricalDataCache {
    constructor() {
        this.cache = loadCache();
        this.pendingRequests = {};
    }

    // Get data from cache
    getData(symbol, date) {
        return this.cache[symbol]?.data?.[date];
    }

    // Store data in cache
    setData(symbol, data) {
        this.cache[symbol] = {
            data: data,
            timestamp: Date.now()
        };
        saveCache(this.cache);
    }

    // Check if data is cached and valid
    isValid(symbol) {
        const cached = this.cache[symbol];
        if (!cached) return false;
        return Date.now() - cached.timestamp < CACHE_EXPIRY;
    }

    // Get pending promise for a symbol if exists
    getPendingRequest(symbol) {
        return this.pendingRequests[symbol];
    }

    // Set pending promise for a symbol
    setPendingRequest(symbol, promise) {
        this.pendingRequests[symbol] = promise;
        promise.finally(() => {
            delete this.pendingRequests[symbol];
        });
    }
}

export const historicalCache = new HistoricalDataCache(); 