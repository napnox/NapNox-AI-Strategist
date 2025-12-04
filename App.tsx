import React, { useState, useCallback } from 'react';
import { InputForm, type FormData } from './components/InputForm';
import { TopicalAuthorityMapReport } from './components/TopicalAuthorityMapReport';
import { IntentClarityReportTable } from './components/IntentClarityReportTable';
import { CompetitorAnalysisReport } from './components/CompetitorAnalysisReport';
import { ContentBriefModal } from './components/ContentBriefModal';
import { BrandVoiceAnalyzer } from './components/BrandVoiceAnalyzer';
import { VideoBriefGenerator } from './components/VideoBriefGenerator';
import { GSCPerformanceAudit } from './components/GSCPerformanceAudit';
import { InternalLinkArchitect } from './components/InternalLinkArchitect';
import { ContentAuditor } from './components/ContentAuditor';
import { Spinner } from './components/common/Spinner';
import type { TopicalAuthorityMap, IntentClarityReport, CompetitorAnalysis, ContentBrief } from './types';
import { 
  generateTopicalAuthorityMap,
  generateIntentClarityReport,
  analyzeCompetitorContent,
  generateContentBrief
} from './services/geminiService';

export type Tab = 'strategist' | 'brand' | 'video' | 'auditor' | 'gsc' | 'linking';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('strategist');

  const [topicalMap, setTopicalMap] = useState<TopicalAuthorityMap | null>(null);
  const [intentReport, setIntentReport] = useState<IntentClarityReport | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);

  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [briefKeyword, setBriefKeyword] = useState<string | null>(null);
  const [briefContent, setBriefContent] = useState<ContentBrief | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setTopicalMap(null);
    setIntentReport(null);
    setCompetitorAnalysis(null);
    setCurrentFormData(formData);

    try {
      const promises: Promise<any>[] = [
        generateTopicalAuthorityMap(formData),
        generateIntentClarityReport(formData),
      ];

      if (formData.competitorUrls[0] && formData.competitorScreenshots.length > 0) {
        promises.push(analyzeCompetitorContent(formData.competitorUrls, formData.competitorScreenshots, formData.region));
      }

      const results = await Promise.all(promises);
      
      setTopicalMap(results[0]);
      setIntentReport(results[1]);
      if (results.length > 2) {
        setCompetitorAnalysis(results[2]);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateBrief = useCallback(async (keyword: string) => {
    if (!currentFormData && activeTab !== 'strategist') {
      setError("Brief generation context is tied to the main SEO Strategist report. Please run a report there first.");
      return;
    }
    const region = currentFormData ? currentFormData.region : "United States (English)";

    setBriefKeyword(keyword);
    setIsBriefModalOpen(true);
    setIsBriefLoading(true);
    setBriefContent(null);
    try {
      const brief = await generateContentBrief(keyword, region);
      setBriefContent(brief);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? `Failed to generate brief: ${err.message}`: 'An unknown error occurred while generating the brief.');
    } finally {
      setIsBriefLoading(false);
    }
  }, [currentFormData, activeTab]);

  const closeBriefModal = () => {
    setIsBriefModalOpen(false);
    setBriefKeyword(null);
    setBriefContent(null);
  };
  
  const renderTabButton = (tabId: Tab, title: string) => (
      <button
          onClick={() => setActiveTab(tabId)}
          className={`${
              activeTab === tabId
                  ? 'bg-[#2b9e91] text-white shadow-md shadow-[#2b9e91]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#2b9e91]'
          } whitespace-nowrap py-2 px-4 md:px-5 text-sm md:text-base font-semibold rounded-full transition-all duration-200`}
      >
          {title}
      </button>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'brand':
        return <BrandVoiceAnalyzer />;
      case 'video':
        return <VideoBriefGenerator />;
      case 'auditor':
        return <ContentAuditor />;
       case 'gsc':
        return <GSCPerformanceAudit />;
      case 'linking':
        return <InternalLinkArchitect />;
      case 'strategist':
      default:
        return (
          <>
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <Spinner />
                <p className="mt-6 text-xl font-semibold text-[#0F172A]">Generating AI Strategy...</p>
                <p className="text-slate-500 mt-2">This may take a moment. Gemini is analyzing the topic in depth.</p>
              </div>
            )}
            <div className="mt-8 space-y-8">
              {topicalMap && <TopicalAuthorityMapReport data={topicalMap} onGenerateBrief={handleGenerateBrief} />}
              {intentReport && <IntentClarityReportTable data={intentReport} onGenerateBrief={handleGenerateBrief} />}
              {competitorAnalysis && <CompetitorAnalysisReport data={competitorAnalysis} />}
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container mx-auto p-4 md:p-8 max-w-7xl">
        
        <div className="mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center gap-4">
            <div className="flex items-center gap-3 px-3 min-w-fit pt-2 lg:pt-0 pb-2 lg:pb-0">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2b9e91] to-[#248c7f] flex items-center justify-center shadow-lg shadow-[#2b9e91]/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight whitespace-nowrap">
                Napnox <span className="font-normal text-slate-400">AI Strategist</span>
              </h1>
            </div>

            <div className="hidden lg:block w-px h-8 bg-slate-200"></div>

            <nav className="flex space-x-1 overflow-x-auto no-scrollbar p-1 w-full" aria-label="Tabs">
                {renderTabButton('strategist', 'SEO Strategist')}
                {renderTabButton('brand', 'Brand Voice')}
                {renderTabButton('video', 'Video Briefs')}
                {renderTabButton('auditor', 'Content Audit')}
                {renderTabButton('gsc', 'GSC Audit')}
                {renderTabButton('linking', 'Link Architect')}
            </nav>
        </div>
        
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative shadow-sm" role="alert">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-red-400 hover:text-red-600" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}

        {renderActiveTab()}

      </main>
      
      {isBriefModalOpen && (
        <ContentBriefModal
          isOpen={isBriefModalOpen}
          onClose={closeBriefModal}
          keyword={briefKeyword || ''}
          brief={briefContent}
          isLoading={isBriefLoading}
        />
      )}
    </div>
  );
};

export default App;