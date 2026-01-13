
import React, { useMemo, useState } from 'react';
import { BacktestResponse } from '../types.ts';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, Line, ComposedChart, BarChart, Bar, ReferenceLine, LineChart
} from 'recharts';

interface Props {
  data: BacktestResponse;
  darkMode?: boolean;
}

export const PerformanceView: React.FC<Props> = ({ data, darkMode }) => {
  const [logScale, setLogScale] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'risk' | 'rolling' | 'montecarlo' | 'glossary'>('summary');

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: val > 999999 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(val);
  };
  const formatNum = (val: number) => val.toFixed(2);

  const getColorForValue = (val: number, inverse = false) => {
      if (inverse) return val > 0 ? 'text-rose-500' : 'text-emerald-500';
      return val >= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  const MetricCard = ({ label, value, sub, color, tooltip }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-105 group relative">
        <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {sub && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sub}</p>}
    </div>
  );

  const comparisonData = useMemo(() => {
     return data.equity_curve.map((p, i) => ({
         date: p.date,
         strategy: p.value,
         invested: p.invested,
         benchmark: data.benchmark_curve[i]?.value || p.value
     }));
  }, [data.equity_curve, data.benchmark_curve]);

  const costBasisData = useMemo(() => {
      return data.equity_curve.map((p, i) => {
          const invested = p.invested;
          const stratROI = invested > 0 ? (p.value - invested) / invested : 0;
          return {
              date: p.date,
              stratROI,
              zero: 0
          };
      });
  }, [data.equity_curve]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div className="space-y-1">
               <h2 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{data.meta.portfolio_name || 'Portfolio Analysis'}</h2>
               <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{data.meta.strategy_name}</span>
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
                <MetricCard label="Final Balance" value={formatCurrency(data.metrics.final_value)} color="text-slate-900 dark:text-white" sub={`+${formatCurrency(data.metrics.net_profit)} Net Profit`} />
                <MetricCard label="Cost Basis" value={formatCurrency(data.metrics.initial_balance + data.metrics.total_contributions)} color="text-blue-600" sub="Total Invested" />
                <MetricCard label="CAGR" value={formatPercent(data.metrics.cagr)} color={getColorForValue(data.metrics.cagr)} sub="Compounded Annual Growth" />
                <MetricCard label="Sharpe Ratio" value={formatNum(data.metrics.sharpe)} color="text-blue-500" sub="Risk Adjusted Return" />
                <MetricCard label="Max Drawdown" value={formatPercent(data.metrics.max_drawdown)} color="text-rose-500" sub="Peak to Trough" />
                <MetricCard label="Daily Win %" value={formatPercent(data.metrics.win_rate || 0)} color="text-emerald-500" sub="Positive Days" />
                <MetricCard label="Sortino" value={formatNum(data.metrics.sortino)} color="text-emerald-500" sub="Downside Risk Adj" />
                <MetricCard label="Alpha" value={formatNum(data.metrics.alpha)} color={getColorForValue(data.metrics.alpha)} sub="Vs Benchmark" />
                <MetricCard label="Volatility" value={formatPercent(data.metrics.volatility)} color="text-slate-400" sub="Annualized Vol" />
                <MetricCard label="Calmar" value={formatNum(data.metrics.calmar)} color="text-blue-400" sub="CAGR / MaxDD" />
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Portfolio Value Growth</h3>
                    <div className="flex gap-4 items-center">
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
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        The dashed line represents the strictly tracked **Cost Basis** (initial $10k + subsequent DCA contributions). Any gap between the blue solid line and the dashed line represents realized and unrealized alpha.
                    </p>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'risk' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
                  <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Strategy ROI over Cost Basis</h3>
                      <div className="flex gap-4">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full"/> <span className="text-[10px] font-black uppercase text-slate-500">ROI %</span></div>
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
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
