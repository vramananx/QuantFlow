
import React, { useMemo, useState } from 'react';
import { BacktestResponse } from '../types.ts';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Legend, Cell, Line, ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, ReferenceLine, LineChart
} from 'recharts';

interface Props {
  data: BacktestResponse;
  darkMode?: boolean;
}

export const PerformanceView: React.FC<Props> = ({ data, darkMode }) => {
  const [logScale, setLogScale] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'risk' | 'rolling' | 'montecarlo' | 'glossary'>('summary');

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNum = (val: number) => val.toFixed(2);

  const getColorForValue = (val: number, inverse = false) => {
      if (inverse) return val > 0 ? 'text-rose-500' : 'text-emerald-500';
      return val >= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  const MetricCard = ({ label, value, sub, color, tooltip }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-105 group relative">
        <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            {tooltip && (
                <div className="relative group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-slate-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="absolute bottom-full right-0 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 mb-2">
                        {tooltip}
                    </div>
                </div>
            )}
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {sub && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sub}</p>}
    </div>
  );

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = (Array.from(new Set(data.monthly_returns_heatmap.map(m => m.year))) as number[]).sort((a, b) => b - a);
  
  const annualReturns = useMemo(() => {
      return years.map(y => {
          const ret = data.monthly_returns_heatmap.filter(m => m.year === y).reduce((acc, m) => acc + m.value, 0);
          return { year: y, return: ret };
      }).sort((a,b) => a.year - b.year);
  }, [data.monthly_returns_heatmap, years]);

  const comparisonData = useMemo(() => {
     return data.equity_curve.map((p, i) => ({
         date: p.date,
         strategy: p.value,
         invested: p.invested,
         benchmark: data.benchmark_curve[i]?.value || p.value
     }));
  }, [data.equity_curve, data.benchmark_curve]);

  const costBasisData = useMemo(() => {
      const safeQQQ = data.qqq_curve || [];
      const safeBench = data.benchmark_curve || [];

      return data.equity_curve.map((p, i) => {
          const invested = p.invested;
          const stratROI = invested > 0 ? (p.value - invested) / invested : 0;
          const spyROI = invested > 0 && safeBench[i] ? (safeBench[i].value - invested) / invested : 0;
          const qqqROI = invested > 0 && safeQQQ[i] ? (safeQQQ[i].value - invested) / invested : 0;
          return {
              date: p.date,
              stratROI,
              spyROI,
              qqqROI,
              zero: 0
          };
      });
  }, [data.equity_curve, data.benchmark_curve, data.qqq_curve]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
               <h2 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{data.meta.portfolio_name || 'Portfolio Analysis'}</h2>
               <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{data.meta.strategy_name}</span>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Simulation</span>
                  </div>
               </div>
           </div>
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px]">
               {['summary', 'risk', 'rolling', 'montecarlo', 'glossary'].map(t => (
                   <button 
                      key={t}
                      onClick={() => setActiveTab(t as any)}
                      className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                   >
                       {t}
                   </button>
               ))}
           </div>
        </div>
      </header>

      {activeTab === 'summary' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <MetricCard label="Final Balance" value={formatCurrency(data.metrics.final_value)} color="text-slate-900 dark:text-white" sub={`+${formatCurrency(data.metrics.net_profit)} Net`} />
                <MetricCard label="CAGR" value={formatPercent(data.metrics.cagr)} color={getColorForValue(data.metrics.cagr)} sub="Compound Annual Growth" />
                <MetricCard label="Sharpe Ratio" value={formatNum(data.metrics.sharpe)} color="text-blue-500" sub="Risk Adjusted Return" tooltip="Excess return per unit of deviation." />
                <MetricCard label="Max Drawdown" value={formatPercent(data.metrics.max_drawdown)} color="text-rose-500" sub="Peak to Trough" />
                <MetricCard label="Sortino" value={formatNum(data.metrics.sortino)} color="text-emerald-500" sub="Downside Risk Adj" />
                <MetricCard label="Serenity Ratio" value={formatNum(data.metrics.serenity_ratio || 0)} color="text-purple-500" sub="Advanced Risk/Reward" tooltip="Penalizes volatility and ulcer index." />
                <MetricCard label="Ulcer Index" value={formatNum(data.metrics.ulcer_index || 0)} color="text-slate-500" sub="Pain Duration & Depth" />
                <MetricCard label="Recovery Factor" value={formatNum(data.metrics.recovery_factor || 0)} color="text-blue-400" sub="Net Profit / Max DD" />
                <MetricCard label="Alpha" value={formatNum(data.metrics.alpha)} color={getColorForValue(data.metrics.alpha)} sub="Vs Benchmark" />
                <MetricCard label="Win Rate" value={formatPercent(data.metrics.win_rate || 0)} color="text-emerald-500" sub="Daily Positive %" />
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Portfolio Value Growth</h3>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-black uppercase text-slate-500">Strategy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
                            <span className="text-[10px] font-black uppercase text-slate-500">Invested Capital</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full" onClick={() => setLogScale(!logScale)}>
                            <div className={`w-3 h-3 rounded-full transition-all ${logScale ? 'bg-blue-600' : 'bg-slate-400'}`} />
                            <span className="text-[10px] font-black uppercase text-slate-500">Log Scale</span>
                        </div>
                    </div>
                </div>
                <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={comparisonData}>
                            <defs>
                                <linearGradient id="colorStrat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['auto', 'auto']} scale={logScale ? 'log' : 'auto'} />
                            <Tooltip contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff'}} formatter={(val: number) => formatCurrency(val)} />
                            
                            <Area type="step" dataKey="invested" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                            <Area type="monotone" dataKey="strategy" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStrat)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Annual Returns</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={annualReturns} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="year" type="category" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} width={40} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} formatter={(val: number) => formatPercent(val)} />
                                <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                                    {annualReturns.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Monthly Heatmap</h3>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-separate border-spacing-1">
                            <thead>
                                <tr>
                                    <th className="text-[9px] text-slate-400">Year</th>
                                    {monthNames.map(m => <th key={m} className="text-[9px] text-slate-400 uppercase">{m}</th>)}
                                    <th className="text-[9px] text-slate-900 dark:text-white uppercase">YTD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {years.map(year => {
                                    const yearReturns = data.monthly_returns_heatmap.filter(m => m.year === year);
                                    const annualSum = yearReturns.reduce((acc, r) => acc + r.value, 0);
                                    return (
                                        <tr key={year}>
                                            <td className="text-[10px] font-black text-slate-500">{year}</td>
                                            {monthNames.map((_, i) => {
                                                const val = yearReturns.find(m => m.month === i)?.value || 0;
                                                const color = val > 0 ? `rgba(16, 185, 129, ${Math.min(Math.abs(val)*15, 1)})` : `rgba(244, 63, 94, ${Math.min(Math.abs(val)*15, 1)})`;
                                                return (
                                                    <td key={i} className="p-2 rounded-lg text-[9px] font-bold text-center text-slate-700 dark:text-slate-200" style={{backgroundColor: val !== 0 ? color : 'transparent'}}>
                                                        {val !== 0 ? (val * 100).toFixed(0) : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td className={`text-[10px] font-black text-center ${annualSum > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{(annualSum*100).toFixed(0)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'risk' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <div className="flex justify-between items-end">
                      <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Profit Buffer Analysis</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Return on Invested Capital (Breakeven = 0%)</p>
                      </div>
                      <div className="flex gap-4">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full"/> <span className="text-[10px] font-black uppercase text-slate-500">Strategy</span></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"/> <span className="text-[10px] font-black uppercase text-slate-500">QQQ</span></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-400 rounded-full"/> <span className="text-[10px] font-black uppercase text-slate-500">SPY</span></div>
                      </div>
                  </div>
                  <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={costBasisData}>
                              <defs>
                                  <linearGradient id="profitZone" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.1}/>
                                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff'}} formatter={(val: number) => formatPercent(val)} labelFormatter={() => ''} />
                              <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
                              <Area type="monotone" dataKey="stratROI" stroke="#2563eb" strokeWidth={3} fill="url(#profitZone)" />
                              <Line type="monotone" dataKey="qqqROI" stroke="#a855f7" strokeWidth={2} dot={false} strokeOpacity={0.7} />
                              <Line type="monotone" dataKey="spyROI" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Drawdown from Peak</h3>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data.drawdown_curve}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                                  <XAxis dataKey="date" hide />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{borderRadius: '12px'}} formatter={(val: number) => formatPercent(val)} />
                                  <ReferenceLine y={-0.20} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'right', value: '-20%', fontSize: 10 }} />
                                  <ReferenceLine y={-0.50} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '-50%', fontSize: 10 }} />
                                  <Line type="monotone" dataKey="bench_pct" stroke="#94a3b8" dot={false} strokeWidth={1} strokeDasharray="4 4" />
                                  <Area type="step" dataKey="pct" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                          <MetricCard label="Value at Risk (95%)" value={formatPercent(data.metrics.var_95 || 0)} color="text-rose-600" sub="Daily Potential Loss" />
                          <MetricCard label="CVaR (Expected Shortfall)" value={formatPercent(data.metrics.cvar_95 || 0)} color="text-rose-800" sub="Tail Risk Avg" />
                          <MetricCard label="Kelly Criterion" value={formatPercent(data.metrics.kelly_criterion || 0)} color="text-blue-500" sub="Optimal Bet Size" />
                          <MetricCard label="Risk of Ruin" value={`${(data.metrics.risk_of_ruin || 0).toFixed(2)}%`} color="text-emerald-500" sub="Prob of 50% Loss" />
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'rolling' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rolling Volatility (30-Day)</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.rolling_metrics}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                              <XAxis dataKey="date" hide />
                              <YAxis hide />
                              <Tooltip contentStyle={{borderRadius: '12px'}} />
                              <Area type="monotone" dataKey="volatility" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rolling Beta (Vs SPY)</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.rolling_metrics}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                              <XAxis dataKey="date" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{borderRadius: '12px'}} />
                              <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" />
                              <Line type="monotone" dataKey="beta" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'montecarlo' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Monte Carlo Simulation (10 Yr)</h3>
                      <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={data.monte_carlo}>
                                  <XAxis dataKey="year" stroke="#94a3b8" />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{borderRadius: '12px'}} formatter={(val: number) => formatCurrency(val)} />
                                  <Area type="monotone" dataKey="p90" stroke="none" fill="#3b82f6" fillOpacity={0.1} />
                                  <Area type="monotone" dataKey="p10" stroke="none" fill="#3b82f6" fillOpacity={0.1} />
                                  <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={4} dot={false} />
                              </ComposedChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="bg-slate-900 dark:bg-black p-12 rounded-[56px] shadow-xl border border-slate-800 space-y-8">
                      <h3 className="text-2xl font-black text-white">Probability Analysis</h3>
                      <div className="space-y-6">
                          {[
                              { label: 'Positive Return', prob: data.monte_carlo_stats.prob_positive, color: 'bg-emerald-500' },
                              { label: '> 50% Return', prob: data.monte_carlo_stats.prob_50_return, color: 'bg-blue-500' },
                              { label: 'Double Capital', prob: data.monte_carlo_stats.prob_double, color: 'bg-purple-500' },
                              { label: '< 10% Loss', prob: data.monte_carlo_stats.prob_loss_10, color: 'bg-amber-500' },
                              { label: '< 30% Loss (Ruin)', prob: data.monte_carlo_stats.prob_loss_30, color: 'bg-rose-500' }
                          ].map((item, i) => (
                              <div key={i} className="space-y-2">
                                  <div className="flex justify-between text-sm font-bold text-slate-400">
                                      <span>{item.label}</span>
                                      <span className="text-white">{formatPercent(item.prob)}</span>
                                  </div>
                                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${item.color}`} style={{ width: `${item.prob * 100}%` }}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'glossary' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Metric Definitions & Formulas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                          <div>
                              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Sharpe Ratio</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">(Rp - Rf) / σp</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Measures excess return per unit of total risk (volatility).</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Sortino Ratio</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">(Rp - Rf) / σd</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Only penalizes downside volatility. Useful for high-growth strategies.</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Calmar Ratio</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">CAGR / Max Drawdown</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Omega Ratio</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">Σ(Returns &gt; 0) / |Σ(Returns &lt; 0)|</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Probability-weighted ratio of gains vs losses.</p>
                          </div>
                      </div>
                      <div className="space-y-6">
                          <div>
                              <h4 className="text-sm font-black text-purple-600 uppercase tracking-widest">Ulcer Index</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">sqrt(mean(drawdowns^2))</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-purple-600 uppercase tracking-widest">Serenity Ratio</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">(CAGR - Rf) / (Ulcer * Volatility)</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest">Value at Risk (VaR 95%)</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Max loss expected over a day with 95% confidence.</p>
                          </div>
                          <div>
                              <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest">Kelly Criterion</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg inline-block">W - (1-W)/R</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
