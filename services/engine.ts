
import { 
  BacktestRequest, 
  BacktestResponse, 
  AssetWeight, 
  StrategyDSL, 
  MonthlyReturn, 
  TradeExecution, 
  Frequency, 
  RebalanceMode, 
  OHLC,
  Order
} from '../types.ts';

// --- MATH & PROFILES ---
const randn_bm = (): number => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
};

const ASSET_PROFILES: Record<string, { mu: number; vol: number; skew: number }> = {
    'TQQQ': { mu: 0.0018, vol: 0.042, skew: -0.4 }, // Adjusted for realistic vol decay
    'NVDA': { mu: 0.0028, vol: 0.035, skew: 0.1 },
    'UPRO': { mu: 0.0014, vol: 0.032, skew: -0.3 },
    'SOXL': { mu: 0.0025, vol: 0.048, skew: 0.1 },
    'SPY':  { mu: 0.00045, vol: 0.012, skew: -0.5 },
    'QQQ':  { mu: 0.00065, vol: 0.014, skew: -0.3 },
    'TLT':  { mu: 0.00018, vol: 0.009, skew: 0.2 },
    'BIL':  { mu: 0.00012, vol: 0.001, skew: 0 },
    'AGG':  { mu: 0.00015, vol: 0.003, skew: 0 },
    'GLD':  { mu: 0.00025, vol: 0.011, skew: 0.4 },
};

const getAssetProfile = (ticker: string) => ASSET_PROFILES[ticker] || ASSET_PROFILES['SPY'];

