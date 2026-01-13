
export enum Frequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual'
}

export enum RebalanceMode {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  THRESHOLD = 'threshold'
}

export enum MLEngineType {
  RANDOM_FOREST = 'Random Forest (Ensemble)',
  XGBOOST = 'XGBoost (Gradient Boosted)',
  LSTM = 'LSTM (Recurrent Network)',
  LINEAR = 'ElasticNet Regression'
}

export interface AssetWeight {
  ticker: string;
  weight: number;
}

export interface OHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LocalDataset {
  id: string;
  filename: string;
  size: string;
  tickers: string[];
  dateRange: { start: string; end: string };
  status: 'Ready' | 'Indexing' | 'Error';
  data?: Record<string, OHLC[]>; // Actual data map
}

export interface IndicatorDSL {
  id: string;
  type: 'SMA' | 'EMA' | 'RSI' | 'VOL' | 'BB' | 'MACD' | 'VIX_LEVEL' | 'LRS';
  source: 'price' | 'volume' | 'ticker';
  ticker?: string; 
  window: number;
  params?: Record<string, any>;
}

export interface SignalDSL {
  id: string;
  condition: {
    op: 'gt' | 'lt' | 'cross_above' | 'cross_below' | 'and' | 'or';
    left: { ref?: 'price'; ind?: string; val?: number };
    right: { ref?: 'price'; ind?: string; val?: number };
  };
}

export interface StrategyDSL {
  id: string;
  name: string;
  description: string;
  logicDescription?: string; 
  universe: { mode: 'use_portfolio' | 'explicit'; tickers: string[]; };
  indicators: IndicatorDSL[];
  signals: SignalDSL[];
  allocation: { 
    mode: 'target_weights' | 'dynamic'; 
    risk_on?: AssetWeight[]; 
    risk_off?: AssetWeight[]; 
    regime_filter_ticker?: string; 
    regime_indicator_window?: number;
    regime_buffer_pct?: number; 
    use_vix_gate?: boolean;
    vix_threshold?: number;
  };
  rebalance: { mode: RebalanceMode; max_drift?: number; };
  risk?: { 
    max_drawdown_stop?: number; 
    trailing_stop?: number; 
    vol_target?: number; 
    sensitivity_check?: boolean; 
  };
  execution: { 
    signal_evaluation_frequency: Frequency; 
    trade_timing: 'open' | 'close'; 
    reinvest_dividends?: boolean; 
    slippage_bps?: number;
  };
}

export interface MonthlyReturn {
  year: number;
  month: number;
  value: number;
}

export interface FactorAttribution {
  factor: string;
  weight: number;
  contribution: number;
}

export interface FactorRadarPoint {
  subject: string;
  strategy: number;
  benchmark: number;
  fullMark: number;
}

export interface StressTestResult {
  scenario: string;
  return: number;
  benchmark_return: number;
  drawdown: number;
}

