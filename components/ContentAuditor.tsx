import React, { useState } from 'react';
import { generateContentAudit } from '../services/geminiService';
import type { AuditReport } from '../types';
import { Spinner } from './common/Spinner';

// Sub-component for displaying the report
const ReportDisplay: React.FC<{ report: AuditReport }> = ({ report }) => {
    // Status color helper
    const getStatusColor = (status: 'Pass' | 'Fail' | 'Warning') => {
        switch (status) {
            case 'Pass': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Fail': return 'bg-red-100 text-red-700 border-red-200';
            case 'Warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    
    // Sentiment color helper
    const getSentimentClasses = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case 'excellent': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
            case 'good': return 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm';
            case 'fair': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
            case 'poor': return 'bg-red-50 text-red-700 border-red-200 shadow-sm';
            default: return 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm';
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-[#0F172A]">{report.audit_title}</h3>
                    <p className="text-slate-500 mt-1">Comprehensive SEO & Content Audit</p>
                </div>
                <div className={`px-5 py-2 rounded-xl text-lg font-bold border ${getSentimentClasses(report.summary_sentiment)}`}>
                    {report.summary_sentiment}
                </div>
            </div>

            {/* Core Metrics */}
            <div className="mb-10">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Core Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold text-slate-500 uppercase">Word Count</p>
                        <p className="text-4xl font-bold text-[#0F172A] mt-2">{report.core_metrics.word_count}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold text-slate-500 uppercase">Readability</p>
                        <p className="text-4xl font-bold text-[#0F172A] mt-2">{report.core_metrics.readability_score_flesch.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">Flesch-Kincaid</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold text-slate-500 uppercase">Focus Keyword</p>
                        <p className="text-2xl font-bold text-[#0F172A] mt-2 text-center leading-tight">{report.core_metrics.primary_keyword}</p>
                    </div>
                </div>
            </div>

            {/* On-Page Review */}
            <div className="mb-10">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">On-Page Checklist</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider">Element</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider">Recommendation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {report.on_page_review.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-[#0F172A]">{item.element}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-700 leading-relaxed">{item.recommendation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Keyword & Gap Analysis */}
            <div>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Gap Analysis</h4>
                 <div className="space-y-4">
                    {report.keyword_and_gap_analysis.map((item, index) => (
                        <div key={index} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#2b9e91]/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-lg text-[#0F172A] group-hover:text-[#2b9e91] transition-colors">{item.keyword_phrase}</h5>
                                <div className="flex items-center gap-0.5" title={`Relevance Score: ${item.relevance_score}/5`}>
                                    {[...Array(5)].map((_, i) => (
                                         <div key={i} className={`w-1.5 h-6 rounded-full ${i < item.relevance_score ? 'bg-[#2b9e91]' : 'bg-slate-200'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{item.notes}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export const ContentAuditor: React.FC = () => {
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<AuditReport | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !keyword.trim()) return;

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await generateContentAudit(content, keyword);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const labelStyles = "block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide";
    const inputStyles = "w-full text-base px-4 py-3 bg-white text-[#0F172A] border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b9e91] focus:border-[#2b9e91] transition placeholder:text-slate-400";

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-[#0F172A]">Content Auditor</h2>
                        <p className="text-slate-500 text-sm mt-1">Detailed SEO scoring and optimization.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="primaryKeyword" className={labelStyles}>
                            Primary Keyword <span className="text-[#2b9e91]">*</span>
                        </label>
                        <input
                            type="text"
                            id="primaryKeyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            required
                            placeholder="e.g., sustainable urban gardening tips"
                            className={inputStyles}
                        />
                    </div>
                     <div>
                        <label htmlFor="articleContent" className={labelStyles}>
                            Article Content <span className="text-[#2b9e91]">*</span>
                        </label>
                        <textarea
                            id="articleContent"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your full article content here..."
                            rows={15}
                            className={inputStyles}
                            required
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !content.trim() || !keyword.trim()}
                            className="w-full flex items-center justify-center bg-[#2b9e91] text-white text-lg font-bold py-3.5 px-6 rounded-xl hover:bg-[#248c7f] hover:shadow-lg hover:shadow-[#2b9e91]/30 focus:outline-none focus:ring-4 focus:ring-[#2b9e91]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                        >
                            {isLoading ? <Spinner /> : 'Run Audit'}
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

            {isLoading && !report && (
                 <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Spinner />
                    <p className="mt-6 text-xl font-semibold text-[#0F172A]">Auditing Content...</p>
                    <p className="text-slate-500 mt-2">Atlas is checking your work against live search data.</p>
                </div>
            )}

            {report && <ReportDisplay report={report} />}
        </div>
    );
};