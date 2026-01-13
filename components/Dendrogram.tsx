import React from 'react';

interface Props {
  assets: string[];
}

export const Dendrogram: React.FC<Props> = ({ assets }) => {
  // Mock hierarchy for visualization
  // In a real app, this would be computed via linkage clustering on a correlation matrix
  return (
    <div className="relative w-full h-48 flex items-center justify-center p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 160" className="overflow-visible">
        {/* Connection Lines */}
        <path d="M 50 140 L 50 80 L 150 80 L 150 140" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 250 140 L 250 100 L 350 100 L 350 140" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 100 80 L 100 40 L 300 40 L 300 100" fill="none" stroke="#2563eb" strokeWidth="3" />
        <line x1="200" y1="0" x2="200" y2="40" stroke="#2563eb" strokeWidth="3" />

        {/* Labels */}
        {assets.slice(0, 5).map((asset, i) => (
          <g key={asset} transform={`translate(${50 + i * 75}, 155)`}>
            <text textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-tighter">{asset}</text>
          </g>
        ))}

        {/* Nodes */}
        <circle cx="100" cy="80" r="4" className="fill-slate-600" />
        <circle cx="300" cy="100" r="4" className="fill-slate-600" />
        <circle cx="200" cy="40" r="6" className="fill-blue-600 shadow-xl" />
      </svg>
      <div className="absolute top-0 right-0 bg-blue-600/10 border border-blue-600/20 px-3 py-1 rounded-full">
         <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Cluster Logic: Ward Linkage</span>
      </div>
    </div>
  );
};