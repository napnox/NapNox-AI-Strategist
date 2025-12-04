import React from 'react';
import type { IntentClarityReport } from '../types';

interface ReportProps {
  data: IntentClarityReport;
  onGenerateBrief: (keyword: string) => void;
}

export const IntentClarityReportTable: React.FC<ReportProps> = ({ data, onGenerateBrief }) => {
  const getClarityColor = (score: number) => {
    if (score > 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score > 40) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
      <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
        <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <div className="ml-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Intent-Clarity Scoring</h2>
            <p className="text-slate-500 text-sm mt-1">Search intent analysis and SERP consistency metrics.</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">Keyword</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">Intent</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">Clarity Score</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider">Suggested Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 group transition-colors">
                <td className="p-4 font-semibold text-[#0F172A]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>{item.keyword}</span>
                      <button onClick={() => onGenerateBrief(item.keyword)} className="text-xs font-bold text-[#2b9e91] bg-[#2b9e91]/10 px-2 py-1 rounded hover:bg-[#2b9e91] hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                          Brief
                      </button>
                  </div>
                </td>
                <td className="p-4 text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {item.gemini_intent_classification}
                    </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getClarityColor(item.intent_clarity_score)}`}>
                    {item.intent_clarity_score}%
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">{item.content_type_suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};