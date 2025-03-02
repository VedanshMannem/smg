import StockCard from "../components/StockCard";
import PortfolioSummary from "../components/PortfolioSummary";
import MarketControls from "../components/MarketControls";
import { getStocks } from "../services/api";
import { useState, useEffect } from "react";
import { useMarket } from "../context/MarketContext";

function Home() {
    const [stocks, setStocks] = useState([]);
    const [searchSymbol, setSearchSymbol] = useState("");
    const [error, setError] = useState("");
    const [stockPrices, setStockPrices] = useState({});
    const { currentDate, isMarketOpen } = useMarket();

    // Effect to update stock prices based on current date
    useEffect(() => {
        const updateStockPrices = async () => {
            if (!stocks.length) return;

            try {
                const updatedStocks = await Promise.all(
                    stocks.map(async (stock) => {
                        const updatedData = await getStocks(stock.symbol, currentDate);
                        return updatedData || stock; // Fall back to existing data if update fails
                    })
                );

                setStocks(updatedStocks);
                
                // Update prices for portfolio calculation
                const prices = {};
                updatedStocks.forEach(stock => {
                    prices[stock.symbol] = stock.price;
                });
                setStockPrices(prices);
                
                // Save to localStorage
                localStorage.setItem("savedStocks", JSON.stringify(updatedStocks));
            } catch (error) {
                console.error("Error updating stock prices:", error);
            }
        };

        if (isMarketOpen) {
            updateStockPrices();
        }
    }, [currentDate, isMarketOpen]);

    // Load saved stocks on mount
    useEffect(() => {
        const savedStocks = localStorage.getItem("savedStocks");
        if (savedStocks) {
            const parsedStocks = JSON.parse(savedStocks);
            setStocks(parsedStocks);
            // Update stockPrices object
            const prices = {};
            parsedStocks.forEach(stock => {
                prices[stock.symbol] = stock.price;
            });
            setStockPrices(prices);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchSymbol.trim()) {
            setError("Please enter a stock symbol");
            return;
        }

        try {
            setError("");
            const stockData = await getStocks(searchSymbol.toUpperCase(), currentDate);
            
            if (!stockData) {
                setError("Stock not found or API limit reached");
                return;
            }

            // Check if stock already exists in the list
            const stockExists = stocks.some(stock => stock.symbol === stockData.symbol);
            
            if (!stockExists) {
                const updatedStocks = [...stocks, stockData];
                setStocks(updatedStocks);
                // Update stockPrices
                setStockPrices(prev => ({
                    ...prev,
                    [stockData.symbol]: stockData.price
                }));
                // Save to localStorage
                localStorage.setItem("savedStocks", JSON.stringify(updatedStocks));
            }
            
            setSearchSymbol("");
        } catch (error) {
            setError("Error fetching stock data");
            console.error("Error fetching stocks:", error);
        }
    };

    const removeStock = (symbol) => {
        const updatedStocks = stocks.filter(stock => stock.symbol !== symbol);
        setStocks(updatedStocks);
        // Update stockPrices
        const updatedPrices = { ...stockPrices };
        delete updatedPrices[symbol];
        setStockPrices(updatedPrices);
        localStorage.setItem("savedStocks", JSON.stringify(updatedStocks));
    };

    return (
        <div className="home-container">
            <h1>Stock Market Simulator</h1>
            
            <MarketControls />
            
            <PortfolioSummary stockPrices={stockPrices} />
            
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="stock-container">
                {stocks.map((stock) => (
                    <div key={stock.symbol} className="stock-wrapper">
                        <StockCard stock={stock} />
                        <button 
                            onClick={() => removeStock(stock.symbol)}
                            className="remove-button"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
