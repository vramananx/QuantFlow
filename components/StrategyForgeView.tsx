
import React from 'react';
import { StrategyDSL } from '../types.ts';
import { StrategyEditor } from './StrategyEditor.tsx';
import { DCA_BASELINE_DSL } from '../constants.tsx';

interface Props {
  strategies: StrategyDSL[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  setStrategies: (strats: StrategyDSL[]) => void;
}

export const StrategyForgeView: React.FC<Props> = ({ strategies, selectedId, setSelectedId, setStrategies }) => {
  const activeStrategy = strategies.find(s => s.id === selectedId);

  const updateStrategy = (updated: StrategyDSL) => {
    setStrategies(strategies.map(s => s.id === updated.id ? updated : s));
  };

  const handleCreateNew = () => {
    const newId = `strat-new-${Date.now()}`;
    const newStrat: StrategyDSL = {
       ...DCA_BASELINE_DSL,
       id: newId,
       name: "Draft Quantitative Model",
       description: "Custom logic node designed in Strategy Forge."
    };
    setStrategies([...strategies, newStrat]);
    setSelectedId(newId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500 pb-32">
      <header className="flex justify-between items-end">
        <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Strategy Forge.</h2>
            <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">Build, tune, and persist your proprietary quantitative logic nodes.</p>
        </div>
        <button 
           onClick={handleCreateNew}
           className="px-10 py-5 bg-blue-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
        >
           + New Custom Strategy
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Draft Library</label>
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {strategies.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full p-8 rounded-[40px] text-left transition-all border-2 ${selectedId === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-blue-400'}`}
              >
                <h4 className="font-black text-base tracking-tight leading-tight">{s.name}</h4>
                <div className="flex gap-2 mt-4">
                   <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${selectedId === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {s.allocation.regime_filter_ticker ? 'Macro Gated' : 'Unbounded'}
                   </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Main Canvas */}
        <div className="lg:col-span-3 space-y-12">
          {activeStrategy ? (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
               {/* Visual Schema Summary */}
               <div className="bg-slate-900 dark:bg-black p-12 rounded-[64px] shadow-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                  <div className="relative z-10">
                      <div className="flex justify-between items-center mb-12">
                        <h3 className="text-2xl font-black text-white tracking-tight">Active Strategy Schema</h3>
                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Logic: Reactive</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                          <div className="w-44 h-36 bg-slate-800 rounded-[32px] border border-slate-700 flex flex-col items-center justify-center gap-2 shadow-xl">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Input</span>
                             <span className="text-sm font-black text-white">{activeStrategy.allocation.regime_filter_ticker || "Portfolio"}</span>
                          </div>
                          <div className="w-1 md:w-16 h-8 md:h-1 bg-slate-700"></div>
                          <div className="w-44 h-36 bg-slate-800 rounded-[32px] border border-slate-700 flex flex-col items-center justify-center gap-2 shadow-xl">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Logic Gate</span>
                             <span className="text-sm font-black text-emerald-400">{activeStrategy.indicators[0]?.type || "Direct"}</span>
                          </div>
                          <div className="w-1 md:w-16 h-8 md:h-1 bg-slate-700"></div>
                          <div className="w-44 h-36 bg-slate-800 rounded-[32px] border border-slate-700 flex flex-col items-center justify-center gap-2 shadow-xl">
                             <span className="text-[10px] font-black text-slate-500 uppercase">Action</span>
                             <span className="text-sm font-black text-purple-400">{activeStrategy.allocation.risk_off?.[0]?.ticker || "Static Allocation"}</span>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Full Editor Controls */}
               <div className="bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configuration Console</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-widest">Compiler Ready</span>
                    </div>
                  </div>
                  <StrategyEditor strategy={activeStrategy} onChange={updateStrategy} />
               </div>
            </div>
          ) : (
            <div className="h-96 bg-slate-50 dark:bg-slate-900/50 rounded-[64px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-lg font-bold">
               Select a strategy node to start forge editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
