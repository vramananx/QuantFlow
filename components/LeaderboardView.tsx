import React, { useState, useMemo } from 'react';
import { BacktestMatrixResponse, MatrixResult, RankingWeights } from '../types.ts';

interface Props {
  data: BacktestMatrixResponse;
  onSelect: (result: MatrixResult) => void;
}

export const LeaderboardView: React.FC<Props> = ({ data, onSelect }) => {
  const [weights, setWeights] = useState<RankingWeights>({
    cagr: 0.4,
    sharpe: 0.4,
    maxDrawdown: 0.2,
    volatility: 0.0
  });

  // Calculate composite scores for all results
  const rankedResults = useMemo(() => {
    return [...data.results].map(res => {
      // Normalization logic
      const sCAGR = Math.min(res.metrics.cagr / 0.3, 1); 
      const sSharpe = Math.min(res.metrics.sharpe / 3, 1);
      const sDD = Math.max(1 - (res.metrics.max_drawdown / 0.5), 0);
      const score = (sCAGR * weights.cagr + sSharpe * weights.sharpe + sDD * weights.maxDrawdown) * 100;
      
      return { ...res, score };
    }).sort((a, b) => b.score - a.score);
  }, [data.results, weights]);

  return (
    <div className="flex-1 p-12 space-y-12 overflow-y-auto bg-white custom-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Performance Leaderboard.</h2>
          <p className="text-xl text-slate-400 font-medium max-w-xl">The global ranking of all simulated combinations, weighted by your priority parameters.</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex gap-8 items-center">
            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weighting Bias</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500">CAGR</span>
                    <input type="range" min="0" max="1" step="0.1" value={weights.cagr} onChange={e => setWeights({...weights, cagr: parseFloat(e.target.value)})} className="w-16 h-1 bg-blue-200 rounded-full appearance-none accent-blue-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500">Risk</span>
                    <input type="range" min="0" max="1" step="0.1" value={weights.maxDrawdown} onChange={e => setWeights({...weights, maxDrawdown: parseFloat(e.target.value)})} className="w-16 h-1 bg-blue-200 rounded-full appearance-none accent-blue-600" />
                  </div>
                </div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase block">Total Population</span>
              <span className="text-lg font-black text-slate-800">{rankedResults.length} Runs</span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {rankedResults.map((res, index) => (
          <div 
            key={`${res.portfolioName}-${res.strategyName}`}
            onClick={() => onSelect(res)}
            className="group relative p-1 bg-white border border-slate-100 rounded-[40px] hover:border-blue-200 hover:shadow-2xl transition-all cursor-pointer flex items-center overflow-hidden"
          >
            {/* Rank Badge */}
            <div className={`w-24 h-24 rounded-[36px] flex flex-col items-center justify-center transition-all ${index === 0 ? 'bg-blue-600 text-white' : index < 3 ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Rank</span>
              <span className="text-4xl font-black">#{index + 1}</span>
            </div>

            <div className="flex-1 px-10 grid grid-cols-4 gap-8">
              <div className="col-span-1 space-y-1">
                <h4 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{res.portfolioName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{res.strategyName}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Profile</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-800">{(res.metrics.cagr * 100).toFixed(1)}%</span>
                  <span className="text-[10px] font-bold text-emerald-500">CAGR</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Adjusted</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-800">{res.metrics.sharpe.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-blue-500">SHARPE</span>
                </div>
              </div>

              <div className="flex flex-col justify-center items-end pr-8">
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-300 uppercase block tracking-[0.2em] mb-1">Composite Q-Score</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${res.score}%` }}></div>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{res.score.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Action */}
            <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};