
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PerformanceView } from './components/PerformanceView.tsx';
import { WalkForwardView } from './components/WalkForwardView.tsx';
import { MatrixView } from './components/MatrixView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { PortfolioBuilder } from './components/PortfolioBuilder.tsx';
import { MetricProView } from './components/MetricProView.tsx';
import { CorrelationDynamicsView } from './components/CorrelationDynamicsView.tsx';
import { StrategyForgeView } from './components/StrategyForgeView.tsx';
import { TradeLogView } from './components/TradeLogView.tsx';
import { DataSettingsView } from './components/DataSettingsView.tsx';
import { BrokerageView } from './components/BrokerageView.tsx';
import { LiveAnalyst } from './components/LiveAnalyst.tsx';
import { Frequency, AssetWeight, StrategyDSL, BacktestResponse, BacktestMatrixResponse, WalkForwardConfig, MLEngineType, PortfolioTemplate, ContributionConfig, RebalanceMode, GlobalSimulationConfig } from './types.ts';
import { 
  PORTFOLIO_LIBRARY as INITIAL_PORTFOLIOS, 
  STRATEGY_LIBRARY as INITIAL_STRATEGIES,
} from './constants.tsx';
import { runMatrixBacktest } from './services/engine.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Setup' | 'StrategyForge' | 'MetricPro' | 'Correlations' | 'Leaderboard' | 'Matrix' | 'Performance' | 'TradeLog' | 'Audit' | 'DataSettings' | 'Brokerage'>('Setup');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [matrixResults, setMatrixResults] = useState<BacktestMatrixResponse | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // --- Data & Live State ---
  const [localData, setLocalData] = useState<Record<string, Record<string, number>>>({});
  const [localDataActive, setLocalDataActive] = useState(false);
  const [isPaperTradeMode, setIsPaperTradeMode] = useState(false);

  // --- Global Simulation Configuration ---
  const [capital, setCapital] = useState(10000);
  const [startDate, setStartDate] = useState('2010-02-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  // Cashflow
  const [contribAmount, setContribAmount] = useState(1000);
  const [contribFreq, setContribFreq] = useState<Frequency>(Frequency.MONTHLY);
  const [contribDay, setContribDay] = useState(5);

  // Risk & Execution
  const [rebalanceMode, setRebalanceMode] = useState<RebalanceMode>(RebalanceMode.MONTHLY);
  const [reinvestDiv, setReinvestDiv] = useState(true);
  const [trailingStop, setTrailingStop] = useState(0);
  const [slippage, setSlippage] = useState(5);
  const [tradeTiming, setTradeTiming] = useState<'open' | 'close'>('close');

  // WFA
  const [wfa, setWfa] = useState<WalkForwardConfig>({
    enabled: true,
    anchor_date: '2020-01-01', 
    optimization_type: 'sharpe',
    window_size_years: 5,
    engine: MLEngineType.RANDOM_FOREST
  });

  // Library State
  const [portfolios, setPortfolios] = useState<PortfolioTemplate[]>(INITIAL_PORTFOLIOS);
  const [strategies, setStrategies] = useState<StrategyDSL[]>(INITIAL_STRATEGIES);

  // Selection & Lifted Editor State
  const [activePortfolioIds, setActivePortfolioIds] = useState<Set<string>>(new Set(['pt-tqqq-only', 'pt-ai-titans']));
  const [activeStrategyIds, setActiveStrategyIds] = useState<Set<string>>(new Set(['strat-dca-baseline', 'strat-sma-200']));
  const [editingStrategyId, setEditingStrategyId] = useState<string>(INITIAL_STRATEGIES[0].id);

  // Sidebar Toggles
  const [openSection, setOpenSection] = useState<string>('params');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; 
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const handleCreateCustomPortfolio = () => {
    const newId = `pt-custom-${Date.now()}`;
    const newPort: PortfolioTemplate = {
      id: newId,
      name: 'New Custom Basket',
      category: 'Custom',
      riskGrade: 'Medium',
      description: 'Hand-crafted asset weightings for tailored alpha.',
      assets: [{ ticker: 'SPY', weight: 1.0 }]
    };
    setPortfolios([newPort, ...portfolios]);
    setActivePortfolioIds(prev => new Set(prev).add(newId));
  };

  const updatePortfolioAssets = (id: string, assets: AssetWeight[]) => {
    setPortfolios(prev => prev.map(p => p.id === id ? { ...p, assets } : p));
  };

  const toggleSelection = (id: string, type: 'portfolio' | 'strategy') => {
    if (type === 'portfolio') {
      const next = new Set(activePortfolioIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      setActivePortfolioIds(next);
    } else {
      const next = new Set(activeStrategyIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      setActiveStrategyIds(next);
    }
  };

  const handleEditStrategy = (id: string) => {
    setEditingStrategyId(id);
    setActiveTab('StrategyForge');
  };

  const handleRunBatch = async () => {
    setLoading(true);
    try {
      const selectedPorts = portfolios
        .filter(p => activePortfolioIds.has(p.id))
        .map(p => ({ name: p.name, assets: p.assets }));
      
      const selectedStrats = strategies.filter(s => activeStrategyIds.has(s.id));
      
      const contribution: ContributionConfig = {
          amount: contribAmount,
          frequency: contribFreq,
          day_of_week: contribDay
      };

      const globalConfig: GlobalSimulationConfig = {
          rebalance_mode: rebalanceMode,
          reinvest_dividends: reinvestDiv,
          trailing_stop_pct: trailingStop,
          slippage_bps: slippage,
          trade_timing: tradeTiming,
          use_local_data_priority: localDataActive
      };
      
      const res = await runMatrixBacktest(selectedPorts, selectedStrats, {
        start_date: startDate,
        end_date: endDate,
        initial_capital: capital,
        contribution,
        global_config: globalConfig,
        wfa: wfa.enabled ? wfa : undefined,
        local_data: localDataActive ? localData : undefined
      });
      setMatrixResults(res);
      if (res.results.length > 0) {
         setResults(res.bestResult?.fullResponse || res.results[0].fullResponse);
      }
      setActiveTab('MetricPro');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, id, icon }: { title: string, id: string, icon: any }) => (
     <button 
        onClick={() => setOpenSection(openSection === id ? '' : id)}
        className="flex items-center justify-between w-full py-3 group"
     >
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg transition-colors ${openSection === id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {icon}
           </div>
           <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${openSection === id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
     </button>
  );

  const SidebarContent = (
    <div className="p-6 space-y-6 bg-white dark:bg-slate-900 transition-colors h-full pb-20">
      <div className="flex justify-between items-center mb-6">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Environment Controls</label>
          <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-blue-500 transition-all">
            {darkMode ? 'Dark' : 'Light'}
          </button>
      </div>

      <div className="space-y-1">
         <SectionHeader id="live" title="Live & Paper Trade" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
         {openSection === 'live' && (
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4 animate-in slide-in-from-top-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Paper Trading</span>
                    <button onClick={() => setIsPaperTradeMode(!isPaperTradeMode)} className={`w-8 h-4 rounded-full relative transition-all ${isPaperTradeMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                       <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isPaperTradeMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                 </div>
                 <p className="text-[9px] text-slate-400 italic">Enable to track real-time signals without capital risk. Injects paper trade log into Journal.</p>
             </div>
         )}

         <SectionHeader id="params" title="Time & Capital" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
         {openSection === 'params' && (
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4 animate-in slide-in-from-top-2">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Start</span>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-[10px] font-black dark:text-white" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">End</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-[10px] font-black dark:text-white" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Initial Capital</span>
                    <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white" />
                 </div>
             </div>
         )}

         <SectionHeader id="risk" title="Rebalancing & Stop" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>} />
         {openSection === 'risk' && (
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4 animate-in slide-in-from-top-2">
                 <div className="space-y-1">
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Rebalance Mode</span>
                     <select value={rebalanceMode} onChange={e => setRebalanceMode(e.target.value as RebalanceMode)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] font-black dark:text-white">
                        <option value={RebalanceMode.NONE}>None (Buy & Hold)</option>
                        <option value={RebalanceMode.MONTHLY}>Monthly</option>
                        <option value={RebalanceMode.THRESHOLD}>Drift Target (5%)</option>
                     </select>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Trailing Stop: {(trailingStop * 100).toFixed(0)}%</span>
                    <input type="range" min="0" max="0.5" step="0.05" value={trailingStop} onChange={e => setTrailingStop(parseFloat(e.target.value))} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-rose-500" />
                 </div>
             </div>
         )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={handleRunBatch} 
          disabled={loading || activePortfolioIds.size === 0 || activeStrategyIds.size === 0} 
          className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          {loading ? 'CRUNCHING...' : `RUN ${activePortfolioIds.size * activeStrategyIds.size} PERMUTATIONS`}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <ErrorBoundary>
        <Layout sidebar={SidebarContent}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-2 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl z-40 scale-75 lg:scale-100 overflow-x-auto whitespace-nowrap max-w-[95vw] scrollbar-hide">
            {[
              { id: 'Setup', label: 'Setup' },
              { id: 'StrategyForge', label: 'Strategy Forge' },
              { id: 'MetricPro', label: 'Metric Pro' },
              { id: 'Performance', label: 'Performance' },
              { id: 'Matrix', label: 'The Matrix' },
              { id: 'Leaderboard', label: 'Leaderboard' },
              { id: 'Correlations', label: 'Risk Dynamics' },
              { id: 'TradeLog', label: 'Logs' },
              { id: 'DataSettings', label: 'Data Console' },
              { id: 'Brokerage', label: 'Brokerage' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-16 pt-32">
            {activeTab === 'Setup' && (
              <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in duration-500 pb-32">
                <header className="space-y-6 text-center">
                  <h1 className="text-6xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Matrix<br/><span className="text-blue-600">Architect.</span></h1>
                  <p className="text-xl lg:text-3xl text-slate-400 dark:text-slate-500 font-medium max-w-3xl mx-auto">High-dimensional cross-validation for multi-asset strategies.</p>
                </header>

                <section className="space-y-12">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-8">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                      <span className="w-12 h-12 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">1</span>
                      Portfolio Baskets
                    </h2>
                    <button onClick={handleCreateCustomPortfolio} className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-[24px] text-[11px] font-black uppercase shadow-2xl hover:scale-105 transition-all">
                      + Create Custom
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {portfolios.map(p => (
                      <div key={p.id} className={`p-10 rounded-[64px] border-4 transition-all cursor-pointer flex flex-col justify-between ${activePortfolioIds.has(p.id) ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-2xl scale-[1.02]' : 'border-slate-50 dark:border-slate-900 opacity-60'}`} onClick={() => toggleSelection(p.id, 'portfolio')}>
                        <div className="space-y-6">
                           <h3 className="text-3xl font-black dark:text-white leading-tight">{p.name}</h3>
                           <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>
                        </div>
                        <div className="mt-10 pt-10 border-t border-slate-50 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                           <PortfolioBuilder assets={p.assets} onChange={(assets) => updatePortfolioAssets(p.id, assets)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-12">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-8">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                      <span className="w-12 h-12 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">2</span>
                      Strategy Overlays
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {strategies.map(s => (
                      <div key={s.id} className={`p-10 rounded-[64px] border-4 transition-all cursor-pointer flex flex-col justify-between ${activeStrategyIds.has(s.id) ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-2xl scale-[1.02]' : 'border-slate-50 dark:border-slate-900 opacity-60'}`} onClick={() => toggleSelection(s.id, 'strategy')}>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${activeStrategyIds.has(s.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>{activeStrategyIds.has(s.id) ? 'ACTIVE' : 'IDLE'}</div>
                              <button onClick={(e) => { e.stopPropagation(); handleEditStrategy(s.id); }} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Configure</button>
                           </div>
                           <h3 className="text-3xl font-black dark:text-white leading-tight">{s.name}</h3>
                           <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'StrategyForge' && <StrategyForgeView strategies={strategies} selectedId={editingStrategyId} setSelectedId={setEditingStrategyId} setStrategies={setStrategies} />}
            {activeTab === 'MetricPro' && matrixResults && <MetricProView data={matrixResults} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Performance' && results && <PerformanceView data={results} darkMode={darkMode} />}
            {activeTab === 'Matrix' && matrixResults && <MatrixView data={matrixResults} darkMode={darkMode} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Leaderboard' && matrixResults && <LeaderboardView data={matrixResults} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Correlations' && results && <CorrelationDynamicsView portfolios={portfolios} historicalData={results.historical_correlations || []} />}
            {activeTab === 'TradeLog' && results && <TradeLogView data={results} />}
            {activeTab === 'DataSettings' && <DataSettingsView onDataUpdate={setLocalData} localDataActive={localDataActive} setLocalDataActive={setLocalDataActive} />}
            {activeTab === 'Brokerage' && <BrokerageView isPaperTrading={isPaperTradeMode} />}
          </div>
        </Layout>
        <LiveAnalyst />
      </ErrorBoundary>
    </div>
  );
};

export default App;
