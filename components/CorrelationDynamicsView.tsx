
import React, { useState, useMemo } from 'react';
import { CorrelationNode, PortfolioTemplate } from '../types.ts';

interface Props {
  portfolios: PortfolioTemplate[];
  historicalData: { timeframe: string; nodes: CorrelationNode[] }[];
}

export const CorrelationDynamicsView: React.FC<Props> = ({ portfolios, historicalData }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolios[0]?.id || '');

  const activeNodes = useMemo(() => {
    // In a real production app, historicalData would be keyed by portfolio ID too.
    // For this simulation, we use the global historicalData provided by the engine.
    return historicalData.find(h => h.timeframe === selectedTimeframe)?.nodes || [];
  }, [selectedTimeframe, historicalData]);

  const assets = useMemo(() => {
    const portfolio = portfolios.find(p => p.id === selectedPortfolioId);
    return portfolio ? portfolio.assets.map(a => a.ticker) : [];
  }, [selectedPortfolioId, portfolios]);

  const getHeatColor = (val: number) => {
    const absVal = Math.abs(val);
    if (val > 0.8) return 'bg-rose-600 text-white';
    if (val > 0.6) return 'bg-rose-500 text-white';
    if (val > 0.4) return 'bg-amber-400 text-slate-900';
    if (val > 0.2) return 'bg-emerald-300 text-slate-900';
    if (val > 0) return 'bg-emerald-500 text-white';
    return 'bg-slate-200 dark:bg-slate-800 text-slate-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Correlation Dynamics.</h2>
          <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">Visualize systemic risk and diversification decay over historical horizons.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-800">
          {['1Y', '3Y', '5Y', 'Max'].map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedTimeframe === tf ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl scale-105 z-10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Universe</h3>
              <div className="space-y-2">
                {portfolios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPortfolioId(p.id)}
                    className={`w-full p-4 rounded-2xl text-left text-[11px] font-black uppercase transition-all border ${selectedPortfolioId === p.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-blue-400'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
           </div>

           <div className="p-8 bg-slate-900 dark:bg-black rounded-[48px] shadow-2xl border border-slate-800 space-y-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Risk Insight</span>
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                "Modern Portfolio Theory fails when correlations jump to 1.0. Check the 1Y timeframe to see if your 'diversified' assets are actually moving in lockstep."
              </p>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
           <div className="overflow-x-auto custom-scrollbar">
              <div className="inline-block min-w-full">
                 <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${assets.length + 1}, minmax(80px, 1fr))` }}>
                    <div className="p-4"></div>
                    {assets.map(a => <div key={a} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{a}</div>)}
                    
                    {assets.map((a1, i) => (
                      <React.Fragment key={a1}>
                        <div className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end">{a1}</div>
                        {assets.map((a2, j) => {
                          const node = activeNodes.find(n => (n.assetA === a1 && n.assetB === a2) || (n.assetA === a2 && n.assetB === a1));
                          const val = i === j ? 1.0 : (node?.value || 0);
                          return (
                            <div key={a2} className="p-1">
                              <div className={`aspect-square w-full rounded-2xl flex flex-col items-center justify-center text-xs font-black shadow-inner transition-transform hover:scale-110 cursor-help ${getHeatColor(val)}`} title={`${a1} vs ${a2}: ${val.toFixed(2)}`}>
                                <span>{val.toFixed(2)}</span>
                                {i === j && <span className="text-[8px] opacity-60">SELF</span>}
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="mt-12 flex flex-wrap justify-center gap-10 border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/20"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uncorrelated (Target)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-lg bg-amber-400"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moderate</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-lg bg-rose-600 shadow-lg shadow-rose-600/20"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High (Systemic Risk)</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
