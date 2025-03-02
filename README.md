# Stock Market Simulator

A React-based stock market simulator that allows users to practice trading with historical data. Features include portfolio management, market simulation controls, and realistic price movements.

## Features

- Historical market simulation starting from any date after 2000
- Portfolio management with cash balance tracking
- Real-time price updates based on historical data
- Market controls (pause, speed up, skip days)
- Price impact simulation for trades
- Persistent data storage

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Get your API key from [Finnhub](https://finnhub.io/register)
   - Replace `your_finnhub_api_key_here` with your Finnhub API key
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `VITE_FINNHUB_API_KEY`: Your Finnhub API key

You can get an API key by signing up at [Finnhub](https://finnhub.io/register). The free tier includes:
- 60 API calls/minute
- Real-time WebSocket
- 1 year of historical data
- US stock data

## Development

This project uses:
- React + Vite
- React Router for navigation
- Context API for state management
- Finnhub API for stock data
- Local Storage for data persistence

## API Usage

The application uses Finnhub's API endpoints:
- `/stock/candle`: For historical daily candle data
- `/quote`: For real-time stock quotes

Rate limits are handled through caching:
- Historical data is cached for 24 hours
- Requests are deduplicated to prevent redundant API calls
- Failed requests are properly handled with error messages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
