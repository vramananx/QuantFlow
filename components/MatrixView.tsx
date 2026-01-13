
import React, { useState, useMemo } from 'react';
import { BacktestMatrixResponse, MatrixResult, RankingWeights } from '../types.ts';
import { Dendrogram } from './Dendrogram.tsx';

interface Props {
  data: BacktestMatrixResponse;
  onSelect: (result: MatrixResult) => void;
  darkMode?: boolean;
}

export const MatrixView: React.FC<Props> = ({ data, onSelect, darkMode }) => {
  const portfolios: string[] = Array.from(new Set(data.results.map(r => r.portfolioName)));
  const strategies: string[] = Array.from(new Set(data.results.map(r => r.strategyName)));

  const [weights, setWeights] = useState<RankingWeights>({
    cagr: 0.4,
    sharpe: 0.4,
    maxDrawdown: 0.2,
    volatility: 0.0
  });

  const [selectedPortfolioName, setSelectedPortfolioName] = useState<string>(portfolios[0] || '');

  const activeCorrelations = useMemo(() => {
     const res = data.results.find(r => r.portfolioName === selectedPortfolioName);
     return res?.fullResponse.correlations || [];
  }, [selectedPortfolioName, data.results]);

  const tickers = useMemo(() => {
    return Array.from(new Set(activeCorrelations.map(c => c.assetA)));
  }, [activeCorrelations]);

  const getScore = (res: MatrixResult) => {
    const sCAGR = Math.min(res.metrics.cagr / 0.3, 1); 
    const sSharpe = Math.min(res.metrics.sharpe / 3, 1);
    const sDD = Math.max(1 - (res.metrics.max_drawdown / 0.5), 0);
    return (sCAGR * weights.cagr + sSharpe * weights.sharpe + sDD * weights.maxDrawdown) * 100;
  };

  const getHeatColor = (score: number) => {
    if (score > 85) return 'bg-blue-600 text-white shadow-xl scale-105';
    if (score > 70) return 'bg-blue-500 text-white';
    if (score > 55) return 'bg-slate-900 dark:bg-blue-900 text-white';
    if (score > 40) return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    if (score > 25) return 'bg-slate-100 dark:bg-slate-900 text-slate-400';
    return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400';
  };

  return (
    <div className="flex-1 space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end border-b border-slate-50 dark:border-slate-800 pb-10 gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">The Matrix.</h2>
            <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl">Relative performance density for {portfolios.length * strategies.length} backtest permutations.</p>
          </div>
          
          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center">
              <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">CAGR BIAS</span>
                  <input type="range" min="0" max="1" step="0.1" value={weights.cagr} onChange={e => setWeights({...weights, cagr: parseFloat(e.target.value)})} className="block w-32 h-2 bg-blue-200 dark:bg-slate-700 rounded-full appearance-none accent-blue-600" />
              </div>
              <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">SHARPE BIAS</span>
                  <input type="range" min="0" max="1" step="0.1" value={weights.sharpe} onChange={e => setWeights({...weights, sharpe: parseFloat(e.target.value)})} className="block w-32 h-2 bg-blue-200 dark:bg-slate-700 rounded-full appearance-none accent-blue-600" />
              </div>
          </div>
        </div>

        {selectedPortfolioName && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[56px] space-y-8">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Linking Patterns</h3>
               <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
                 <Dendrogram assets={selectedPortfolioName.split('+')} />
               </div>
             </div>

             <div className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[56px] space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Correlation Heatmap</h3>
                  <select 
                    className="px-6 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[9px] font-black uppercase text-slate-900 dark:text-white focus:outline-none"
                    value={selectedPortfolioName}
                    onChange={(e) => setSelectedPortfolioName(e.target.value)}
                  >
                    {portfolios.map(p => <option className="text-slate-900 dark:text-white" key={p} value={p}>{p}</option>)}
                  </select>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner overflow-x-auto custom-scrollbar">
                 <div className="grid" style={{ gridTemplateColumns: `repeat(${tickers.length + 1}, minmax(48px, 1fr))` }}>
                    <div className="p-2"></div>
                    {tickers.map(t => <div key={t} className="p-2 text-center text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">{t}</div>)}
                    {tickers.map((t1, i) => (
                       <React.Fragment key={t1}>
                          <div className="p-2 text-right text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase flex items-center justify-end">{t1}</div>
                          {tickers.map((t2, j) => {
                             const node = activeCorrelations.find(c => (c.assetA === t1 && c.assetB === t2) || (c.assetA === t2 && c.assetB === t1));
                             const val = node?.value || 0;
                             const color = val > 0.8 ? 'bg-emerald-600' : val > 0.6 ? 'bg-emerald-400' : val > 0.4 ? 'bg-emerald-200' : 'bg-slate-300 dark:bg-slate-700';
                             return (
                               <div key={t2} className="p-1">
                                 <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-[9px] font-bold text-white transition-all hover:scale-125 z-10 relative cursor-help ${color}`} title={`${val.toFixed(2)}`}>
                                    {val.toFixed(1)}
                                 </div>
                               </div>
                             );
                          })}
                       </React.Fragment>
                    ))}
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="rounded-[64px] border border-slate-100 dark:border-slate-800 overflow-x-auto shadow-2xl bg-white dark:bg-slate-950 relative custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <th className="p-10 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-left sticky left-0 z-10 bg-inherit">Thematic Basket</th>
              {strategies.map(s => <th key={s} className="p-10 text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tight text-center whitespace-nowrap">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {portfolios.map(p => (
              <tr key={p} className="border-t border-slate-50 dark:border-slate-900 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/30" onClick={() => setSelectedPortfolioName(p)}>
                <td className="p-10 cursor-pointer sticky left-0 z-10 bg-white dark:bg-slate-950">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{p.replace(/\+/g, ' & ')}</div>
                  <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Institutional Model</div>
                </td>
                {strategies.map(s => {
                  const res = data.results.find(r => r.portfolioName === p && r.strategyName === s);
                  if (!res) return <td key={s} className="p-2 text-center text-slate-100 dark:text-slate-800">-</td>;
                  const score = getScore(res);
                  return (
                    <td key={s} className="p-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelect(res); }} 
                        className={`w-full h-32 rounded-[40px] flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 hover:shadow-2xl active:scale-95 group ${getHeatColor(score)}`}
                      >
                        <span className="text-3xl font-black">{score.toFixed(0)}</span>
                        <span className="text-[9px] font-black uppercase opacity-60">Q-SCORE</span>
                        <div className="mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-bold">{(res.metrics.cagr * 100).toFixed(0)}%C</span>
                            <span className="text-[8px] font-bold">{res.metrics.sharpe.toFixed(1)}S</span>
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
