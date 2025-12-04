import React, { useState } from 'react';
import { generateInternalLinks } from '../services/geminiService';
import type { InternalLinkSuggestion } from '../types';
import { Spinner } from './common/Spinner';

export const InternalLinkArchitect: React.FC = () => {
    const [targetArticle, setTargetArticle] = useState('');
    const [sourceIndex, setSourceIndex] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[] | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetArticle.trim() || !sourceIndex.trim()) return;

        setIsLoading(true);
        setError(null);
        setSuggestions(null);

        try {
            const result = await generateInternalLinks(targetArticle, sourceIndex);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const placeholderSourceIndex = `https://example.com/blog/what-is-seo - What is SEO?
https://example.com/blog/keyword-research - Ultimate Guide to Keyword Research
https://example.com/blog/on-page-seo - On-Page SEO Checklist`;
    
    const labelStyles = "block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide";
    const textareaStyles = "w-full p-4 text-base bg-white text-[#0F172A] border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b9e91] focus:border-[#2b9e91] transition placeholder:text-slate-400";

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                 <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-[#0F172A]">Internal Link Architect</h2>
                        <p className="text-slate-500 text-sm mt-1">Automated semantic linking structure.</p>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-5 rounded-xl mb-8">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      Data Source Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-1 text-blue-700">
                    <li>Locate your website's sitemap (e.g., <strong>sitemap.xml</strong>).</li>
                    <li>Copy the list of URLs you want to link TO.</li>
                    <li>Paste them below in the format: <strong>URL - Title</strong> (optional title helps context).</li>
                  </ol>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="targetArticle" className={labelStyles}>Target Article Content</label>
                        <textarea
                            id="targetArticle"
                            value={targetArticle}
                            onChange={(e) => setTargetArticle(e.target.value)}
                            placeholder="Paste the full content of the new article that needs internal links..."
                            rows={10}
                            className={textareaStyles}
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="sourceIndex" className={labelStyles}>Source Article Index</label>
                        <textarea
                            id="sourceIndex"
                            value={sourceIndex}
                            onChange={(e) => setSourceIndex(e.target.value)}
                            placeholder={placeholderSourceIndex}
                            rows={8}
                            className={textareaStyles}
                            required
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !targetArticle.trim() || !sourceIndex.trim()}
                            className="w-full flex items-center justify-center bg-[#2b9e91] text-white text-lg font-bold py-3.5 px-6 rounded-xl hover:bg-[#248c7f] hover:shadow-lg hover:shadow-[#2b9e91]/30 focus:outline-none focus:ring-4 focus:ring-[#2b9e91]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                        >
                            {isLoading ? <Spinner /> : 'Architect Links'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {isLoading && !suggestions && (
                 <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Spinner />
                    <p className="mt-6 text-xl font-semibold text-[#0F172A]">Constructing Graph...</p>
                    <p className="text-slate-500 mt-2">Gemini is identifying semantic bridges.</p>
                </div>
            )}

            {suggestions && (
                 <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-8">Link Suggestions</h3>
                    <div className="space-y-6">
                        {suggestions.map((link, index) => (
                            <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group hover:border-[#2b9e91]/30 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#2b9e91]"></div>
                                <p className="text-slate-500 text-sm uppercase font-bold tracking-wide mb-2">Context Match</p>
                                <p className="text-[#0F172A] text-lg leading-relaxed mb-4">
                                    ...{link.contextual_snippet.split(link.suggested_anchor_text)[0]}
                                    <span className="bg-[#2b9e91]/10 text-[#2b9e91] font-bold px-1 rounded mx-0.5 border border-[#2b9e91]/20">{link.suggested_anchor_text}</span>
                                    {link.contextual_snippet.split(link.suggested_anchor_text)[1]}...
                                </p>
                                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    <a href={link.source_url_to_link_from} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#2b9e91] truncate transition-colors">
                                        {link.source_url_to_link_from}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};