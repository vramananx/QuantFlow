
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Sidebar - Inputs */}
      <aside className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-2xl z-20 ${isCollapsed ? 'w-0 -translate-x-full lg:w-0 lg:-translate-x-full' : 'w-full lg:w-[420px]'}`}>
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg shadow-blue-500/30">Q</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">QuantFlow</h1>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mt-1">Enterprise Pro</span>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
        
        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          {sidebar}
        </div>
      </aside>

      {/* Floating Toggle Button when Collapsed */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed bottom-8 left-8 z-50 w-16 h-16 bg-slate-900 dark:bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
      </button>

      {/* Main Content - Results */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#fcfdfe] dark:bg-slate-950">
        {/* Mobile Overlay */}
        {!isCollapsed && (
          <div 
            className="lg:hidden absolute inset-0 bg-black/40 backdrop-blur-sm z-10 transition-opacity"
            onClick={() => setIsCollapsed(true)}
          />
        )}
        
        {/* Desktop Quick Toggle */}
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] items-center justify-center text-slate-400 shadow-xl hover:text-blue-600 transition-all hover:translate-x-1 group"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}

        {children}
      </main>
    </div>
  );
};