export interface MonteCarloPath {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface SentimentData {
  ticker: string;
  score: number;
  label: string;
  headline: string;
}

export interface TradeExecution {
  date: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  price: number;
  shares: number;
  value: number;
  pnl?: number; 
}

export interface CorrelationNode {
  assetA: string;
  assetB: string;
  value: number;
}

export interface AIMemo {
  rating: string;
  summary: string;
  pros: string[];
  cons: string[];
  suggested_adjustments: string[];
}

export interface ContributionConfig {
  amount: number;
  frequency: Frequency;
  day_of_week?: number; // 1 = Mon, 5 = Fri
}

export interface GlobalSimulationConfig {
  rebalance_mode: RebalanceMode;
  reinvest_dividends: boolean;
  trailing_stop_pct: number;
  slippage_bps: number;
  trade_timing: 'open' | 'close';
  use_local_data_priority: boolean;
}

export interface BacktestRequest {
  start_date: string;
  end_date: string;
  initial_capital: number;
  portfolio: AssetWeight[];
  portfolio_name?: string;
  strategy: { mode: 'dsl'; dsl: StrategyDSL };
  wfa?: WalkForwardConfig;
  contribution?: ContributionConfig;
  global_config?: GlobalSimulationConfig;
  local_data?: Record<string, Record<string, number>>; // Date -> Ticker -> Price
}

export interface BenchmarkMetrics {
  cagr: number;
  max_drawdown: number;
  sharpe: number;
  final_value: number;
}

export interface RollingMetric {
  date: string;
  volatility: number;
  beta: number;
}

export interface MonteCarloStats {
  prob_positive: number;
  prob_50_return: number;
  prob_double: number;
  prob_loss_10: number;
  prob_loss_30: number;
  prob_loss_50: number;
}

export interface BacktestResponse {
  metrics: {
    initial_balance: number;
    total_contributions: number;
    final_value: number;
    net_profit: number;
    cumulative_return: number;
    cagr: number;
    is_cagr?: number; 
    oos_cagr?: number;
    
    // Period Returns
    daily_return_avg: number;
    monthly_return_avg: number;
    annual_return_avg: number;
    mtd_return: number;
    three_month_return: number;
    six_month_return: number;
    ytd_return: number;
    one_year_return: number;
    three_year_return: number;
    five_year_return: number;
    ten_year_return: number;

    // Risk
    max_drawdown: number;
    longest_drawdown_days?: number;
    volatility: number;
    sharpe: number;
    sortino: number;
    calmar: number;
    omega?: number;
    ulcer_index?: number;
    upi?: number; 
    serenity_ratio?: number;
    var_95?: number;
    cvar_95?: number;
    recovery_factor?: number;
    risk_of_ruin?: number;
    kelly_criterion?: number;
    
    // Benchmark Comparison
    alpha: number;
    beta: number;
    correlation: number;
    treynor: number;
    information_ratio: number;

    // Period Stats
    best_year: number;
    worst_year: number;
    best_month: number;
    worst_month: number;
    best_day?: number;
    worst_day?: number;
    
    profit_factor?: number;
    expectancy?: number;
    robustness_score?: number;
    overfit_index?: number;
    oos_deviation?: number;
    win_rate?: number;
  };
  benchmark_metrics: BenchmarkMetrics;
  equity_curve: { date: string; value: number; invested: number; is_oos?: boolean }[];
  benchmark_curve: { date: string; value: number }[];
  qqq_curve: { date: string; value: number }[];
  drawdown_curve: { date: string; value: number; pct: number; bench_pct: number; qqq_pct: number }[];
  rolling_metrics: RollingMetric[];
  monthly_returns_heatmap: MonthlyReturn[];
  factors: FactorAttribution[];
  factor_radar: FactorRadarPoint[];
  stress_tests: StressTestResult[];
  monte_carlo: MonteCarloPath[];
  monte_carlo_stats: MonteCarloStats;
  sentiment: SentimentData[];
  trades: TradeExecution[];
  correlations: CorrelationNode[];
  historical_correlations?: { timeframe: string; nodes: CorrelationNode[] }[];
  wfa_status: string;
  meta: { provider: string; strategy_name: string; portfolio_name: string; dsl_used: boolean; used_local_data: boolean };
  ai_memo?: AIMemo;
  explainability?: {
    winning_factors: string[];
    worst_regime: string;
    risk_profile_summary: string;
  };
}

export interface MatrixResult {
  portfolioName: string;
  strategyName: string;
  metrics: BacktestResponse['metrics'];
  fullResponse: BacktestResponse;
}

export interface BacktestMatrixResponse {
  results: MatrixResult[];
  bestResult: MatrixResult;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  category: 'Tech' | 'Conservative' | 'Macro' | 'Sectoral' | 'Custom' | 'Income' | 'High-Growth';
  assets: AssetWeight[];
  description: string;
  riskGrade: 'Low' | 'Medium' | 'High';
}

export interface WalkForwardConfig {
  enabled: boolean;
  anchor_date: string; 
  optimization_type: 'sharpe' | 'cagr' | 'drawdown';
  window_size_years: number;
  engine: MLEngineType;
}

export interface RankingWeights {
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  volatility: number;
}

export interface Order {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: string;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
}
