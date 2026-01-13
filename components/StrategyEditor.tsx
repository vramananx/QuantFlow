
import React, { useState, useEffect } from 'react';
import { StrategyDSL, RebalanceMode, Frequency, IndicatorDSL, SignalDSL } from '../types.ts';
import { 
  DCA_BASELINE_DSL, 
  SMA_TREND_DSL,
  GOLDEN_CROSS_DSL,
  RSI_MOMENTUM_DSL,
  NINE_SIG_DSL
} from '../constants.tsx';

interface Props {
  strategy: StrategyDSL;
  onChange: (strategy: StrategyDSL) => void;
  darkMode?: boolean;
}

export const StrategyEditor: React.FC<Props> = ({ strategy, onChange, darkMode }) => {
  const [mode, setMode] = useState<'general' | 'params' | 'library' | 'json'>('general');
  const [jsonText, setJsonText] = useState(JSON.stringify(strategy, null, 2));

  // Fix: Removed references to LRS_ROTATION_DSL, NUCLEAR_DEFENSIVE_DSL, and VOL_TARGET_DSL which were not exported from constants.tsx.
  const templates = [
    DCA_BASELINE_DSL, 
    SMA_TREND_DSL,
    GOLDEN_CROSS_DSL,
    RSI_MOMENTUM_DSL,
    NINE_SIG_DSL
  ];

  useEffect(() => {
    setJsonText(JSON.stringify(strategy, null, 2));
  }, [strategy]);

  const updateStrategy = (updates: Partial<StrategyDSL>) => {
    onChange({ ...strategy, ...updates });
  };

  const updateAllocation = (field: string, val: any) => {
    updateStrategy({
      allocation: { ...strategy.allocation, [field]: val }
    });
  };

  const updateMacroWindow = (val: number) => {
     const newAlloc = { ...strategy.allocation, regime_indicator_window: val };
     const newInds = strategy.indicators.map(ind => {
        if (ind.type === 'SMA' && ind.ticker === strategy.allocation.regime_filter_ticker) {
            return { ...ind, window: val };
        }
        return ind;
     });
     onChange({ ...strategy, allocation: newAlloc, indicators: newInds });
  };

  return (
    <div className="space-y-10">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[24px]">
        {['general', 'params', 'library', 'json'].map(m => (
          <button 
            key={m}
            className={`flex-1 py-3 text-[10px] uppercase font-black rounded-[20px] transition-all ${mode === m ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMode(m as any)}
          >
            {m === 'general' ? 'Metadata' : m === 'params' ? 'Logic Node' : m === 'library' ? 'Templates' : 'Schema'}
          </button>
        ))}
      </div>

      {mode === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4">
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Strategy Name</label>
                 <input 
                    type="text" 
                    value={strategy.name} 
                    onChange={e => updateStrategy({ name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] text-base font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Evaluation Interval</label>
                 <select 
                    value={strategy.execution.signal_evaluation_frequency}
                    onChange={e => updateStrategy({ execution: { ...strategy.execution, signal_evaluation_frequency: e.target.value as Frequency }})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] text-sm font-black dark:text-white outline-none"
                 >
                    {Object.values(Frequency).map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                 </select>
              </div>
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Logic Description</label>
              <textarea 
                value={strategy.description} 
                onChange={e => updateStrategy({ description: e.target.value })}
                className="w-full h-[154px] px-6 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[32px] text-sm font-medium leading-relaxed dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 resize-none"
              />
           </div>
        </div>
      )}

      {mode === 'params' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logic Node: Macro Signal Source</label>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[48px] space-y-8">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Regime Filtering Ticker</span>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="e.g. QQQ"
                    value={strategy.allocation.regime_filter_ticker || ''}
                    onChange={(e) => updateAllocation('regime_filter_ticker', e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">SMA Window</span>
                    <span className="text-[11px] font-black text-blue-600">{strategy.allocation.regime_indicator_window || 0} Days</span>
                  </div>
                  <input 
                    type="range" min="10" max="365" step="10"
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                    value={strategy.allocation.regime_indicator_window || 200}
                    onChange={(e) => updateMacroWindow(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logic Node: Target Action</label>
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] shadow-sm space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Safety Asset (Risk-Off)</span>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="e.g. AGG"
                    value={strategy.allocation.risk_off?.[0]?.ticker || ''}
                    onChange={(e) => updateAllocation('risk_off', [{ ticker: e.target.value.toUpperCase(), weight: 1.0 }])}
                  />
                </div>
                 <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed italic">
                       If {strategy.allocation.regime_filter_ticker || 'Holdings'} falls below its {strategy.allocation.regime_indicator_window}d moving average, the engine will rotate entire allocation to {strategy.allocation.risk_off?.[0]?.ticker || 'CASH'}.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 max-h-[500px] overflow-y-auto custom-scrollbar p-1">
          {templates.map(t => (
            <button
              key={t.name}
              onClick={() => onChange({ ...t, id: strategy.id })}
              className={`p-8 text-left border-2 rounded-[48px] transition-all ${strategy.name === t.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-xl' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'}`}
            >
              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{t.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-3">{t.description}</p>
            </button>
          ))}
        </div>
      )}

      {mode === 'json' && (
        <div className="animate-in zoom-in-95 duration-300">
          <textarea
            className="w-full h-96 p-10 bg-slate-950 text-blue-400 font-mono text-[11px] rounded-[56px] border-4 border-slate-900 focus:ring-4 focus:ring-blue-500 outline-none shadow-inner leading-relaxed"
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              try { onChange({ ...JSON.parse(e.target.value), id: strategy.id }); } catch(e){}
            }}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};
