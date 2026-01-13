
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

  // Simulation settings
  const [capital, setCapital] = useState(10000);
  const [startDate, setStartDate] = useState('2010-02-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [contribAmount, setContribAmount] = useState(1000);
  const [contribFreq, setContribFreq] = useState<Frequency>(Frequency.MONTHLY);
  const [contribDay, setContribDay] = useState(1);
  const [rebalanceMode, setRebalanceMode] = useState<RebalanceMode>(RebalanceMode.NONE); // DEFAULT TO NONE (BUY & HOLD)

  const [portfolios, setPortfolios] = useState<PortfolioTemplate[]>(INITIAL_PORTFOLIOS);
  const [strategies, setStrategies] = useState<StrategyDSL[]>(INITIAL_STRATEGIES);
  const [activePortfolioIds, setActivePortfolioIds] = useState<Set<string>>(new Set(['pt-tqqq-only']));
  const [activeStrategyIds, setActiveStrategyIds] = useState<Set<string>>(new Set(['strat-dca-baseline']));
  const [editingStrategyId, setEditingStrategyId] = useState<string>(INITIAL_STRATEGIES[0].id);
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
        contribution: { amount: contribAmount, frequency: contribFreq, day_of_week: contribDay },
        global_config: { rebalance_mode: rebalanceMode, reinvest_dividends: true, slippage_bps: 1, use_local_data_priority: false }
      });
      setMatrixResults(res);
      if (res.results.length > 0) {
         setResults(res.bestResult?.fullResponse || res.results[0].fullResponse);
      }
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
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Initial Capital</span>
                 <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white" />
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Monthly DCA ($)</span>
                    <input type="number" value={contribAmount} onChange={e => setContribAmount(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white" />
                 </div>
              </div>
          </div>
      )}

      <SectionHeader id="risk" title="Rebalancing Mode" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2"/></svg>} />
      {openSection === 'risk' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] space-y-4">
              <select value={rebalanceMode} onChange={e => setRebalanceMode(e.target.value as RebalanceMode)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] font-black dark:text-white">
                  <option value={RebalanceMode.NONE}>Buy & Hold (Standard DCA)</option>
                  <option value={RebalanceMode.MONTHLY}>Monthly Rebalance</option>
                  <option value={RebalanceMode.THRESHOLD}>Dynamic Threshold (5%)</option>
              </select>
          </div>
      )}

      <button onClick={handleRunBatch} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
        {loading ? 'CRUNCHING...' : 'RUN BACKTEST'}
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <ErrorBoundary>
        <Layout sidebar={SidebarContent}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-2 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl z-40 scale-75 lg:scale-100">
            {['Setup', 'Performance', 'TradeLog', 'DataSettings'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-6 lg:p-16 pt-32">
            {activeTab === 'Setup' && (
              <div className="max-w-7xl mx-auto space-y-16">
                <header className="text-center space-y-6">
                  <h1 className="text-7xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">High-Leverage<br/><span className="text-blue-600">Architect.</span></h1>
                  <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl mx-auto">Analyze 100% TQQQ DCA and tactical rotation strategies with deterministic precision.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {portfolios.map(p => (
                      <div key={p.id} className={`p-10 rounded-[64px] border-4 transition-all cursor-pointer ${activePortfolioIds.has(p.id) ? 'border-blue-600 bg-white dark:bg-slate-900' : 'border-slate-100 dark:border-slate-800'}`} onClick={() => setActivePortfolioIds(new Set([p.id]))}>
                        <h3 className="text-3xl font-black dark:text-white mb-4">{p.name}</h3>
                        <p className="text-sm text-slate-400 mb-8">{p.description}</p>
                        <PortfolioBuilder assets={p.assets} onChange={(assets) => setPortfolios(prev => prev.map(old => old.id === p.id ? {...old, assets} : old))} />
                      </div>
                   ))}
                </div>
              </div>
            )}
            {activeTab === 'Performance' && results && <PerformanceView data={results} darkMode={darkMode} />}
            {activeTab === 'TradeLog' && results && <TradeLogView data={results} />}
            {activeTab === 'DataSettings' && <DataSettingsView onDataUpdate={() => {}} localDataActive={false} setLocalDataActive={() => {}} />}
          </div>
        </Layout>
        <LiveAnalyst />
      </ErrorBoundary>
    </div>
  );
};

export default App;
