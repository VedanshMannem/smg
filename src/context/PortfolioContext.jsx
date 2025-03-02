import { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency } from '../services/api';

const PortfolioContext = createContext();

const INITIAL_BALANCE = 100000;

export function PortfolioProvider({ children }) {
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem('portfolioBalance');
        return saved ? parseFloat(saved) : INITIAL_BALANCE;
    });

    const [portfolio, setPortfolio] = useState(() => {
        const saved = localStorage.getItem('portfolio');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('portfolioBalance', balance);
    }, [balance]);

    useEffect(() => {
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
    }, [portfolio]);

    const buyStock = (symbol, quantity, price) => {
        const totalCost = quantity * price;
        if (totalCost > balance) {
            throw new Error(`Insufficient funds. You need ${formatCurrency(totalCost)} but have ${formatCurrency(balance)}`);
        }

        setBalance(prev => prev - totalCost);
        setPortfolio(prev => ({
            ...prev,
            [symbol]: (prev[symbol] || 0) + quantity
        }));

        return true;
    };

    const sellStock = (symbol, quantity, price) => {
        const currentQuantity = portfolio[symbol] || 0;
        if (quantity > currentQuantity) {
            throw new Error(`Insufficient shares. You only have ${currentQuantity} shares of ${symbol}`);
        }

        const totalProceeds = quantity * price;
        setBalance(prev => prev + totalProceeds);
        setPortfolio(prev => {
            const newQuantity = prev[symbol] - quantity;
            const newPortfolio = { ...prev };
            if (newQuantity === 0) {
                delete newPortfolio[symbol];
            } else {
                newPortfolio[symbol] = newQuantity;
            }
            return newPortfolio;
        });

        return true;
    };

    const getStockQuantity = (symbol) => {
        return portfolio[symbol] || 0;
    };

    const getTotalPortfolioValue = (stockPrices) => {
        return Object.entries(portfolio).reduce((total, [symbol, quantity]) => {
            const price = stockPrices[symbol];
            return total + (price * quantity);
        }, 0);
    };

    return (
        <PortfolioContext.Provider value={{
            balance,
            portfolio,
            buyStock,
            sellStock,
            getStockQuantity,
            getTotalPortfolioValue
        }}>
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within a PortfolioProvider');
    }
    return context;
} 