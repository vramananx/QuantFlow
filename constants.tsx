
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
    description: 'The picks and shovels of the AI revolution. High growth, high volatility. NVDA, MSFT, AMD.',
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
    id: 'pt-tqqq-leverage',
    name: 'TQQQ Aggressive Alpha',
    category: 'High-Growth',
    riskGrade: 'High',
    description: '3x Leveraged Nasdaq 100 exposure. Requires precision trend gating to avoid volatility drag.',
    assets: [
      { ticker: 'TQQQ', weight: 0.60 },
      { ticker: 'AGG', weight: 0.40 }
    ]
  },
  {
    id: 'pt-dragon',
    name: 'Dragon Portfolio',
    category: 'Macro',
    riskGrade: 'Medium',
    description: 'Artemis Capital style. Long Volatility and Gold to prosper in secular stagnation or inflation.',
    assets: [
      { ticker: 'SPY', weight: 0.20 },
      { ticker: 'TLT', weight: 0.20 },
      { ticker: 'GLD', weight: 0.20 },
      { ticker: 'VXZ', weight: 0.20 }, // Long Vol proxy
      { ticker: 'DBC', weight: 0.20 }
    ]
  },
  {
    id: 'pt-golden-butterfly',
    name: 'Golden Butterfly',
    category: 'Conservative',
    riskGrade: 'Low',
    description: 'A stable variation of the Permanent Portfolio with a slight tilt towards Small Cap Value.',
    assets: [
      { ticker: 'VTI', weight: 0.20 },
      { ticker: 'IJS', weight: 0.20 }, // Small Cap Value
      { ticker: 'TLT', weight: 0.20 },
      { ticker: 'SHY', weight: 0.20 },
      { ticker: 'GLD', weight: 0.20 }
    ]
  },
  {
    id: 'pt-swensen',
    name: 'Swensen Model (Yale)',
    category: 'Conservative',
    riskGrade: 'Medium',
    description: 'David Swensen\'s endowment model focusing on diversification across asset classes.',
    assets: [
      { ticker: 'VTI', weight: 0.30 },
      { ticker: 'VEA', weight: 0.15 },
      { ticker: 'VWO', weight: 0.05 },
      { ticker: 'VNQ', weight: 0.20 },
      { ticker: 'TLT', weight: 0.15 },
      { ticker: 'TIP', weight: 0.15 }
    ]
  },
  {
    id: 'pt-buffett',
    name: 'Buffett 90/10',
    category: 'Macro',
    riskGrade: 'Medium',
    description: 'The oracle\'s simple advice: 90% S&P 500 and 10% Short Term Treasuries.',
    assets: [
      { ticker: 'SPY', weight: 0.90 },
      { ticker: 'BIL', weight: 0.10 }
    ]
  },
  {
    id: 'pt-income-yield',
    name: 'Covered Call Income',
    category: 'Income',
    riskGrade: 'Medium',
    description: 'High-yield monthly income focusing on JEPI, JEPQ and DIVO for cash flow.',
    assets: [
      { ticker: 'JEPI', weight: 0.40 },
      { ticker: 'JEPQ', weight: 0.40 },
      { ticker: 'DIVO', weight: 0.20 }
    ]
  },
  {
    id: 'pt-all-weather',
    name: 'Ray Dalio All-Weather',
    category: 'Macro',
    riskGrade: 'Low',
    description: 'Risk-parity approach designed to thrive across all economic regimes (Growth/Inflation).',
    assets: [
      { ticker: 'VTI', weight: 0.30 },
      { ticker: 'TLT', weight: 0.40 },
      { ticker: 'IEI', weight: 0.15 },
      { ticker: 'GLD', weight: 0.075 },
      { ticker: 'GSG', weight: 0.075 }
    ]
  },
  {
    id: 'pt-6040',
    name: 'Classic 60/40 Benchmark',
    category: 'Conservative',
    riskGrade: 'Medium',
    description: 'The standard institutional benchmark for balanced growth and fixed income.',
    assets: [
      { ticker: 'SPY', weight: 0.60 },
      { ticker: 'BND', weight: 0.40 }
    ]
  },
  {
    id: 'pt-defensive-fortress',
    name: 'Defensive Value Fortress',
    category: 'Conservative',
    riskGrade: 'Low',
    description: 'Recession-resistant stocks in consumer staples and healthcare.',
    assets: [
      { ticker: 'XLP', weight: 0.30 },
      { ticker: 'XLV', weight: 0.30 },
      { ticker: 'JNJ', weight: 0.20 },
      { ticker: 'PG', weight: 0.20 }
    ]
  },
  {
    id: 'pt-dividend-growth',
    name: 'Dividend Growth Elite',
    category: 'Sectoral',
    riskGrade: 'Medium',
    description: 'Compound interest machine focusing on dividend growth aristocrats.',
    assets: [
      { ticker: 'SCHD', weight: 0.40 },
      { ticker: 'VIG', weight: 0.30 },
      { ticker: 'DGRO', weight: 0.30 }
    ]
  },
  {
    id: 'pt-macro-commodities',
    name: 'Global Macro & Metals',
    category: 'Macro',
    riskGrade: 'High',
    description: 'Inflation hedge using Gold, Silver, and Commodities.',
    assets: [
      { ticker: 'GLD', weight: 0.30 },
      { ticker: 'SLV', weight: 0.20 },
      { ticker: 'DBC', weight: 0.30 },
      { ticker: 'GDX', weight: 0.20 }
    ]
  }
];

