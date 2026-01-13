
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PerformanceView } from './components/PerformanceView.tsx';
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
import { Frequency, StrategyDSL, BacktestResponse, BacktestMatrixResponse, PortfolioTemplate, RebalanceMode } from './types.ts';
import { 
  PORTFOLIO_LIBRARY as INITIAL_PORTFOLIOS, 
  STRATEGY_LIBRARY as INITIAL_STRATEGIES,
} from './constants.tsx';
import { runMatrixBacktest } from './services/engine.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Setup' | 'StrategyForge' | 'MetricPro' | 'Correlations' | 'Leaderboard' | 'Matrix' | 'Performance' | 'TradeLog' | 'DataSettings' | 'Brokerage'>('Setup');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResponse | null>(null);
  const [matrixResults, setMatrixResults] = useState<BacktestMatrixResponse | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Global Sim State
  const [capital, setCapital] = useState(10000);
  const [startDate, setStartDate] = useState('2010-02-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [contribAmount, setContribAmount] = useState(1000);
  const [contribFreq, setContribFreq] = useState<Frequency>(Frequency.MONTHLY);
  const [rebalanceMode, setRebalanceMode] = useState<RebalanceMode>(RebalanceMode.NONE);
  const [reinvestDividends, setReinvestDividends] = useState(true);

  const [portfolios, setPortfolios] = useState<PortfolioTemplate[]>(INITIAL_PORTFOLIOS);
  const [strategies, setStrategies] = useState<StrategyDSL[]>(INITIAL_STRATEGIES);
  
  // RESTORE MULTI-SELECTION FOR MATRIX COMPARISON
  const [activePortfolioIds, setActivePortfolioIds] = useState<Set<string>>(new Set(['pt-tqqq-only']));
  const [activeStrategyIds, setActiveStrategyIds] = useState<Set<string>>(new Set(['strat-dca-baseline']));
  
  const [editingStrategyId, setEditingStrategyId] = useState<string>(INITIAL_STRATEGIES[0].id);
  const [openSection, setOpenSection] = useState<string>('params');

  const togglePortfolio = (id: string) => {
    const next = new Set(activePortfolioIds);
    if (next.has(id) && next.size > 1) next.delete(id);
    else next.add(id);
    setActivePortfolioIds(next);
  };

  const toggleStrategy = (id: string) => {
    const next = new Set(activeStrategyIds);
    if (next.has(id) && next.size > 1) next.delete(id);
    else next.add(id);
    setActiveStrategyIds(next);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; 
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const handleRunBatch = async () => {
    setLoading(true);
    try {
      const selectedPorts = portfolios
        .filter(p => activePortfolioIds.has(p.id))
        .map(p => ({ name: p.name, assets: p.assets }));
      
      const selectedStrats = strategies.filter(s => activeStrategyIds.has(s.id));
      
      const res = await runMatrixBacktest(selectedPorts, selectedStrats, {
        start_date: startDate,
        end_date: endDate,
        initial_capital: capital,
        contribution: { amount: contribAmount, frequency: contribFreq, day_of_week: 1 },
        global_config: { rebalance_mode: rebalanceMode, reinvest_dividends: reinvestDividends, slippage_bps: 1, use_local_data_priority: false }
      });
      setMatrixResults(res);
      setResults(res.bestResult.fullResponse);
      setActiveTab('Performance');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, id, icon }: { title: string, id: string, icon: any }) => (
     <button onClick={() => setOpenSection(openSection === id ? '' : id)} className="flex items-center justify-between w-full py-3 group">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg transition-colors ${openSection === id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{icon}</div>
           <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${openSection === id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
     </button>
  );

  const SidebarContent = (
    <div className="p-6 space-y-6 bg-white dark:bg-slate-900 transition-colors h-full pb-20">
      <SectionHeader id="params" title="Time & Capital" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
      {openSection === 'params' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4">
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
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Initial Deposit ($)</span>
                 <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white" />
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Contribution Amount ($)</span>
                    <input type="number" value={contribAmount} onChange={e => setContribAmount(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Frequency</span>
                    <select value={contribFreq} onChange={e => setContribFreq(e.target.value as Frequency)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] font-black dark:text-white">
                        {Object.values(Frequency).map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                    </select>
                 </div>
              </div>
          </div>
      )}

      <SectionHeader id="risk" title="Rebalancing & Dividends" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2"/></svg>} />
      {openSection === 'risk' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Global Rebalance Mode</span>
                <select value={rebalanceMode} onChange={e => setRebalanceMode(e.target.value as RebalanceMode)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] font-black dark:text-white">
                    <option value={RebalanceMode.NONE}>Buy & Hold (Standard DCA)</option>
                    <option value={RebalanceMode.MONTHLY}>Monthly Forced Rebalance</option>
                    <option value={RebalanceMode.THRESHOLD}>Dynamic Threshold (5%)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Reinvest Dividends</span>
                 <button onClick={() => setReinvestDividends(!reinvestDividends)} className={`w-10 h-5 rounded-full relative transition-all ${reinvestDividends ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${reinvestDividends ? 'right-0.5' : 'left-0.5'}`} />
                 </button>
              </div>
          </div>
      )}

      <button onClick={handleRunBatch} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
        {loading ? 'CALCULATING...' : 'RUN MATRIX ANALYSIS'}
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <ErrorBoundary>
        <Layout sidebar={SidebarContent}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-2 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl z-40 scale-75 lg:scale-100 overflow-x-auto whitespace-nowrap max-w-[90vw] scrollbar-hide">
            {['Setup', 'StrategyForge', 'MetricPro', 'Correlations', 'Leaderboard', 'Matrix', 'Performance', 'TradeLog', 'DataSettings', 'Brokerage'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-16 pt-32">
            {activeTab === 'Setup' && (
              <div className="max-w-7xl mx-auto space-y-16">
                <header className="text-center space-y-6">
                  <h1 className="text-7xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">The Matrix<br/><span className="text-blue-600">Architect.</span></h1>
                  <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl mx-auto">Compare 100% TQQQ DCA vs Tactical Rotation across all selected combinations.</p>
                </header>

                <div className="space-y-20">
                  <section className="space-y-10">
                    <div className="flex items-baseline gap-4">
                      <h2 className="text-4xl font-black dark:text-white tracking-tight">1. Target Portfolios</h2>
                      <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">{activePortfolioIds.size} Selection(s)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {portfolios.map(p => (
                          <div key={p.id} className={`p-8 rounded-[48px] border-4 transition-all cursor-pointer ${activePortfolioIds.has(p.id) ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-2xl scale-[1.02]' : 'border-slate-100 dark:border-slate-800 hover:border-blue-400'}`} onClick={() => togglePortfolio(p.id)}>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-2xl font-black dark:text-white leading-tight">{p.name}</h3>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${activePortfolioIds.has(p.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {activePortfolioIds.has(p.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              </div>
                            </div>
                            <PortfolioBuilder assets={p.assets} onChange={(assets) => setPortfolios(prev => prev.map(old => old.id === p.id ? {...old, assets} : old))} />
                          </div>
                       ))}
                    </div>
                  </section>

                  <section className="space-y-10">
                    <div className="flex items-baseline gap-4">
                      <h2 className="text-4xl font-black dark:text-white tracking-tight">2. Algorithmic Strategies</h2>
                      <span className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">{activeStrategyIds.size} Selection(s)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {strategies.map(s => (
                          <div key={s.id} className={`p-8 rounded-[40px] border-4 transition-all cursor-pointer ${activeStrategyIds.has(s.id) ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-2xl' : 'border-slate-100 dark:border-slate-800'}`} onClick={() => toggleStrategy(s.id)}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-black dark:text-white leading-tight">{s.name}</h4>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${activeStrategyIds.has(s.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {activeStrategyIds.has(s.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{s.description}</p>
                          </div>
                       ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
            {activeTab === 'StrategyForge' && <StrategyForgeView strategies={strategies} selectedId={editingStrategyId} setSelectedId={setEditingStrategyId} setStrategies={setStrategies} />}
            {activeTab === 'MetricPro' && matrixResults && <MetricProView data={matrixResults} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Performance' && results && <PerformanceView data={results} darkMode={darkMode} />}
            {activeTab === 'Matrix' && matrixResults && <MatrixView data={matrixResults} darkMode={darkMode} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Leaderboard' && matrixResults && <LeaderboardView data={matrixResults} onSelect={(r) => { setResults(r.fullResponse); setActiveTab('Performance'); }} />}
            {activeTab === 'Correlations' && results && <CorrelationDynamicsView portfolios={portfolios} historicalData={results.historical_correlations || []} />}
            {activeTab === 'TradeLog' && results && <TradeLogView data={results} />}
            {activeTab === 'DataSettings' && <DataSettingsView onDataUpdate={() => {}} localDataActive={false} setLocalDataActive={() => {}} />}
            {activeTab === 'Brokerage' && <BrokerageView isPaperTrading={false} />}
          </div>
        </Layout>
        <LiveAnalyst />
      </ErrorBoundary>
    </div>
  );
};

export default App;
