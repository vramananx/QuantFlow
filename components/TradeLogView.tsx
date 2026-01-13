
import React, { useMemo } from 'react';
import { BacktestResponse } from '../types.ts';

interface Props {
  data: BacktestResponse;
}

export const TradeLogView: React.FC<Props> = ({ data }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        notation: val > 999999 ? 'compact' : 'standard',
        maximumFractionDigits: 2
    }).format(val);
  };
  
  const trades = data.trades;
  
  const stats = useMemo(() => {
    const totalInflow = data.metrics.initial_balance + data.metrics.total_contributions;
    const growthX = data.metrics.final_value / totalInflow;
    return { totalInflow, growthX };
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  const getActionBadge = (action: string, ticker: string) => {
      if (ticker === 'DCA_INFLOW' || ticker === 'INITIAL_DEPOSIT') {
          return "bg-blue-600/10 text-blue-600 border border-blue-600/20";
      }
      return action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
       <div className="flex justify-between items-center">
          <header className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Trade Journal.</h2>
            <p className="text-xl text-slate-400 dark:text-slate-500 font-medium italic">Tracking cash contributions vs. portfolio realized growth.</p>
          </header>
          <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             Print Audit
          </button>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Invested</span>
             <p className="text-3xl font-black text-blue-500 mt-2">{formatCurrency(stats.totalInflow)}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Cost Basis</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Multiplier</span>
             <p className="text-3xl font-black text-emerald-500 mt-2">{stats.growthX.toFixed(1)}x</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Alpha</span>
             <p className={`text-3xl font-black text-slate-900 dark:text-white mt-2`}>{formatCurrency(data.metrics.net_profit)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ending Capital</span>
             <p className="text-3xl font-black text-blue-600 mt-2">{formatCurrency(data.metrics.final_value)}</p>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar max-h-[800px]">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
                   <tr>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflow Source</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Basis (Σ)</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Portfolio Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {trades.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="p-6 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{t.date}</td>
                         <td className="p-6">
                            <span className="text-sm font-black text-blue-600 dark:text-blue-400 whitespace-nowrap uppercase tracking-tight">{t.ticker.replace(/_/g, ' ')}</span>
                         </td>
                         <td className="p-6">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getActionBadge(t.action, t.ticker)}`}>
                               {t.ticker.includes('DEPOSIT') || t.ticker.includes('INFLOW') ? 'CAPITAL' : t.action}
                            </span>
                         </td>
                         <td className="p-6 text-sm font-bold text-slate-400">
                            {formatCurrency(t.cumulativeInvested || 0)}
                         </td>
                         <td className="p-6 text-right">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(t.portfolioValue || 0)}</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};
