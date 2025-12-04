import React from 'react';
import type { CompetitorAnalysis, CompetitorSummary } from '../types';

interface ReportProps {
  data: CompetitorAnalysis;
}

const CompetitorSummaryCard: React.FC<{ summary: CompetitorSummary }> = ({ summary }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-[#2b9e91]/30 group">
        <h4 className="font-bold text-lg text-[#0F172A] truncate mb-3">
            <a href={summary.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#2b9e91] transition-colors flex items-center gap-1">
                {summary.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
        </h4>
        <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase">Visual Tone</p>
                <p className="text-slate-700 mt-1 text-sm leading-relaxed">{summary.visual_tone}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase">Core Message</p>
                <p className="text-slate-700 mt-1 text-sm leading-relaxed">{summary.core_message}</p>
            </div>
        </div>
    </div>
);

export const CompetitorAnalysisReport: React.FC<ReportProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
       <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
        <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </div>
        <div className="ml-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Multimodal Analysis</h2>
            <p className="text-slate-500 text-sm mt-1">Visual and textual competitor breakdown.</p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.competitor_summaries.map((summary) => (
            <CompetitorSummaryCard key={summary.url} summary={summary} />
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#2b9e91]/20 rounded-full opacity-50 blur-xl"></div>
        <h3 className="text-lg font-bold text-[#0F172A] relative z-10">Collective Gap Analysis</h3>
        <div className="mt-3 relative z-10">
             <p className="text-slate-700 leading-relaxed">{data.collective_content_gaps.analysis}</p>
        </div>

        <div className="mt-6 relative z-10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Opportunity Keywords</h4>
            <div className="flex flex-wrap gap-2">
                {data.collective_content_gaps.gap_keywords.map((keyword, index) => (
                    <span key={index} className="bg-white text-[#2b9e91] text-sm font-bold px-4 py-2 rounded-lg border border-[#2b9e91]/20 shadow-sm">
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};