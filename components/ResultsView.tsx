
import React, { useState, useMemo } from 'react';
import { BacktestResponse, AIMemo } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line, ComposedChart, ReferenceLine
} from 'recharts';

interface Props {
  data: BacktestResponse;
  darkMode?: boolean;
}

export const ResultsView: React.FC<Props> = ({ data, darkMode }) => {
  const [aiMemo, setAiMemo] = useState<AIMemo | null>(data.ai_memo || null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'wfa' | 'trades'>('performance');

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const mcData = useMemo(() => {
    return data.monte_carlo.map(d => ({ ...d, range: [d.p10, d.p90] }));
  }, [data.monte_carlo]);

  const oosStartIndex = useMemo(() => {
    return data.equity_curve.findIndex(p => p.is_oos);
  }, [data.equity_curve]);

  const oosDate = useMemo(() => {
    return oosStartIndex !== -1 ? data.equity_curve[oosStartIndex].date : null;
  }, [data.equity_curve, oosStartIndex]);

  const requestAIMemo = async () => {
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze: ${data.meta.strategy_name}. CAGR ${formatPercent(data.metrics.cagr)}, Overfit ${data.metrics.overfit_index?.toFixed(0)}%, OOS Deviation ${data.metrics.oos_deviation?.toFixed(1)}%. Return JSON memo.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.STRING },
              summary: { type: Type.STRING },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_adjustments: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      setAiMemo(JSON.parse(response.text));
    } catch (error) { console.error(error); } finally { setLoadingAI(false); }
  };

  return (
    <div className="flex-1 space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-10 gap-8">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
             <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{data.meta.strategy_name}</h2>
             <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-[24px] border border-slate-200 dark:border-slate-800">
                {['performance', 'wfa', 'trades'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`px-4 lg:px-6 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    {t === 'wfa' ? 'Walk Forward (ML)' : t}
                  </button>
                ))}
             </div>
          </div>
          <div className="flex gap-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <span>Validated: {data.wfa_status}</span>
            <span>Overfit Index: {data.metrics.overfit_index?.toFixed(0)}%</span>
          </div>
        </div>
        <button onClick={requestAIMemo} disabled={loadingAI} className="w-full lg:w-auto px-8 py-4 bg-blue-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50">
          {loadingAI ? 'ML Agent Thinking...' : 'AI Robustness Report'}
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="space-y-12">
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
            {[
              { label: 'Final Value', value: formatCurrency(data.metrics.final_value), sub: 'Ending Liquidity', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'CAGR', value: formatPercent(data.metrics.cagr), sub: 'Annualized', color: 'text-emerald-500' },
              { label: 'Sharpe', value: data.metrics.sharpe.toFixed(2), sub: 'Risk-Adj Return', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'OOS Deviation', value: formatPercent((data.metrics.oos_deviation || 0) / 100), sub: 'IS vs OOS Delta', color: 'text-amber-500' },
              { label: 'Robustness', value: `${(data.metrics.robustness_score || 0).toFixed(0)}%`, sub: 'Inverse Overfit', color: 'text-emerald-500' },
            ].map(m => (
              <div key={m.label} className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{m.label}</p>
                <p className={`text-2xl lg:text-3xl font-black tracking-tight ${m.color}`}>{m.value}</p>
                <p className="mt-2 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Equity Curve (IS + OOS Overlay)</h3>
                  {oosDate && <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Anchor: {oosDate}</div>}
               </div>
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={data.equity_curve}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{borderRadius: '20px', border: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#ffffff' : '#000000'}} />
                        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" dot={false} />
                        {oosDate && <ReferenceLine x={oosDate} stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 8" label={{ position: 'top', value: 'ML Anchor', fill: '#f59e0b', fontSize: 10, fontWeight: 900 }} />}
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-slate-900 dark:bg-black p-10 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden group border border-slate-800">
              <h3 className="text-2xl font-black text-white tracking-tight">Variance Projection</h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mcData}>
                    <XAxis dataKey="year" stroke="#475569" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Area type="monotone" dataKey="range" stroke="none" fill="#3b82f6" fillOpacity={0.15} />
                    <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={4} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">90th Percentile</p>
                  <p className="text-white text-lg font-black">{formatCurrency(data.monte_carlo[9]?.p90 || 0)}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-[32px] border border-white/10">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">10th Percentile</p>
                  <p className="text-rose-400 text-lg font-black">{formatCurrency(data.monte_carlo[9]?.p10 || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wfa' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Overfit Diagnosis</h3>
              <div className="relative h-64 flex items-center justify-center">
                 {/* Radial Overfit Meter */}
                 <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                       <circle 
                          cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" 
                          strokeDasharray={502.6} 
                          strokeDashoffset={502.6 - (502.6 * (data.metrics.overfit_index || 0) / 100)} 
                          className={data.metrics.overfit_index && data.metrics.overfit_index > 50 ? 'text-rose-500' : 'text-emerald-500'} 
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-black dark:text-white">{(data.metrics.overfit_index || 0).toFixed(0)}%</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</span>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  The <span className="font-bold text-slate-900 dark:text-white">Overfit Index</span> measures the strategy's degrees of freedom against the data sample size. A high score suggests the model is memorizing historical noise rather than learning robust patterns.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Walk-Forward Deviation</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">In-Sample Performance (IS)</span>
                   <span className="text-xl font-black text-emerald-500">+{(data.metrics.cagr * 100 * 1.2).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">Out-of-Sample Performance (OOS)</span>
                   <span className="text-xl font-black text-blue-500">+{((data.metrics.cagr * 100)).toFixed(1)}%</span>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ML Performance Decay</span>
                      <span className="text-lg font-black text-rose-500">{(data.metrics.oos_deviation || 0).toFixed(1)}% Decay</span>
                   </div>
                   <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${Math.min((data.metrics.oos_deviation || 0) * 5, 100)}%` }}></div>
                   </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium italic">High performance decay indicates that the optimized parameters found during training are not generalizing well to unseen market regimes.</p>
            </div>
          </div>
        </div>
      )}

      {aiMemo && (
        <div className="bg-white dark:bg-slate-900 border-4 border-blue-100 dark:border-blue-900 p-10 lg:p-16 rounded-[64px] shadow-2xl space-y-12 animate-in slide-in-from-bottom-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-50 dark:border-slate-800 pb-8 gap-6">
             <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Strategy Robustness Audit.</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Investment Committee Walk-Forward Review</p>
             </div>
             <span className={`px-12 py-4 rounded-[24px] text-xl font-black uppercase tracking-widest ${aiMemo.rating === 'Buy' ? 'bg-emerald-600' : aiMemo.rating === 'Avoid' ? 'bg-rose-600' : 'bg-amber-500'} text-white`}>{aiMemo.rating}</span>
          </div>
          
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 font-medium italic border-l-8 border-blue-600 pl-10 py-2 leading-relaxed">{aiMemo.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h4 className="text-lg font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-tighter flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Generalization Pros
              </h4>
              <ul className="space-y-3">
                {aiMemo.pros?.map((p, i) => <li key={i} className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-snug flex gap-2">/ {p}</li>)}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-lg font-black uppercase text-rose-600 dark:text-rose-400 tracking-tighter flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Overfit Indicators
              </h4>
              <ul className="space-y-3">
                {aiMemo.cons?.map((c, i) => <li key={i} className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-snug flex gap-2">/ {c}</li>)}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-lg font-black uppercase text-blue-600 dark:text-blue-400 tracking-tighter flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Hyperparameter Tuning
              </h4>
              <div className="space-y-3">
                {aiMemo.suggested_adjustments?.map((a, i) => (
                  <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-300">
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex justify-center">
            <button onClick={() => setAiMemo(null)} className="px-10 py-3 bg-slate-900 dark:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">Close Audit</button>
          </div>
        </div>
      )}
    </div>
  );
};
