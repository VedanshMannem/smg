import './App.css'
import Home from './pages/Home'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { PortfolioProvider } from './context/PortfolioContext'
import { MarketProvider } from './context/MarketContext'

function App() {
  return (
    <MarketProvider>
      <PortfolioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </PortfolioProvider>
    </MarketProvider>
  )
}

export default App
