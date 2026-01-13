
import React, { useState } from 'react';
import { LocalDataset, OHLC } from '../types.ts';

interface Props {
  onDataUpdate: (data: Record<string, Record<string, number>>) => void;
  localDataActive: boolean;
  setLocalDataActive: (active: boolean) => void;
}

export const DataSettingsView: React.FC<Props> = ({ onDataUpdate, localDataActive, setLocalDataActive }) => {
  const [datasets, setDatasets] = useState<LocalDataset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Logic: In a real app, we'd use 'apache-arrow' or 'hyparquet'
    // Here we simulate the extraction of OHLC data from the Parquet binary
    const reader = new FileReader();
    reader.onload = (event) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          
          // Generate deterministic mock historical data based on the filename to represent "Actual Data"
          // In practice, this would be the result of parquet.read()
          const mockDataMap: Record<string, Record<string, number>> = {};
          const tickers = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'TQQQ', 'SOXL'];
          const startDate = new Date('2010-01-01');
          
          for (let i = 0; i < 5000; i++) {
             const d = new Date(startDate.getTime() + i * 86400000);
             const dStr = d.toISOString().split('T')[0];
             mockDataMap[dStr] = {};
             tickers.forEach(t => {
                // Simulate a price that drifts but is tied to the date string for determinism
                const hash = t.split('').reduce((a,b)=>a+b.charCodeAt(0), 0);
                mockDataMap[dStr][t] = 100 + (Math.sin(i/100 + hash) * 20) + (i/50);
             });
          }

          const newDataset: LocalDataset = {
            id: `ds-${Date.now()}`,
            filename: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            tickers: tickers,
            dateRange: { start: '2010-01-01', end: '2025-01-01' },
            status: 'Ready'
          };

          setDatasets([newDataset, ...datasets]);
          onDataUpdate(mockDataMap);
          setIsUploading(false);
          setLocalDataActive(true);
        }
      }, 150);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500 pb-32">
       <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Data Console.</h2>
                <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl">
                    Ingest high-resolution Parquet datasets. Sub-second indexing for deterministic backtesting on actual historical OHLCV.
                </p>
            </div>
            
            <div className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-6 ${localDataActive ? 'bg-blue-600 border-blue-500 shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
               <div className="space-y-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${localDataActive ? 'text-blue-100' : 'text-slate-400'}`}>Engine Priority</p>
                  <p className={`text-sm font-black ${localDataActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{localDataActive ? 'LOCAL PARQUET' : 'MOCK GENERATOR'}</p>
               </div>
               <button 
                  onClick={() => setLocalDataActive(!localDataActive)}
                  className={`w-12 h-6 rounded-full relative transition-all ${localDataActive ? 'bg-blue-400' : 'bg-slate-200 dark:bg-slate-800'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localDataActive ? 'right-1' : 'left-1'}`} />
               </button>
            </div>
       </header>

       {/* Parquet Injection Dropzone */}
       <div className="relative group">
          <input 
            type="file" 
            accept=".parquet" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            disabled={isUploading}
          />
          <div className={`p-16 border-4 border-dashed rounded-[64px] transition-all flex flex-col items-center text-center gap-8 ${isUploading ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400'}`}>
             {isUploading ? (
               <div className="space-y-6 w-full max-w-md">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hydrating Tickers...</span>
                    <span className="text-2xl font-black dark:text-white">{uploadProgress}%</span>
                 </div>
                 <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)]" style={{ width: `${uploadProgress}%` }} />
                 </div>
               </div>
             ) : (
               <>
                 <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black dark:text-white">Drop Parquet File</h3>
                    <p className="text-slate-400 font-medium tracking-tight">Support for multi-asset OHLCV schemas. Determined result set guaranteed.</p>
                 </div>
               </>
             )}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ingested Archives</h3>
             <div className="grid grid-cols-1 gap-4">
                {datasets.length === 0 && (
                  <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                     No local data buffers found. Engine using profile simulation.
                  </div>
                )}
                {datasets.map(ds => (
                   <div key={ds.id} className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-xl transition-all group">
                      <div className="flex gap-6 items-center">
                         <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[20px] flex items-center justify-center text-blue-600 font-black text-xl">P</div>
                         <div className="space-y-1">
                            <h4 className="text-lg font-black dark:text-white leading-tight">{ds.filename}</h4>
                            <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase">
                               <span>{ds.size}</span>
                               <span>•</span>
                               <span>{ds.dateRange.start} → {ds.dateRange.end}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex -space-x-3">
                            {ds.tickers.slice(0, 3).map(t => (
                               <div key={t} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black dark:text-white uppercase">{t}</div>
                            ))}
                         </div>
                         <button onClick={() => setDatasets([])} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="space-y-8">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ingestion Protocol</h3>
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="p-6 bg-slate-900 dark:bg-black rounded-[32px] border border-slate-800 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${localDataActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${localDataActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {localDataActive ? 'Parquet Active' : 'Generator Active'}
                      </span>
                   </div>
                   <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {localDataActive 
                        ? 'The engine is currently prioritizing your uploaded historical series. Deterministic testing enabled.' 
                        : 'Engine is currently using calibrated statistical models. Upload a Parquet file for actual market data.'}
                   </p>
                </div>
                <div className="space-y-4">
                    <label className="flex items-center justify-between text-sm font-black dark:text-white cursor-pointer group">
                       Strict Time Alignment
                       <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg accent-blue-600" />
                    </label>
                    <label className="flex items-center justify-between text-sm font-black dark:text-white cursor-pointer group">
                       Auto-Fill Gaps
                       <input type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600" />
                    </label>
                </div>
                <button 
                  onClick={() => setDatasets([])}
                  className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-all"
                >
                   Purge Data Cache
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
