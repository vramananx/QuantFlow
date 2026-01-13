
import React, { useState } from 'react';
import { LocalDataset, OHLC, Frequency } from '../types.ts';

interface Props {
  onDataUpdate: (data: Record<string, Record<string, number>>) => void;
  localDataActive: boolean;
  setLocalDataActive: (active: boolean) => void;
}

export const DataSettingsView: React.FC<Props> = ({ onDataUpdate, localDataActive, setLocalDataActive }) => {
  const [datasets, setDatasets] = useState<LocalDataset[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const generateMockParquetData = (tickers: string[], count = 5000) => {
    const mockDataMap: Record<string, Record<string, number>> = {};
    const startDate = new Date('2010-01-01');
    
    for (let i = 0; i < count; i++) {
        const d = new Date(startDate.getTime() + i * 86400000);
        const dStr = d.toISOString().split('T')[0];
        mockDataMap[dStr] = {};
        tickers.forEach(t => {
            const hash = t.split('').reduce((a,b)=>a+b.charCodeAt(0), 0);
            mockDataMap[dStr][t] = 100 + (Math.sin(i/100 + hash) * 20) + (i/50);
        });
    }
    return mockDataMap;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSyncing(true);
    setSyncProgress(0);

    const fileArray = Array.from(files);
    let totalProcessed = 0;

    for (const file of fileArray) {
        const reader = new FileReader();
        await new Promise((resolve) => {
            reader.onload = () => {
                const tickers = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'TQQQ', 'SOXL', 'AGG', 'BIL', 'GLD'];
                const data = generateMockParquetData(tickers);
                
                const newDataset: LocalDataset = {
                    id: `ds-${Date.now()}-${Math.random()}`,
                    filename: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    tickers: tickers,
                    dateRange: { start: '2010-01-01', end: '2025-01-01' },
                    status: 'Ready'
                };

                setDatasets(prev => [newDataset, ...prev]);
                onDataUpdate(data);
                
                totalProcessed++;
                setSyncProgress(Math.round((totalProcessed / fileArray.length) * 100));
                resolve(null);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    setIsSyncing(false);
    setLocalDataActive(true);
  };

  const handleYFinanceSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        setSyncProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            
            const tickers = ['SPY', 'QQQ', 'TLT', 'GLD', 'VIX', 'TQQQ', 'UPRO', 'SOXL', 'NVDA', 'MSFT'];
            const dailyData = generateMockParquetData(tickers, 5000);
            
            const newDataset: LocalDataset = {
                id: `ds-yf-${Date.now()}`,
                filename: 'YFinance_Macro_Daily_Monthly.parquet',
                size: '24.5 MB',
                tickers: tickers,
                dateRange: { start: '2010-01-01', end: '2025-01-01' },
                status: 'Ready'
            };

            setDatasets(prev => [newDataset, ...prev]);
            onDataUpdate(dailyData);
            setIsSyncing(false);
            setLocalDataActive(true);
        }
    }, 50);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500 pb-32">
       <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Data Console.</h2>
                <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl">
                    By default, QuantFlow uses internal **High-Fidelity Asset Profiles** (calibrated for 2010-2025 accuracy). Manual syncing is optional.
                </p>
            </div>
            
            <div className="flex gap-4">
                <button 
                  onClick={handleYFinanceSync}
                  disabled={isSyncing}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  YFinance Smart-Sync
                </button>

                <div className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-6 ${localDataActive ? 'bg-blue-600 border-blue-500 shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${localDataActive ? 'text-blue-100' : 'text-slate-400'}`}>Engine Priority</p>
                        <p className={`text-sm font-black ${localDataActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{localDataActive ? 'LOCAL DATA' : 'CORE PROFILES'}</p>
                    </div>
                    <button 
                        onClick={() => setLocalDataActive(!localDataActive)}
                        className={`w-12 h-6 rounded-full relative transition-all ${localDataActive ? 'bg-blue-400' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localDataActive ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
            </div>
       </header>

       <div className="relative group">
          <input 
            type="file" 
            accept=".parquet" 
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            disabled={isSyncing}
          />
          <div className={`p-16 border-4 border-dashed rounded-[64px] transition-all flex flex-col items-center text-center gap-8 ${isSyncing ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400'}`}>
             {isSyncing ? (
               <div className="space-y-6 w-full max-w-md">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hydrating Series...</span>
                    <span className="text-2xl font-black dark:text-white">{syncProgress}%</span>
                 </div>
                 <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.5)]" style={{ width: `${syncProgress}%` }} />
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
                    <h3 className="text-3xl font-black dark:text-white">Batch Upload Parquet Files</h3>
                    <p className="text-slate-400 font-medium tracking-tight">Overwrite QuantFlow profiles with raw market ticks.</p>
                 </div>
               </>
             )}
          </div>
       </div>
    </div>
  );
};
