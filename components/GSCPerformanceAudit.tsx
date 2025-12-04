import React, { useState } from 'react';
import { mockGscData } from '../gsc-mock-data';
import type { GscPagePerformance, DecayAnalysis, Ctroptimization } from '../types';
import { diagnoseContentDecay, optimizeCTR } from '../services/geminiService';
import { Spinner } from './common/Spinner';

type ModalType = 'decay' | 'ctr';

const AuditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    data: DecayAnalysis | Ctroptimization | null;
    page: GscPagePerformance | null;
    type: ModalType | null;
    isLoading: boolean;
}> = ({ isOpen, onClose, data, page, type, isLoading }) => {
    if (!isOpen) return null;

    const renderDecayContent = (analysis: DecayAnalysis) => (
        <div className="space-y-6">
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center mb-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="font-bold text-amber-900 text-lg">Diagnosis</h4>
                </div>
                <p className="text-amber-800 leading-relaxed">{analysis.decay_reason}</p>
            </div>
            <div className="space-y-4 text-base border-t border-slate-100 pt-4">
                <div>
                     <p className="text-xs font-bold text-slate-400 uppercase">Revision Strategy</p>
                     <p className="text-[#0F172A] font-semibold text-lg mt-1">{analysis.revision_type}</p>
                </div>
                <div>
                     <p className="text-xs font-bold text-slate-400 uppercase">Focus Area</p>
                     <p className="text-slate-700 mt-1">{analysis.revision_focus}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recommended Meta Description</p>
                    <p className="text-slate-700 italic">"{analysis.new_meta_description}"</p>
                </div>
            </div>
        </div>
    );

    const renderCtrContent = (optimizations: Ctroptimization) => (
        <>
            <h4 className="font-bold text-lg text-[#0F172A] mb-4">Optimization Candidates</h4>
            <div className="space-y-4">
                {optimizations.ctr_optimizations.map((item, index) => (
                    <div key={index} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">Option {index + 1}</span>
                        </div>
                        <p className="font-bold text-lg text-[#0F172A] mb-2">{item.new_title}</p>
                        <p className="text-slate-600 text-sm mb-4">{item.new_meta_description}</p>
                         <button className="w-full text-sm font-bold text-white bg-[#2b9e91] hover:bg-[#248c7f] px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                            Apply This Variant
                        </button>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-[#0F172A]">{type === 'decay' ? 'Content Decay Analysis' : 'CTR Optimization'}</h3>
                        <p className="text-sm text-slate-500 truncate mt-1 max-w-md">{page?.url}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow bg-white">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full py-8">
                            <Spinner />
                            <p className="mt-4 text-slate-600 font-medium">Analyzing performance data...</p>
                        </div>
                    )}
                    {data && type === 'decay' && renderDecayContent(data as DecayAnalysis)}
                    {data && type === 'ctr' && renderCtrContent(data as Ctroptimization)}
                </div>
            </div>
        </div>
    );
};

export const GSCPerformanceAudit: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gscData, setGscData] = useState<GscPagePerformance[] | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType | null>(null);
    const [selectedPage, setSelectedPage] = useState<GscPagePerformance | null>(null);
    const [modalContent, setModalContent] = useState<DecayAnalysis | Ctroptimization | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        setError(null);
        setGscData(null);
        setTimeout(() => {
            // Simulate API call and preprocessing
            setGscData(mockGscData);
            setIsConnecting(false);
        }, 1500);
    };

    const openModal = async (page: GscPagePerformance, type: ModalType) => {
        setSelectedPage(page);
        setModalType(type);
        setIsModalOpen(true);
        setIsModalLoading(true);
        setModalContent(null);
        try {
            if (type === 'decay') {
                const result = await diagnoseContentDecay(page);
                setModalContent(result);
            } else {
                const result = await optimizeCTR(page);
                setModalContent(result);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
            setIsModalOpen(false); // Close modal on error
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPage(null);
        setModalType(null);
        setModalContent(null);
    };

    const ChangeIndicator: React.FC<{ value: number; unit: '%' | ' pos' }> = ({ value, unit }) => {
        const isPositive = value > 0;
        const isNegative = value < 0;
        const isGood = unit === '%' ? isPositive : isNegative;
        const isBad = unit === '%' ? isNegative : isPositive;

        const color = isGood ? 'text-emerald-600 bg-emerald-50' : isBad ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50';
        const icon = isGood ? '▲' : isBad ? '▼' : '—';

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-sm ${color}`}>
                <span className="mr-1 text-xs">{icon}</span> {Math.abs(value).toFixed(1)}{unit === '%' ? '%' : ''}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <div className="flex items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-[#2b9e91]/10 rounded-xl">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2b9e91]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-[#0F172A]">Performance Audit</h2>
                        <p className="text-slate-500 text-sm mt-1">Diagnose decay and optimize click-through rates.</p>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl mb-8 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="font-bold">Demo Mode Active</p>
                    <p className="text-sm mt-1 text-blue-700">This view uses sample data. In production, this module securely connects to your Search Console property.</p>
                  </div>
                </div>

                {!gscData && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="inline-flex items-center justify-center bg-[#2b9e91] text-white text-lg font-bold py-3.5 px-8 rounded-xl hover:bg-[#248c7f] disabled:opacity-50 transition-all shadow-lg shadow-[#2b9e91]/30"
                        >
                            {isConnecting ? <Spinner /> : 'Connect Search Console'}
                        </button>
                        {isConnecting && <p className="mt-4 text-slate-500 font-medium">Establishing secure connection...</p>}
                    </div>
                )}
            </div>

            {gscData && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider">Landing Page</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Clicks</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Impressions</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">CTR</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Avg Pos</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Clicks Δ</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Pos Δ</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">AI Analysis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {gscData.map((page) => (
                                    <tr key={page.url} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-semibold text-[#0F172A] max-w-xs truncate border-r border-slate-50" title={page.url}>{page.url}</td>
                                        <td className="p-4 text-slate-600 text-right font-mono">{page.clicks.toLocaleString()}</td>
                                        <td className="p-4 text-slate-600 text-right font-mono">{page.impressions.toLocaleString()}</td>
                                        <td className="p-4 text-slate-600 text-right font-mono">{(page.ctr * 100).toFixed(2)}%</td>
                                        <td className="p-4 text-slate-600 text-right font-mono">{page.position.toFixed(1)}</td>
                                        <td className="p-4 text-right"><ChangeIndicator value={page.clicksChange} unit="%" /></td>
                                        <td className="p-4 text-right"><ChangeIndicator value={page.positionChange} unit=" pos" /></td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => openModal(page, 'decay')} className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors" title="Diagnose Decay">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </button>
                                                <button onClick={() => openModal(page, 'ctr')} className="p-2 text-[#2b9e91] hover:text-[#248c7f] hover:bg-[#2b9e91]/10 rounded-lg transition-colors" title="Optimize CTR">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AuditModal
                isOpen={isModalOpen}
                onClose={closeModal}
                data={modalContent}
                page={selectedPage}
                type={modalType}
                isLoading={isModalLoading}
            />
        </div>
    );
};