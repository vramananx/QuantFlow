
import React from 'react';
import { AssetWeight } from '../types.ts';

interface Props {
  assets: AssetWeight[];
  onChange: (assets: AssetWeight[]) => void;
}

export const PortfolioBuilder: React.FC<Props> = ({ assets, onChange }) => {
  const addAsset = () => {
    onChange([...assets, { ticker: '', weight: 0 }]);
  };

  const removeAsset = (index: number) => {
    onChange(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: keyof AssetWeight, value: string | number) => {
    const newAssets = [...assets];
    if (field === 'weight') {
      newAssets[index].weight = Number(value) / 100;
    } else {
      newAssets[index].ticker = (value as string).toUpperCase();
    }
    onChange(newAssets);
  };

  const distributeEvenly = () => {
     if (assets.length === 0) return;
     const weight = 1.0 / assets.length;
     const newAssets = assets.map(a => ({ ...a, weight }));
     onChange(newAssets);
  };

  const totalWeight = assets.reduce((acc, a) => acc + a.weight, 0) * 100;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {assets.map((asset, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="TICKER"
              className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              value={asset.ticker}
              onChange={(e) => updateAsset(i, 'ticker', e.target.value)}
            />
            <div className="relative flex-1">
              <input
                type="number"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black focus:ring-2 focus:ring-blue-500 focus:outline-none pr-6 dark:text-white"
                value={Math.round(asset.weight * 100)}
                onChange={(e) => updateAsset(i, 'weight', e.target.value)}
              />
              <span className="absolute right-2 top-2 text-slate-400 text-[9px] font-black">%</span>
            </div>
            <button 
              onClick={() => removeAsset(i)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={addAsset}
          className="flex-1 py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all uppercase tracking-widest"
        >
          + Add
        </button>
        <button 
          onClick={distributeEvenly}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-500 hover:text-blue-500 transition-all uppercase tracking-widest"
          title="Auto-Distribute Weights"
        >
          Distribute
        </button>
      </div>
      
      <div className="flex justify-end">
          <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${Math.abs(totalWeight - 100) < 0.1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
             Total: {totalWeight.toFixed(0)}%
          </div>
      </div>
    </div>
  );
};
