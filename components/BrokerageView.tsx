
import React, { useState, useEffect } from 'react';
import { Order } from '../types.ts';

interface Props {
  isPaperTrading: boolean;
}

export const BrokerageView: React.FC<Props> = ({ isPaperTrading }) => {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-INIT', ticker: 'SPY', action: 'BUY', price: 480.20, quantity: 10, timestamp: '2025-01-19 09:30:00', status: 'FILLED' }
  ]);

  useEffect(() => {
    if (!isPaperTrading) return;
    
    // Simulating the arrival of new orders from the live engine
    const interval = setInterval(() => {
      const tickers = ['AAPL', 'TSLA', 'NVDA', 'QQQ', 'TQQQ'];
      const randomTicker = tickers[Math.floor(Math.random() * tickers.length)];
      const newOrder: Order = {
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ticker: randomTicker,
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        price: 100 + Math.random() * 500,
        quantity: Math.floor(Math.random() * 50) + 1,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'FILLED'
      };
      setOrders(prev => [newOrder, ...prev.slice(0, 19)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaperTrading]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
       <header className="flex justify-between items-end">
            <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Brokerage API.</h2>
                <p className="text-xl text-slate-400 dark:text-slate-500 font-medium max-w-2xl">
                    Live paper-trading execution logs. Active Strategy Forge nodes are currently streaming signals to this buffer.
                </p>
            </div>
            <div className={`px-8 py-4 rounded-[24px] border-2 transition-all ${isPaperTrading ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
               <span className="text-[10px] font-black uppercase tracking-widest">{isPaperTrading ? 'LIVE STREAM ACTIVE' : 'ENGINE IDLE'}</span>
            </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
             <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[56px] shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 dark:border-slate-800">
                   <h3 className="text-2xl font-black dark:text-white">Execution Journal</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                           <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                           <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                           <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Price</th>
                           <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         {orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-in slide-in-from-left-2">
                               <td className="p-6">
                                  <p className="text-sm font-black dark:text-white">{o.id}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">{o.timestamp}</p>
                               </td>
                               <td className="p-6">
                                  <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase ${o.action === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{o.action} {o.quantity} {o.ticker}</span>
                               </td>
                               <td className="p-6 text-sm font-black dark:text-white">${o.price.toFixed(2)}</td>
                               <td className="p-6">
                                  <span className="text-[10px] font-black uppercase text-emerald-500">{o.status}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <div className="space-y-10">
             <div className="bg-slate-900 dark:bg-black p-10 rounded-[56px] border border-slate-800 space-y-6 shadow-xl">
                <h3 className="text-xl font-black text-white tracking-tight">System Latency</h3>
                <div className="space-y-4">
                   <div className="flex justify-between p-4 bg-slate-800/50 rounded-2xl">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Signal Generation</span>
                      <span className="text-xs font-black text-blue-400 uppercase">2.4ms</span>
                   </div>
                   <div className="flex justify-between p-4 bg-slate-800/50 rounded-2xl">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Order Routing</span>
                      <span className="text-xs font-black text-emerald-400 uppercase">1.1ms</span>
                   </div>
                </div>
             </div>
             
             <div className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[56px] space-y-4 shadow-sm">
                <h4 className="text-lg font-black dark:text-white">API Connectivity</h4>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: IBKR Webhook</span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                   Virtual execution is calculated using the midpoint of the current bid/ask spread provided by the Parquet data stream or Mock generator.
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};
