import React, { useCallback, useMemo } from 'react';
import type { ContentBrief } from '../types';
import { Spinner } from './common/Spinner';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  brief: ContentBrief | null;
  isLoading: boolean;
}

export const ContentBriefModal: React.FC<ModalProps> = ({ isOpen, onClose, keyword, brief, isLoading }) => {
  const prettyPrintedSchema = useMemo(() => {
    if (!brief?.json_ld_schema) return '';
    try {
      const schemaObj = JSON.parse(brief.json_ld_schema);
      return JSON.stringify(schemaObj, null, 2);
    } catch (e) {
      // If it's not valid JSON, return the raw string
      return brief.json_ld_schema;
    }
  }, [brief]);
  
  const handleCopy = useCallback(() => {
    if (brief) {
      const outlineText = brief.content_outline.map(item => {
        let text = `H2: ${item.h2}`;
        if (item.h3s && item.h3s.length > 0) {
          text += `\n${item.h3s.map(h3 => `  H3: ${h3}`).join('\n')}`;
        }
        return text;
      }).join('\n');

      const textToCopy = `
Title: ${brief.seo_fundamentals.optimized_title}

Meta Description: ${brief.seo_fundamentals.meta_description}

Target Intent Focus: ${brief.seo_fundamentals.target_intent_focus}

---

Content Outline:
${outlineText}

---

Required Semantic Terms:
${brief.required_semantic_terms.join(', ')}

---

JSON-LD Schema:
${prettyPrintedSchema}
      `;
      navigator.clipboard.writeText(textToCopy.trim());
    }
  }, [brief, prettyPrintedSchema]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Content Brief Generator</h2>
            <p className="text-sm text-slate-500 mt-0.5">Target: <span className="font-semibold text-[#2b9e91]">"{keyword}"</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-grow bg-white">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Spinner />
              <p className="mt-4 text-slate-600 font-medium">Generating comprehensive brief...</p>
            </div>
          )}
          {brief && (
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="font-bold text-[#2b9e91] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    SEO Fundamentals
                </h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Title Tag</p>
                        <p className="text-[#0F172A] font-medium mt-1 text-lg">{brief.seo_fundamentals.optimized_title}</p>
                    </div>
                    <div>
                         <p className="text-xs font-bold text-slate-400 uppercase">Meta Description</p>
                         <p className="text-slate-600 mt-1">{brief.seo_fundamentals.meta_description}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Intent Focus</p>
                        <span className="inline-block mt-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold uppercase">{brief.seo_fundamentals.target_intent_focus}</span>
                    </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-4">Content Outline</h3>
                <div className="border-l-2 border-slate-200 pl-6 space-y-6">
                  {brief.content_outline.map((item, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white bg-[#2b9e91]"></div>
                      <p className="font-bold text-[#0F172A] text-lg">{item.h2}</p>
                      {item.h3s && item.h3s.length > 0 && (
                        <ul className="mt-2 space-y-2 ml-1">
                          {item.h3s.map((h3, j) => (
                              <li key={j} className="text-slate-600 flex items-start gap-2">
                                  <span className="text-[#2b9e91] mt-1.5 text-[10px]">●</span>
                                  {h3}
                              </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-3">Semantic Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {brief.required_semantic_terms.map((term, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full border border-slate-200">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

               <div>
                <h3 className="font-bold text-[#0F172A] text-lg mb-3">JSON-LD Schema</h3>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-[#0F172A]">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-3 space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="p-4 pt-10 text-slate-300 text-sm overflow-x-auto font-mono">
                      <code>{prettyPrintedSchema}</code>
                    </pre>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
            <button
              onClick={handleCopy}
              disabled={!brief}
              className="px-6 py-3 bg-[#2b9e91] text-white font-bold rounded-xl hover:bg-[#248c7f] hover:shadow-lg hover:shadow-[#2b9e91]/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
              </svg>
              Copy to Clipboard
            </button>
        </div>
      </div>
    </div>
  );
};