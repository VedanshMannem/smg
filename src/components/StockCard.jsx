import { formatCurrency, formatNumber } from "../services/api";
import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

function StockCard({stock}) {
    const { buyStock, sellStock, getStockQuantity } = usePortfolio();
    const [transactionAmount, setTransactionAmount] = useState(1);
    const [error, setError] = useState("");
    
    const quantity = getStockQuantity(stock.symbol);

    const handleBuy = () => {
        try {
            buyStock(stock.symbol, transactionAmount, stock.price);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSell = () => {
        try {
            sellStock(stock.symbol, transactionAmount, stock.price);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    };

    const priceChange = parseFloat(stock.change);
    const isPositiveChange = priceChange >= 0;

    return (
        <div className="stock-card">
            <div className="stock-header">
                <h2 className="stock-symbol">{stock.symbol}</h2>
                <p className="stock-price">{formatCurrency(stock.price)}</p>
            </div>
            
            <div className="stock-details">
                <div className="stock-change" style={{ color: isPositiveChange ? '#4caf50' : '#f44336' }}>
                    <span>{isPositiveChange ? '▲' : '▼'} </span>
                    <span>{formatCurrency(Math.abs(priceChange))} ({stock.changePercent})</span>
                </div>
                
                <div className="stock-info-grid">
                    <div>
                        <label>Open</label>
                        <span>{formatCurrency(stock.open)}</span>
                    </div>
                    <div>
                        <label>High</label>
                        <span>{formatCurrency(stock.high)}</span>
                    </div>
                    <div>
                        <label>Low</label>
                        <span>{formatCurrency(stock.low)}</span>
                    </div>
                    <div>
                        <label>Volume</label>
                        <span>{formatNumber(stock.volume)}</span>
                    </div>
                </div>

                <div className="stock-position">
                    <label>Your Position:</label>
                    <span>{quantity} shares</span>
                    <span>({formatCurrency(quantity * stock.price)})</span>
                </div>

                <div className="transaction-controls">
                    <input
                        type="number"
                        min="1"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(parseInt(e.target.value) || 0)}
                        className="transaction-input"
                    />
                    <div className="transaction-buttons">
                        <button 
                            className="buy-button" 
                            onClick={handleBuy}
                            disabled={transactionAmount <= 0}
                        >
                            Buy
                        </button>
                        <button 
                            className="sell-button" 
                            onClick={handleSell}
                            disabled={quantity < transactionAmount}
                        >
                            Sell
                        </button>
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="last-updated">
                    <small>Last updated: {stock.lastUpdated}</small>
                </div>
            </div>
        </div>
    );
}

export default StockCard;