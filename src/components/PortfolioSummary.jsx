import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../services/api';

function PortfolioSummary({ stockPrices }) {
    const { balance, portfolio, getTotalPortfolioValue } = usePortfolio();
    const portfolioValue = getTotalPortfolioValue(stockPrices);
    const totalValue = balance + portfolioValue;

    return (
        <div className="portfolio-summary">
            <h2>Portfolio Summary</h2>
            <div className="summary-grid">
                <div className="summary-item">
                    <label>Cash Balance</label>
                    <span className="value">{formatCurrency(balance)}</span>
                </div>
                <div className="summary-item">
                    <label>Portfolio Value</label>
                    <span className="value">{formatCurrency(portfolioValue)}</span>
                </div>
                <div className="summary-item total">
                    <label>Total Value</label>
                    <span className="value">{formatCurrency(totalValue)}</span>
                </div>
            </div>

            <div className="holdings-section">
                <h3>Current Holdings</h3>
                {Object.entries(portfolio).length === 0 ? (
                    <p className="no-holdings">No stocks in portfolio</p>
                ) : (
                    <div className="holdings-grid">
                        {Object.entries(portfolio).map(([symbol, quantity]) => (
                            <div key={symbol} className="holding-item">
                                <span className="symbol">{symbol}</span>
                                <span className="quantity">{quantity} shares</span>
                                <span className="value">
                                    {formatCurrency(quantity * (stockPrices[symbol] || 0))}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PortfolioSummary; 