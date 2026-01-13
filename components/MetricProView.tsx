
import React, { useState } from 'react';
import { BacktestMatrixResponse, MatrixResult } from '../types.ts';

interface Props {
  data: BacktestMatrixResponse;
  onSelect: (result: MatrixResult) => void;
}

export const MetricProView: React.FC<Props> = ({ data, onSelect }) => {
  const [sortField, setSortField] = useState<keyof MatrixResult['metrics']>('sharpe');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedResults = [...data.results].sort((a, b) => {
    const aVal = a.metrics[sortField] || 0;
    const bVal = b.metrics[sortField] || 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (field: keyof MatrixResult['metrics']) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const formatNum = (val: number) => val.toFixed(2);
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getCellColor = (val: number, field: keyof MatrixResult['metrics']) => {
    if (field === 'cagr') {
        return val > 0.20 ? 'text-emerald-500' : val > 0 ? 'text-emerald-400' : 'text-rose-500';
    }
    if (field === 'max_drawdown') {
      return val > 0.25 ? 'text-rose-500' : 'text-emerald-500';
    }
    if (field === 'sharpe' || field === 'sortino' || field === 'calmar') {
      return val > 1.5 ? 'text-emerald-500' : val < 0.8 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300';
    }
    return '';
  };

  const headers = [
    { id: 'initial_balance', label: 'Invested', tip: 'Total Capital (Initial + Contributions).' },
    { id: 'final_value', label: 'Final Val', tip: 'Ending Portfolio Value.' },
    { id: 'cagr', label: 'CAGR', tip: 'Compound Annual Growth Rate. Geometric average return.' },
    { id: 'sharpe', label: 'Sharpe', tip: 'Excess return per unit of total volatility.' },
    { id: 'sortino', label: 'Sortino', tip: 'Excess return per unit of downside risk.' },
    { id: 'max_drawdown', label: 'Max DD', tip: 'Maximum peak-to-trough decline.' },
    { id: 'volatility', label: 'Volatility', tip: 'Annualized standard deviation of returns.' },
    { id: 'robustness_score', label: 'Robust', tip: 'Proprietary score measuring resistance to overfitting.' },
    { id: 'ulcer_index', label: 'Ulcer', tip: 'Measure of depth and duration of drawdowns.' },
    { id: 'alpha', label: 'Alpha', tip: 'Excess return over benchmark adjusted for beta.' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
      <header className="space-y-4">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Metric Pro Analytics.</h2>
        <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">Full strategy cross-comparison in a deterministic Parquet-powered grid.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">Portfolio / Strategy</th>
                {headers.map(col => (
                  <th 
                    key={col.id} 
                    className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group relative whitespace-nowrap"
                    onClick={() => toggleSort(col.id as any)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortField === col.id && (<span>{sortOrder === 'desc' ? '↓' : '↑'}</span>)}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                        {col.tip}
                    </div>
                  </th>
                ))}
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((res, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-6 sticky left-0 bg-white dark:bg-slate-900 z-10 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-r border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white leading-tight whitespace-nowrap">{res.portfolioName}</span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{res.strategyName}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-500 dark:text-slate-400">{formatCurrency(res.metrics.initial_balance + res.metrics.total_contributions)}</td>
                  <td className="p-6 text-sm font-black text-slate-900 dark:text-white">{formatCurrency(res.metrics.final_value)}</td>
                  <td className={`p-6 text-sm font-black ${getCellColor(res.metrics.cagr, 'cagr')}`}>{formatPercent(res.metrics.cagr)}</td>
                  <td className={`p-6 text-sm font-black ${getCellColor(res.metrics.sharpe, 'sharpe')}`}>{formatNum(res.metrics.sharpe)}</td>
                  <td className={`p-6 text-sm font-black ${getCellColor(res.metrics.sortino, 'sortino')}`}>{formatNum(res.metrics.sortino)}</td>
                  <td className={`p-6 text-sm font-black ${getCellColor(res.metrics.max_drawdown, 'max_drawdown')}`}>{formatPercent(res.metrics.max_drawdown)}</td>
                  <td className="p-6 text-sm font-black text-slate-500 dark:text-slate-400">{formatPercent(res.metrics.volatility)}</td>
                  <td className="p-6 text-sm font-black text-emerald-500">{(res.metrics.robustness_score || 0).toFixed(0)}</td>
                  <td className="p-6 text-sm font-black text-slate-500">{formatNum(res.metrics.ulcer_index || 0)}</td>
                  <td className={`p-6 text-sm font-black ${(res.metrics.alpha || 0) > 0 ? 'text-blue-500' : 'text-slate-500'}`}>{formatNum(res.metrics.alpha || 0)}</td>
                  
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => onSelect(res)}
                      className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 ml-auto"
                    >
                      Drilldown
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
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