export const DCA_BASELINE_DSL: StrategyDSL = {
  id: 'strat-dca-baseline',
  name: "DCA Baseline (Buy & Hold)",
  description: "Standard Dollar Cost Averaging. Always buy, never sell.",
  logicDescription: "The baseline strategy. Capital is deployed into the target portfolio weights regardless of market conditions. No timing, no hedging.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [],
  signals: [],
  allocation: { mode: "target_weights" },
  rebalance: { mode: RebalanceMode.MONTHLY, max_drift: 0.05 },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close', slippage_bps: 1 }
};

export const SMA_TREND_DSL: StrategyDSL = {
  id: 'strat-sma-200',
  name: "Trend Protector (SMA Gate)",
  description: "Exits to Risk-Off when Macro Asset falls below SMA.",
  logicDescription: "Uses a Simple Moving Average (default 200-day) on a macro ticker (QQQ/SPY). If price drops below the SMA (minus buffer), rotate to Safety.",
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
    regime_indicator_window: 200,
    regime_buffer_pct: 0.01 // 1% Buffer default
  },
  risk: { max_drawdown_stop: 0.20 },
  rebalance: { mode: RebalanceMode.WEEKLY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close', slippage_bps: 5 }
};

export const GOLDEN_CROSS_DSL: StrategyDSL = {
  id: 'strat-golden-cross',
  name: "Golden Cross Rotation",
  description: "Classic SMA 50 crossing above SMA 200 logic.",
  logicDescription: "Checks if the 50-day SMA is above the 200-day SMA for the regime ticker (SPY). This confirms a long-term bull trend. If 50 < 200 (Death Cross), rotate to Cash.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "sma_50", type: "SMA", source: "ticker", ticker: "SPY", window: 50 },
    { id: "sma_200", type: "SMA", source: "ticker", ticker: "SPY", window: 200 }
  ],
  signals: [
    { id: "golden_cross", condition: { op: "gt", left: { ind: "sma_50" }, right: { ind: "sma_200" } } }
  ],
  allocation: { 
    mode: "target_weights",
    risk_off: [{ ticker: 'BIL', weight: 1.0 }],
    regime_filter_ticker: 'SPY',
    regime_indicator_window: 200
  },
  rebalance: { mode: RebalanceMode.MONTHLY },
  execution: { signal_evaluation_frequency: Frequency.WEEKLY, trade_timing: 'close' }
};

export const RSI_MOMENTUM_DSL: StrategyDSL = {
  id: 'strat-rsi-mom',
  name: "RSI Momentum Filter",
  description: "Only invest when RSI > 50 (Positive Momentum).",
  logicDescription: "Uses the Relative Strength Index (14-day) as a regime filter. We want to be in the market only when momentum is positive (RSI > 50). Avoids catching falling knives.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "rsi_14", type: "RSI", source: "ticker", ticker: "SPY", window: 14 }
  ],
  signals: [
    { id: "pos_mom", condition: { op: "gt", left: { ind: "rsi_14" }, right: { val: 50 } } }
  ],
  allocation: { 
    mode: "target_weights",
    risk_off: [{ ticker: 'AGG', weight: 1.0 }],
    regime_filter_ticker: 'SPY',
    regime_indicator_window: 14
  },
  rebalance: { mode: RebalanceMode.WEEKLY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
};

export const LRS_ROTATION_DSL: StrategyDSL = {
  id: 'strat-lrs-rot',
  name: "LRS Trend Rotation",
  description: "Uses Linear Regression Slope to filter noise.",
  logicDescription: "Calculates the 126-day Linear Regression Slope (approx 6 months). If the slope is positive (>0), the trend is mathematically robust and we stay Risk-On. If negative, we rotate to Cash/BIL.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "lrs_126", type: "LRS", source: "price", window: 126 }
  ],
  signals: [
    { id: "positive_slope", condition: { op: "gt", left: { ind: "lrs_126" }, right: { val: 0 } } }
  ],
  allocation: { 
    mode: "target_weights",
    risk_off: [{ ticker: 'BIL', weight: 1.0 }],
    regime_filter_ticker: 'SPY', // LRS often applied to SPY
    regime_indicator_window: 126
  },
  rebalance: { mode: RebalanceMode.MONTHLY },
  execution: { signal_evaluation_frequency: Frequency.WEEKLY, trade_timing: 'close' }
};