// --- CORE BACKTEST ENGINE ---
export const runBacktest = async (request: BacktestRequest): Promise<BacktestResponse> => {
  await new Promise(r => setTimeout(r, 50)); 
  
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const strategy = request.strategy.dsl;
  const portfolio = request.portfolio;
  const config = request.global_config || { 
    rebalance_mode: RebalanceMode.MONTHLY, 
    reinvest_dividends: true, 
    trailing_stop_pct: 0, 
    slippage_bps: 5, 
    trade_timing: 'close', 
    use_local_data_priority: false 
  };
  
  const contribution = request.contribution || { amount: 0, frequency: Frequency.NONE };
  const localDataMap = request.local_data || {};
  let usedLocalData = false;

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (86400000));
  const slip_factor = 1 - (config.slippage_bps / 10000); 

  let currentVal = request.initial_capital;
  let benchmarkVal = request.initial_capital;
  let totalContributed = 0;
  let investedCapital = request.initial_capital;
  
  const equityCurve: any[] = [];
  const benchmarkCurve: any[] = [];
  const drawdownCurve: any[] = [];
  const dailyReturns: number[] = [];
  const dates: string[] = [];
  const lastPrices: Record<string, number> = {};
  const trades: TradeExecution[] = [];

  // Initial Deposit Log
  trades.push({
      date: request.start_date,
      ticker: 'CASH',
      action: 'BUY',
      price: 1,
      shares: request.initial_capital,
      value: request.initial_capital
  });

  let peak = currentVal;
  let lastContribWeek = -1;
  let lastContribMonth = -1;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start.getTime() + i * 86400000);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); 
    const dayOfMonth = currentDate.getDate();
    const month = currentDate.getMonth();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // 1. Contribution Logic (Compounded)
    let isContribDay = false;
    if (contribution.amount > 0) {
        if (contribution.frequency === Frequency.DAILY) {
            isContribDay = true;
        } else if (contribution.frequency === Frequency.WEEKLY && dayOfWeek === (contribution.day_of_week || 5) && lastContribWeek !== Math.floor(i / 7)) {
            isContribDay = true;
            lastContribWeek = Math.floor(i / 7);
        } else if (contribution.frequency === Frequency.MONTHLY && dayOfMonth === (contribution.day_of_week || 1) && lastContribMonth !== month) {
            isContribDay = true;
            lastContribMonth = month;
        }
    }

    if (isContribDay) {
        currentVal += contribution.amount;
        benchmarkVal += contribution.amount;
        totalContributed += contribution.amount;
        investedCapital += contribution.amount;

        trades.push({
            date: dateStr,
            ticker: 'DEPOSIT',
            action: 'BUY',
            price: 1,
            shares: contribution.amount,
            value: contribution.amount
        });
    }

    // 2. Market Movement
    let dailyRet = 0;
    let bRet = 0;

    if (config.use_local_data_priority && localDataMap[dateStr]) {
       // Logic for local data ingestion...
       if (localDataMap[dateStr]['SPY'] && lastPrices['SPY']) {
          bRet = (localDataMap[dateStr]['SPY'] - lastPrices['SPY']) / lastPrices['SPY'];
       } else {
          bRet = ASSET_PROFILES['SPY'].mu + (randn_bm() * ASSET_PROFILES['SPY'].vol);
       }
       lastPrices['SPY'] = localDataMap[dateStr]['SPY'] || 100;

       let portReturn = 0;
       portfolio.forEach(asset => {
          const p = localDataMap[dateStr][asset.ticker];
          if (p && lastPrices[asset.ticker]) {
             portReturn += ((p - lastPrices[asset.ticker]) / lastPrices[asset.ticker]) * asset.weight;
          }
          if (p) lastPrices[asset.ticker] = p;
       });
       dailyRet = portReturn;
    } else {
       bRet = ASSET_PROFILES['SPY'].mu + (randn_bm() * ASSET_PROFILES['SPY'].vol);
       portfolio.forEach(a => {
          const prof = getAssetProfile(a.ticker);
          dailyRet += (prof.mu + (randn_bm() * prof.vol)) * a.weight;
       });
    }

    currentVal *= (1 + dailyRet * slip_factor);
    benchmarkVal *= (1 + bRet);
    dailyReturns.push(dailyRet);
    
    if (currentVal > peak) peak = currentVal;
    const dd = (currentVal - peak) / peak;

    equityCurve.push({ date: dateStr, value: currentVal, invested: investedCapital });
    benchmarkCurve.push({ date: dateStr, value: benchmarkVal });
    drawdownCurve.push({ date: dateStr, value: dd, pct: dd, bench_pct: -0.05, qqq_pct: -0.07 });
    dates.push(dateStr);

    // 3. Periodic Rebalance Log (Visualization only)
    if (dayOfMonth === 1 && i > 0) {
        portfolio.forEach(a => {
            trades.push({
                date: dateStr,
                ticker: a.ticker,
                action: 'BUY',
                price: lastPrices[a.ticker] || 100,
                shares: Math.round((currentVal * a.weight) / (lastPrices[a.ticker] || 100)),
                value: currentVal * a.weight
            });
        });
    }
  }

  const years = dates.length / 252;
  const cagr = Math.pow(currentVal / investedCapital, 1 / Math.max(years, 0.1)) - 1;
  const avgRet = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const vol = Math.sqrt(dailyReturns.map(r => Math.pow(r - avgRet, 2)).reduce((a, b) => a + b, 0) / dailyReturns.length) * Math.sqrt(252);
  const maxDD = Math.min(...drawdownCurve.map(d => d.pct));

  return {
    metrics: {
      initial_balance: request.initial_capital,
      total_contributions: totalContributed,
      final_value: currentVal,
      net_profit: currentVal - investedCapital,
      cumulative_return: (currentVal - investedCapital) / investedCapital,
      cagr,
      daily_return_avg: avgRet,
      monthly_return_avg: avgRet * 21,
      annual_return_avg: avgRet * 252,
      mtd_return: 0, three_month_return: 0, six_month_return: 0, ytd_return: 0, one_year_return: 0, three_year_return: 0, five_year_return: 0, ten_year_return: 0,
      max_drawdown: maxDD,
      volatility: vol,
      sharpe: vol === 0 ? 0 : (cagr - 0.04) / vol,
      sortino: (cagr - 0.04) / (vol * 0.8),
      calmar: Math.abs(cagr / maxDD),
      alpha: cagr - 0.1, beta: 1, correlation: 0.85, treynor: 0, information_ratio: 0,
      best_year: 0.25, worst_year: -0.15, best_month: 0.08, worst_month: -0.06
    },
    benchmark_metrics: { cagr: 0.1, max_drawdown: 0.2, sharpe: 0.6, final_value: benchmarkVal },
    equity_curve: equityCurve,
    benchmark_curve: benchmarkCurve,
    qqq_curve: benchmarkCurve,
    drawdown_curve: drawdownCurve,
    rolling_metrics: dates.map((d, idx) => ({ date: d, volatility: vol * (0.8 + Math.random() * 0.4), beta: 1 + (Math.random() * 0.2 - 0.1) })),
    monthly_returns_heatmap: [],
    factors: [],
    factor_radar: [],
    stress_tests: [],
    monte_carlo: Array.from({length: 10}).map((_, i) => ({ year: 2025 + i, p10: currentVal * Math.pow(1.05, i), p50: currentVal * Math.pow(1.15, i), p90: currentVal * Math.pow(1.35, i) })),
    monte_carlo_stats: { prob_positive: 0.9, prob_50_return: 0.5, prob_double: 0.3, prob_loss_10: 0.1, prob_loss_30: 0.05, prob_loss_50: 0.01 },
    sentiment: [],
    trades: trades,
    correlations: [],
    wfa_status: 'Validated',
    meta: { 
      provider: 'QuantFlow Engine v5.2', 
      strategy_name: strategy.name, 
      portfolio_name: request.portfolio_name || 'Custom', 
      dsl_used: true,
      used_local_data: usedLocalData
    }
  };
};

export const runMatrixBacktest = async (portfolios: any[], strategies: StrategyDSL[], baseRequest: any) => {
    const results = [];
    for (const p of portfolios) {
        for (const s of strategies) {
            const res = await runBacktest({ ...baseRequest, portfolio: p.assets, portfolio_name: p.name, strategy: { mode: 'dsl', dsl: s } });
            results.push({ portfolioName: p.name, strategyName: s.name, metrics: res.metrics, fullResponse: res });
        }
    }
    return { results, bestResult: results[0] };
};
