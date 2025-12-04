import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2b9e91] to-[#248c7f] flex items-center justify-center shadow-lg shadow-[#2b9e91]/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Napnox <span className="font-normal text-slate-400">AI Strategist</span>
            </h1>
          </div>
        </div>
        <div className="hidden md:block">
           <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-[#2b9e91] border border-slate-700">
             Powered by Gemini 2.5
           </span>
        </div>
      </div>
    </header>
  );
};