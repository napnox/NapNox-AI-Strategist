import React, { useState } from 'react';
import { analyzeBrandVoice } from '../services/geminiService';
import type { BrandVoiceGuide, ToneAttribute } from '../types';
import { Spinner } from './common/Spinner';

const ToneAttributeMeter: React.FC<{ attribute: ToneAttribute }> = ({ attribute }) => (
    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex justify-between items-baseline mb-3">
            <h4 className="text-base font-bold text-[#0F172A]">{attribute.tone}</h4>
            <span className="text-sm font-bold text-[#2b9e91] bg-[#2b9e91]/10 px-2 py-0.5 rounded">{attribute.score}/5</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
                className="bg-gradient-to-r from-[#2b9e91] to-[#3bc4b5] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${attribute.score * 20}%` }}
            ></div>
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{attribute.description}</p>
    </div>
);


const GuideDisplay: React.FC<{ guide: BrandVoiceGuide }> = ({ guide }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 mt-8">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-6">Brand Style Guide</h3>
            <div className="space-y-8">
                <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tone of Voice Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guide.tone_attributes.map(attr => <ToneAttributeMeter key={attr.tone} attribute={attr} />)}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Reading Level</h4>
                        <p className="mt-2 text-[#0F172A] text-xl font-semibold">{guide.target_reading_level}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sentence Structure</h4>
                        <p className="mt-2 text-slate-700 text-lg">{guide.sentence_structure}</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center mb-4">
                         <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                         </div>
                        <h4 className="text-lg font-bold text-[#0F172A]">Forbidden Vocabulary</h4>
                    </div>
                    <div className="flex flex-wrap gap-3 p-6 bg-red-50 rounded-xl border border-red-100">
                        {guide.forbidden_words.length > 0 ? guide.forbidden_words.map(word => (
                            <span key={word} className="bg-white text-red-700 text-sm font-bold px-3 py-1.5 rounded-md border border-red-100 shadow-sm">{word}</span>
                        )) : (
                            <p className="text-slate-600 italic">No specific forbidden words were identified.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BrandVoiceAnalyzer: React.FC = () => {
    const [samples, setSamples] = useState(['', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guide, setGuide] = useState<BrandVoiceGuide | null>(null);

    const handleSampleChange = (index: number, value: string) => {
        const newSamples = [...samples];
        newSamples[index] = value;
        setSamples(newSamples);
    };

    const addSampleInput = () => {
        setSamples([...samples, '']);
    };

    const removeSampleInput = (index: number) => {
        const newSamples = samples.filter((_, i) => i !== index);
        setSamples(newSamples);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const contentSamples = samples.filter(s => s.trim() !== '');
        if (contentSamples.length === 0) return;

        setIsLoading(true);
        setError(null);
        setGuide(null);

        try {
            const joinedSamples = contentSamples.join('\n\n---\n\n');
            const result = await analyzeBrandVoice(joinedSamples);
            setGuide(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-[#0F172A]">Brand Voice Analyzer</h2>
                        <p className="text-slate-500 text-sm mt-1">Define consistency with AI-generated style guides.</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {samples.map((sample, index) => (
                            <div key={index} className="relative group">
                                <label htmlFor={`sample-${index}`} className="block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">
                                    Content Sample {index + 1}
                                </label>
                                <textarea
                                    id={`sample-${index}`}
                                    value={sample}
                                    onChange={(e) => handleSampleChange(index, e.target.value)}
                                    placeholder={`Paste a blog post, article, or other content sample here...`}
                                    rows={6}
                                    className="w-full p-4 text-base bg-white text-[#0F172A] border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b9e91] focus:border-[#2b9e91] transition-all placeholder:text-slate-400"
                                />
                                {samples.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSampleInput(index)}
                                        className="absolute top-9 right-3 text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                        aria-label="Remove sample"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 justify-between items-center pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={addSampleInput}
                            className="text-sm font-bold text-[#2b9e91] hover:text-[#248c7f] flex items-center gap-1 py-2 px-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                            Add another sample
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || samples.every(s => s.trim() === '')}
                            className="flex items-center justify-center bg-[#2b9e91] text-white text-lg font-bold py-3 px-8 rounded-xl hover:bg-[#248c7f] hover:shadow-lg hover:shadow-[#2b9e91]/30 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
                        >
                            {isLoading ? <Spinner /> : 'Analyze Voice'}
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

            {isLoading && !guide && (
                 <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Spinner />
                    <p className="mt-6 text-xl font-semibold text-[#0F172A]">Analyzing Content...</p>
                    <p className="text-slate-500 mt-2">Gemini is distilling your brand essence.</p>
                </div>
            )}

            {guide && <GuideDisplay guide={guide} />}
        </div>
    );
};