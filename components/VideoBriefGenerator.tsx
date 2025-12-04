import React, { useState } from 'react';
import { generateVideoBrief } from '../services/geminiService';
import type { VideoBrief } from '../types';
import { Spinner } from './common/Spinner';

export const VideoBriefGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [platformType, setPlatformType] = useState<'long' | 'short'>('long');
    const [videoLength, setVideoLength] = useState('1-5 minutes');
    const [generateScript, setGenerateScript] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [brief, setBrief] = useState<VideoBrief | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsLoading(true);
        setError(null);
        setBrief(null);

        try {
            const params = { topic, platformType, videoLength, keywords, generateScript };
            const result = await generateVideoBrief(params);
            setBrief(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputStyles = "w-full text-base px-4 py-3 bg-white text-[#0F172A] border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b9e91] focus:border-[#2b9e91] transition-all";
    const labelStyles = "block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide";

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                 <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-[#0F172A]">Video Strategist</h2>
                        <p className="text-slate-500 text-sm mt-1">Generate engagement-focused briefs and scripts.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-4">
                        <label htmlFor="videoTopic" className={labelStyles}>Content Topic</label>
                        <input
                            type="text"
                            id="videoTopic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Off-Road Racing Games Mod APKs"
                            className={inputStyles}
                            required
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label htmlFor="keywords" className={labelStyles}>Target Keywords (optional)</label>
                        <input
                            type="text"
                            id="keywords"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g., best modded games, free racing apk, android game mods"
                            className={inputStyles}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="platformType" className={labelStyles}>Platform Type</label>
                        <select
                            id="platformType"
                            value={platformType}
                            onChange={(e) => setPlatformType(e.target.value as 'long' | 'short')}
                            className={inputStyles}
                        >
                            <option value="long">Long-form Video (e.g., YouTube)</option>
                            <option value="short">Short-form Video (e.g., TikTok, Shorts)</option>
                        </select>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="videoLength" className={labelStyles}>Target Video Length</label>
                        <select
                            id="videoLength"
                            value={videoLength}
                            onChange={(e) => setVideoLength(e.target.value)}
                            className={inputStyles}
                        >
                            <option value="< 1 minute">&lt; 1 minute</option>
                            <option value="1-5 minutes">1-5 minutes</option>
                            <option value="5-10 minutes">5-10 minutes</option>
                            <option value="10+ minutes">10+ minutes</option>
                        </select>
                    </div>
                    <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="generateScript"
                                checked={generateScript}
                                onChange={(e) => setGenerateScript(e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-[#2b9e91] focus:ring-[#2b9e91] cursor-pointer"
                            />
                            <label htmlFor="generateScript" className="ml-3 block text-base font-semibold text-[#0F172A] cursor-pointer">
                               Generate full video script?
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !topic.trim()}
                            className="w-full flex items-center justify-center bg-[#2b9e91] text-white text-lg font-bold py-3.5 px-6 rounded-xl hover:bg-[#248c7f] hover:shadow-lg hover:shadow-[#2b9e91]/30 focus:outline-none focus:ring-4 focus:ring-[#2b9e91]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                        >
                            {isLoading ? <Spinner /> : 'Generate Assets'}
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

            {isLoading && !brief && (
                 <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Spinner />
                    <p className="mt-6 text-xl font-semibold text-[#0F172A]">Scripting in progress...</p>
                    <p className="text-slate-500 mt-2">Gemini is directing your next viral video.</p>
                </div>
            )}

            {brief && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-8 border-b border-slate-100 pb-4">Video Assets: <span className="text-[#2b9e91]">"{topic}"</span></h3>
                    <div className="space-y-8 text-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-[#0F172A] text-lg mb-3 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-[#2b9e91] rounded-full"></span>
                                    Title Ideas
                                </h4>
                                <ul className="list-none space-y-3">
                                    {brief.video_title_ideas.map((title, i) => (
                                        <li key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-medium text-slate-700 text-base hover:border-[#2b9e91]/30 transition-colors">{title}</li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-bold text-[#0F172A] text-lg mb-3 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                    Thumbnail Concept
                                </h4>
                                 <p className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-slate-700 text-base leading-relaxed">{brief.suggested_thumbnail_elements}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#0F172A] text-lg mb-3 flex items-center gap-2">
                                 <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                The Hook (0:00 - 0:15)
                            </h4>
                            <div className="p-5 bg-slate-900 rounded-xl text-white shadow-lg">
                                <p className="text-lg italic font-serif opacity-90">"{brief.video_hook_script}"</p>
                            </div>
                        </div>

                         <div>
                            <h4 className="font-bold text-[#0F172A] text-lg mb-3 flex items-center gap-2">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                Structure
                            </h4>
                            <div className="space-y-2">
                                {brief.main_segments.map((segment, i) => (
                                    <div key={i} className="p-4 bg-white rounded-lg flex justify-between items-center border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                                            <p className="font-bold text-[#0F172A] text-base">{segment.segment_title}</p>
                                        </div>
                                        <span className="text-sm font-bold text-[#2b9e91] bg-[#2b9e91]/10 px-2 py-1 rounded">{segment.estimated_duration_seconds}s</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {brief.full_video_script && (
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h4 className="font-bold text-[#0F172A] text-2xl mb-6">Full Script</h4>
                                <div className="space-y-6">
                                    {brief.full_video_script.map((scene, i) => (
                                        <div key={i} className="group">
                                            <div className="flex items-baseline gap-3 mb-2">
                                                <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Scene {i + 1}</span>
                                                <p className="font-bold text-[#0F172A] text-lg">{scene.scene_title}</p>
                                            </div>
                                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 group-hover:border-[#2b9e91]/30 transition-colors">
                                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{scene.script_and_visuals}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};