export const NINE_SIG_DSL: StrategyDSL = {
  id: 'strat-9sig',
  name: "9-SIG Rotation",
  description: "Tactical rotation based on 9% volatility bands and momentum.",
  logicDescription: "A proprietary signal logic that rotates between the core portfolio and high-beta assets when price moves exceed 9% from a 50-day moving basis. Designed to capture extreme momentum shifts.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [{ id: "sma_50", type: "SMA", source: "price", window: 50 }],
  signals: [],
  allocation: { mode: "target_weights" },
  rebalance: { mode: RebalanceMode.DAILY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
};

export const NUCLEAR_DEFENSIVE_DSL: StrategyDSL = {
  id: 'strat-nuclear',
  name: "Nuclear Defensive (VIX Gated)",
  description: "Aggressive downside protection using VIX volatility spikes.",
  logicDescription: "If VIX spikes above 25 OR QQQ falls below its 100 SMA, the portfolio liquidates to BIL (Ultra-Short Treasuries). High robustness for black swan events.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
    { id: "vix_current", type: "VIX_LEVEL", source: "ticker", ticker: "VIX", window: 1 },
    { id: "qqq_sma_100", type: "SMA", source: "ticker", ticker: "QQQ", window: 100 }
  ],
  signals: [
    { id: "danger_vix", condition: { op: "gt", left: { ind: "vix_current" }, right: { val: 25 } } }
  ],
  allocation: { 
    mode: "target_weights", 
    risk_off: [{ ticker: 'BIL', weight: 1.0 }],
    regime_filter_ticker: 'QQQ',
    regime_indicator_window: 100,
    use_vix_gate: true,
    vix_threshold: 25
  },
  risk: { max_drawdown_stop: 0.10, trailing_stop: 0.05 },
  rebalance: { mode: RebalanceMode.DAILY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'open', slippage_bps: 2 }
};

export const VOL_TARGET_DSL: StrategyDSL = {
  id: 'strat-voltarget',
  name: "Volatility Target (10%)",
  description: "Maintains a constant risk profile by scaling exposure down in high-vol environments.",
  logicDescription: "Calculates the 20-day realized volatility of the portfolio. If it exceeds 10%, we move a proportional amount to AGG to dampen the ride.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [{ id: "p_vol", type: "VOL", source: "price", window: 20 }],
  signals: [],
  allocation: { 
    mode: "target_weights", 
    risk_off: [{ ticker: 'AGG', weight: 1.0 }],
    regime_filter_ticker: 'SPY',
    regime_indicator_window: 20
  },
  risk: { vol_target: 0.10 },
  rebalance: { mode: RebalanceMode.WEEKLY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close', slippage_bps: 3 }
};

export const ADAPTIVE_AAA_DSL: StrategyDSL = {
  id: 'strat-aaa',
  name: "Adaptive Asset Allocation",
  description: "Momentum + Minimum Variance optimization.",
  logicDescription: "Rebalances monthly based on 6-month momentum scores and inverse volatility weighting. Winners stay winners, but volatility is capped.",
  universe: { mode: "use_portfolio", tickers: [] },
  indicators: [
     { id: "mom_126", type: "LRS", source: "price", window: 126 },
     { id: "vol_60", type: "VOL", source: "price", window: 60 }
  ],
  signals: [],
  allocation: { mode: "dynamic" },
  rebalance: { mode: RebalanceMode.MONTHLY },
  execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
}

export const RSI_MEAN_REVERSION_DSL: StrategyDSL = {
    id: 'strat-rsi-mean-rev',
    name: "RSI Mean Reversion (Sniper)",
    description: "Buys when RSI < 30, Sells when RSI > 70.",
    logicDescription: "Contrarian strategy. Accumulates assets when they are oversold (RSI < 30) and trims positions when they become overbought (RSI > 70).",
    universe: { mode: "use_portfolio", tickers: [] },
    indicators: [{ id: "rsi_14", type: "RSI", source: "price", window: 14 }],
    signals: [
        { id: "buy_signal", condition: { op: "lt", left: { ind: "rsi_14" }, right: { val: 30 } } }
    ],
    allocation: { mode: "target_weights" },
    rebalance: { mode: RebalanceMode.DAILY },
    execution: { signal_evaluation_frequency: Frequency.DAILY, trade_timing: 'close' }
}

export const STRATEGY_LIBRARY: StrategyDSL[] = [
  DCA_BASELINE_DSL,
  SMA_TREND_DSL,
  GOLDEN_CROSS_DSL,
  RSI_MOMENTUM_DSL,
  LRS_ROTATION_DSL,
  NINE_SIG_DSL,
  NUCLEAR_DEFENSIVE_DSL,
  VOL_TARGET_DSL,
  ADAPTIVE_AAA_DSL,
  RSI_MEAN_REVERSION_DSL
];
