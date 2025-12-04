import React, { useState } from 'react';
import type { TopicalAuthorityMap, PillarTopic, ClusterSubtopic } from '../types';

interface ReportProps {
  data: TopicalAuthorityMap;
  onGenerateBrief: (keyword: string) => void;
}

const NextStepCard: React.FC<{ nextStep: string }> = ({ nextStep }) => (
    <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3">
        <div className="flex-shrink-0 p-1.5 bg-[#2b9e91]/10 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div>
            <p className="text-xs font-bold text-[#2b9e91] uppercase tracking-wide">Recommended Action</p>
            <p className="mt-1 text-sm md:text-base text-slate-700 font-medium leading-relaxed">{nextStep}</p>
        </div>
    </div>
);

const DifficultyChip: React.FC<{ difficulty: 'Low' | 'Medium' | 'High' }> = ({ difficulty }) => {
    const styles = {
        Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200',
        High: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${styles[difficulty]}`}>
            {difficulty}
        </span>
    );
};

const Cluster: React.FC<{ cluster: ClusterSubtopic, onGenerateBrief: (keyword: string) => void }> = ({ cluster, onGenerateBrief }) => {
  return (
    <div className="ml-2 md:ml-6 pl-4 md:pl-6 border-l-2 border-slate-100 py-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h4 className="font-bold text-[#0F172A] text-lg">{cluster.cluster_name}</h4>
        <DifficultyChip difficulty={cluster.difficulty} />
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keywords</p>
        <div className="space-y-2">
          {cluster.target_keywords.map((kw, i) => (
            <div key={i} className="flex items-center justify-between group bg-white border border-slate-100 rounded-md p-2 hover:border-[#2b9e91] transition-colors">
              <span className="text-slate-600 font-medium text-sm">{kw}</span>
              <button onClick={() => onGenerateBrief(kw)} className="text-xs font-bold text-[#2b9e91] opacity-0 group-hover:opacity-100 transition-opacity bg-[#2b9e91]/10 px-2 py-1 rounded hover:bg-[#2b9e91] hover:text-white">
                  Create Brief
              </button>
            </div>
          ))}
        </div>
        <NextStepCard nextStep={cluster.next_step} />
      </div>
    </div>
  );
};


const Pillar: React.FC<{ pillar: PillarTopic, onGenerateBrief: (keyword: string) => void }> = ({ pillar, onGenerateBrief }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-5 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <h3 className="text-xl font-bold text-[#0F172A]">{pillar.pillar_name}</h3>
        <div className={`p-1 rounded-full transition-transform duration-200 ${isOpen ? 'bg-slate-200 rotate-180' : 'bg-white'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-5 space-y-6 bg-white">
          {pillar.cluster_subtopics.map((cluster, index) => <Cluster key={index} cluster={cluster} onGenerateBrief={onGenerateBrief}/>)}
        </div>
      )}
    </div>
  );
};

export const TopicalAuthorityMapReport: React.FC<ReportProps> = ({ data, onGenerateBrief }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
       <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
        <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
        <div className="ml-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">Topical Authority Map</h2>
            <p className="text-slate-500 text-sm mt-1">Strategic pillar-to-cluster hierarchy for domain expertise.</p>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((pillar, index) => (
          <Pillar key={index} pillar={pillar} onGenerateBrief={onGenerateBrief}/>
        ))}
      </div>
    </div>
  );
};