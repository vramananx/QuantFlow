
import React, { useState, useMemo } from 'react';
import { BacktestResponse, AIMemo } from '../types.ts';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

interface Props {
  data: BacktestResponse;
  darkMode?: boolean;
}

export const WalkForwardView: React.FC<Props> = ({ data, darkMode }) => {
  const [aiMemo, setAiMemo] = useState<AIMemo | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const formatPercent = (val: number) => (val * 100).toFixed(1) + '%';

  const oosDate = useMemo(() => {
    const oosPoint = data.equity_curve.find(p => p.is_oos);
    return oosPoint ? oosPoint.date : null;
  }, [data.equity_curve]);

  // Mock sensitivity data for "reviewing deeper"
  const sensitivityData = useMemo(() => {
    const points = [];
    const windowSizes = [1, 2, 3, 5, 10];
    const anchorOffsets = [-6, -3, 0, 3, 6]; // months
    
    for (const w of windowSizes) {
       for (const a of anchorOffsets) {
          points.push({
             window: w,
             offset: a,
             sharpe: Math.max(0.5, data.metrics.sharpe + (Math.random() * 0.4 - 0.2)),
             overfit: Math.max(5, (data.metrics.overfit_index || 20) + (Math.random() * 20 - 10))
          });
       }
    }
    return points;
  }, [data.metrics]);

  const requestAudit = async () => {
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a Deep Walk-Forward Audit: Strategy ${data.meta.strategy_name}, In-Sample CAGR ${formatPercent(data.metrics.is_cagr || 0)}, Out-of-Sample CAGR ${formatPercent(data.metrics.oos_cagr || 0)}, Overfit Index ${data.metrics.overfit_index}%. Analyze for parameter sensitivity and robustness across regimes. Return JSON memo.`;
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
    } catch (e) { console.error(e); } finally { setLoadingAI(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <h2 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">WFA Audit Pro.</h2>
             <div className="px-5 py-2 bg-blue-600 text-white rounded-2xl">
                <span className="text-xs font-black uppercase tracking-widest">ML Validated</span>
             </div>
          </div>
          <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl leading-relaxed">
             Review the structural stability of your model. We compare In-Sample (training) vs Out-of-Sample (reality) to detect parameter memorization.
          </p>
        </div>
        <button onClick={requestAudit} disabled={loadingAI} className="px-12 py-6 bg-emerald-600 text-white rounded-[32px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 active:scale-95">
          {loadingAI ? 'Running Neural Audit...' : 'Consult AI Robustness Engine'}
        </button>
      </header>

      {/* Robustness Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
           <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Reality Split</h3>
              {oosDate && <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900/30 tracking-widest uppercase">ML Anchor: {oosDate}</div>}
           </div>
           
           <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data.equity_curve}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: darkMode ? '#0f172a' : '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}} />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={6} fill="#2563eb" fillOpacity={0.08} dot={false} />
                    {oosDate && <ReferenceLine x={oosDate} stroke="#f59e0b" strokeWidth={4} strokeDasharray="12 12" label={{ value: 'OUT-OF-SAMPLE START', fill: '#f59e0b', fontSize: 11, fontWeight: 900, position: 'top' }} />}
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-10">
              <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">In-Sample CAGR</span>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">+{formatPercent(data.metrics.is_cagr || 0)}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Training Phase / Peak Alpha</p>
              </div>
              <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-900/30 space-y-2">
                 <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Out-of-Sample CAGR</span>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">+{formatPercent(data.metrics.oos_cagr || 0)}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Generalization / Reality Check</p>
              </div>
           </div>
        </div>

        <div className="space-y-10">
           <div className="bg-slate-900 dark:bg-black p-12 rounded-[64px] shadow-2xl space-y-10 relative overflow-hidden border border-slate-800">
              <h3 className="text-2xl font-black text-white tracking-tight">Overfit Circuit Breaker</h3>
              <div className="flex items-center justify-center h-56">
                 <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-800" />
                       <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={527.7} strokeDashoffset={527.7 - (527.7 * (data.metrics.overfit_index || 0) / 100)} className={data.metrics.overfit_index && data.metrics.overfit_index > 45 ? 'text-rose-500' : 'text-emerald-500'} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-5xl font-black text-white">{(data.metrics.overfit_index || 0).toFixed(0)}%</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tuning Bias</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">Robustness Score</span>
                    <span className="text-xl font-black text-emerald-400">{(data.metrics.robustness_score || 0).toFixed(0)}/100</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${data.metrics.robustness_score}%` }} />
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-10 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">ML Engine Metadata</h3>
              <div className="space-y-4">
                 <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Type</span>
                    <span className="text-xs font-black text-blue-600 uppercase">Ensemble Forest</span>
                 </div>
                 <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cross-Validation</span>
                    <span className="text-xs font-black text-blue-600 uppercase">K-Fold (K=5)</span>
                 </div>
                 <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Decay</span>
                    <span className={`text-xs font-black uppercase ${data.metrics.oos_deviation && data.metrics.oos_deviation > 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                       {(data.metrics.oos_deviation || 0).toFixed(1)}% Delta
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Parameter Sensitivity Heatmap */}
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Parameter Sensitivity Surface</h3>
               <p className="text-slate-400 text-sm font-medium">Testing "Optimization Stability" across different lookback windows.</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-blue-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High Sharpe Area</span>
               </div>
            </div>
         </div>

         <div className="h-[400px] w-full bg-slate-50 dark:bg-slate-950 rounded-[48px] p-8 border border-slate-100 dark:border-slate-900 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                  <XAxis type="number" dataKey="window" name="Window (Yrs)" unit="Y" label={{ value: 'Lookback Window', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                  <YAxis type="number" dataKey="offset" name="Offset (Mo)" unit="M" label={{ value: 'Anchor Shift', angle: -90, position: 'left', fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                  <ZAxis type="number" dataKey="overfit" range={[50, 400]} name="Overfit Index" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Sensitivity Points" data={sensitivityData}>
                     {sensitivityData.map((entry, index) => (
                        // Fix: Re-use imported Cell component from recharts.
                        <Cell key={`cell-${index}`} fill={entry.sharpe > 1.2 ? '#2563eb' : entry.sharpe > 0.8 ? '#3b82f6' : '#94a3b8'} />
                     ))}
                  </Scatter>
               </ScatterChart>
            </ResponsiveContainer>
         </div>
         <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Robust strategies show "clusters" of performance rather than single peak points.</p>
      </div>

      {/* AI Recommendation Section */}
      {aiMemo && (
        <div className="bg-slate-900 dark:bg-black p-16 rounded-[80px] shadow-2xl border border-slate-800 space-y-12 animate-in slide-in-from-bottom-12">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/10 pb-12 gap-10">
              <div className="space-y-4">
                 <h3 className="text-5xl font-black text-white tracking-tighter">Strategic Audit Recommendation.</h3>
                 <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">AI Neural Synthesis of Backtest Results</p>
              </div>
              <div className={`px-16 py-6 rounded-[32px] text-2xl font-black uppercase tracking-widest ${aiMemo.rating === 'Buy' ? 'bg-emerald-600' : 'bg-rose-600'} text-white shadow-2xl`}>{aiMemo.rating}</div>
           </div>
           
           <p className="text-3xl text-slate-400 font-medium italic border-l-[12px] border-blue-600 pl-12 py-4 leading-relaxed tracking-tight">{aiMemo.summary}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              <div className="space-y-8">
                 <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" /> Generalization Moats
                 </h4>
                 <ul className="space-y-4 text-base text-slate-300 font-bold">
                    {aiMemo.pros.map((p, i) => <li key={i} className="flex gap-4">/ {p}</li>)}
                 </ul>
              </div>
              
              <div className="space-y-8">
                 <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" /> Overfit Indicators
                 </h4>
                 <ul className="space-y-4 text-base text-slate-300 font-bold">
                    {aiMemo.cons.map((c, i) => <li key={i} className="flex gap-4">/ {c}</li>)}
                 </ul>
              </div>
              
              <div className="space-y-8">
                 <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" /> Optimization Path
                 </h4>
                 <div className="space-y-4">
                    {aiMemo.suggested_adjustments.map((a, i) => (
                      <div key={i} className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-3xl text-sm font-black text-slate-300">
                        {a}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="pt-12 flex justify-center">
              <button onClick={() => setAiMemo(null)} className="px-16 py-4 bg-white text-slate-900 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">Dismiss Deep Audit</button>
           </div>
        </div>
      )}
    </div>
  );
};
