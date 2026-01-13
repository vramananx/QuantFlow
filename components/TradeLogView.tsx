
import React, { useMemo } from 'react';
import { BacktestResponse } from '../types.ts';

interface Props {
  data: BacktestResponse;
}

export const TradeLogView: React.FC<Props> = ({ data }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  const trades = data.trades;
  const closedTrades = trades.filter(t => t.action === 'SELL' && t.pnl !== undefined);
  
  const stats = useMemo(() => {
    const total = closedTrades.length;
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losses = closedTrades.filter(t => (t.pnl || 0) <= 0);
    const winRate = total > 0 ? wins.length / total : 0;
    const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const avgWin = wins.length ? wins.reduce((acc, t) => acc + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((acc, t) => acc + (t.pnl || 0), 0) / losses.length : 0;
    
    return { total, winRate, totalPnL, avgWin, avgLoss };
  }, [closedTrades]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
       <div className="flex justify-between items-center">
          <header className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Trade Journal.</h2>
            <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">Detailed transaction logs and attribution analysis.</p>
          </header>
          <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             Generate Report
          </button>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Win Rate</span>
             <p className="text-3xl font-black text-blue-500 mt-2">{(stats.winRate * 100).toFixed(1)}%</p>
             <p className="text-xs font-bold text-slate-400 mt-1">{stats.total} Trades</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realized PnL</span>
             <p className={`text-3xl font-black mt-2 ${stats.totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(stats.totalPnL)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Win</span>
             <p className="text-3xl font-black text-emerald-500 mt-2">{formatCurrency(stats.avgWin)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Loss</span>
             <p className="text-3xl font-black text-rose-500 mt-2">{formatCurrency(stats.avgLoss)}</p>
          </div>
       </div>

       {/* Trade Table */}
       <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                   <tr>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticker</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Realized PnL</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {trades.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="p-6 text-sm font-bold text-slate-900 dark:text-white">{t.date}</td>
                         <td className="p-6 text-sm font-black text-blue-500">{t.ticker}</td>
                         <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                               {t.action}
                            </span>
                         </td>
                         <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">{formatCurrency(t.price)}</td>
                         <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">{formatCurrency(t.value)}</td>
                         <td className={`p-6 text-sm font-black ${t.pnl ? (t.pnl > 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-300'}`}>
                            {t.pnl ? formatCurrency(t.pnl) : '-'}
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
