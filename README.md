
# QuantFlow Backtester Pro

A high-performance portfolio backtesting suite featuring a custom Strategy DSL (Domain Specific Language) for quantitative analysis.

## Core Features
- **Strategy DSL**: Define complex trend, momentum, and mean-reversion strategies using a JSON-based AST.
- **Dynamic Cashflows**: Simulate periodic contributions (weekly, monthly, quarterly).
- **Comprehensive Metrics**: CAGR, Max Drawdown, Sharpe Ratio, and Annualized Volatility.
- **High-Fidelity Charts**: Interactive equity growth and drawdown visualization using Recharts.

## Setup Instructions

### Frontend (React + Vite)
1. Ensure you have Node.js installed.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. Open the provided `index.html` in your browser.

### Backend (Python FastAPI)
1. Install Python 3.11+.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `venv\Scripts\activate`.
4. Install requirements: `pip install fastapi uvicorn pandas numpy yfinance pydantic`.
5. Run the server: `python backend/main.py`.

## API Contract (Locked)
The application expects a `POST` to `/api/backtest` with the following schema:
```json
{
  "portfolio": [{"ticker":"TQQQ","weight":0.6}],
  "start_date": "2010-01-01",
  "end_date": "2024-12-31",
  "initial_capital": 10000,
  "contribution": {"amount": 1000, "frequency": "weekly"},
  "strategy": {
     "mode": "dsl",
     "dsl": { ...StrategyDSLObject... }
  }
}
```

## Strategy DSL Specification
The DSL allows defining:
- `indicators`: SMA, EMA, RSI, VOL.
- `signals`: Logic nodes using `op` (gt, lt, cross_above, etc.).
- `allocation`: Risk-on / Risk-off target weights based on signals.
