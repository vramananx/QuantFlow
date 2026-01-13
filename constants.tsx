
import { StrategyDSL, Frequency, RebalanceMode, PortfolioTemplate } from './types.ts';

export const PORTFOLIO_LIBRARY: PortfolioTemplate[] = [
  {
    id: 'pt-tqqq-only',
    name: '100% TQQQ (Proshares)',
    category: 'High-Growth',
    riskGrade: 'High',
    description: 'Pure 3x Leveraged Nasdaq-100 exposure. High volatility, massive potential drawdowns.',
    assets: [
      { ticker: 'TQQQ', weight: 1.0 }
    ]
  },
  {
    id: 'pt-ai-titans',
    name: 'AI & Semiconductor Titans',
    category: 'Tech',
    riskGrade: 'High',
    description: 'The picks and shovels of the AI revolution. NVDA, MSFT, AMD.',
    assets: [
      { ticker: 'NVDA', weight: 0.30 },
      { ticker: 'MSFT', weight: 0.20 },
      { ticker: 'GOOGL', weight: 0.15 },
      { ticker: 'AMD', weight: 0.15 },
      { ticker: 'TSM', weight: 0.10 },
      { ticker: 'AVGO', weight: 0.10 }
    ]
  },
  {
    id: 'pt-all-weather',
    name: 'Ray Dalio All-Weather',
    category: 'Macro',
    riskGrade: 'Low',
    description: 'Risk-parity approach designed to thrive across all economic regimes.',
    assets: [
      { ticker: 'VTI', weight: 0.30 },
      { ticker: 'TLT', weight: 0.40 },
      { ticker: 'IEI', weight: 0.15 },
      { ticker: 'GLD', weight: 0.075 },
      { ticker: 'GSG', weight: 0.075 }
    ]
  }
];

export const DCA_BASELINE_DSL: StrategyDSL = {
  id: 'strat-dca-baseline',
  name: "DCA Baseline (Buy & Hold)",
  description: "Standard Dollar Cost Averaging. Always buy, never sell.",
  logicDescription: "The baseline strategy. Capital is deployed into target weights. No timing, no rebalance.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [],
  signals: [],
  allocation: { mode: "target_weights" },
  rebalance: { mode: RebalanceMode.NONE, max_drift: 0.05 },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close', slippage_bps: 1 }
};

export const SMA_TREND_DSL: StrategyDSL = {
  id: 'strat-sma-200',
  name: "Trend Protector (SMA Gate)",
  description: "Exits to Risk-Off (AGG) when Macro Asset falls below SMA.",
  logicDescription: "Uses a 200-day SMA gate. Rotates to Safety (AGG) if price drops below SMA.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "macro_sma", type: "SMA", source: "ticker", ticker: "QQQ", window: 200 }
  ],
  signals: [
    { id: "bull_regime", condition: { op: "gt", left: { ref: "price" }, right: { ind: "macro_sma" } } }
  ],
  allocation: { 
    mode: "target_weights", 
    risk_off: [{ ticker: 'AGG', weight: 1.0 }],
    regime_filter_ticker: 'QQQ',
    regime_indicator_window: 200
  },
  rebalance: { mode: RebalanceMode.THRESHOLD, max_drift: 0.05 },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close', slippage_bps: 5 }
};

export const GOLDEN_CROSS_DSL: StrategyDSL = {
  id: 'strat-golden-cross',
  name: "Golden Cross (50/200)",
  description: "Bullish when 50 SMA > 200 SMA. Rotates to Safety otherwise.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "sma_50", type: "SMA", source: "ticker", ticker: "SPY", window: 50 },
    { id: "sma_200", type: "SMA", source: "ticker", ticker: "SPY", window: 200 }
  ],
  signals: [],
  allocation: { mode: "target_weights", risk_off: [{ ticker: 'AGG', weight: 1.0 }] },
  rebalance: { mode: RebalanceMode.MONTHLY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
};

export const RSI_MOMENTUM_DSL: StrategyDSL = {
  id: 'strat-rsi-mom',
  name: "RSI Momentum Filter",
  description: "Invests only when RSI > 50 (Positive Momentum).",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [{ id: "rsi_14", type: "RSI", source: "ticker", ticker: "SPY", window: 14 }],
  signals: [],
  allocation: { mode: "target_weights", risk_off: [{ ticker: 'BIL', weight: 1.0 }] },
  rebalance: { mode: RebalanceMode.NONE },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
};

export const NINE_SIG_DSL: StrategyDSL = {
  id: 'strat-9sig',
  name: "9-Sig Mean Reversion",
  description: "Aggressive mean reversion strategy for volatile assets.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [],
  signals: [],
  allocation: { mode: "target_weights" },
  rebalance: { mode: RebalanceMode.DAILY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'open' }
};

export const STRATEGY_LIBRARY: StrategyDSL[] = [
  DCA_BASELINE_DSL,
  SMA_TREND_DSL,
  GOLDEN_CROSS_DSL,
  RSI_MOMENTUM_DSL,
  NINE_SIG_DSL
];
