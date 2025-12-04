import React, { useState, useEffect } from 'react';
import { TARGET_REGIONS, TARGET_AUDIENCES } from '../constants';
import { Spinner } from './common/Spinner';

export interface FormData {
  seedTopic: string;
  targetAudience: string;
  competitorUrls: string[];
  region: string;
  competitorScreenshots: string[];
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const MAX_GENERATIONS = 3;

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    seedTopic: '',
    targetAudience: TARGET_AUDIENCES[0],
    competitorUrls: [''],
    region: TARGET_REGIONS[0].name,
    competitorScreenshots: [],
  });
  const [screenshotNames, setScreenshotNames] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const storedUsage = localStorage.getItem('napnoxUsage_strategist');
    setUsageCount(storedUsage ? parseInt(storedUsage, 10) : 0);
  }, []);

  const hasGenerationsLeft = usageCount < MAX_GENERATIONS;

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.competitorUrls];
    newUrls[index] = value;
    setFormData({ ...formData, competitorUrls: newUrls });
  };

  const addUrlInput = () => {
    if (formData.competitorUrls.length < 5) {
      setFormData({ ...formData, competitorUrls: [...formData.competitorUrls, ''] });
    }
  };

  const removeUrlInput = (index: number) => {
    const newUrls = formData.competitorUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, competitorUrls: newUrls });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAudienceChange = (audience: string) => {
    setFormData({ ...formData, targetAudience: audience });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = [...e.target.files].slice(0, 10);
      const fileNames = files.map(f => f.name);
      setScreenshotNames(fileNames);
      
      const base64Promises = files.map(fileToBase64);
      const base64Strings = await Promise.all(base64Promises);
      setFormData({ ...formData, competitorScreenshots: base64Strings });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.seedTopic.trim() && hasGenerationsLeft) {
      const submittedData = {
        ...formData,
        competitorUrls: formData.competitorUrls.filter(url => url.trim() !== '')
      }
      onSubmit(submittedData);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('napnoxUsage_strategist', newCount.toString());
    }
  };
  
  const inputStyles = "w-full text-base md:text-lg px-4 py-3 bg-white text-[#0F172A] border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b9e91] focus:border-[#2b9e91] transition-all placeholder:text-slate-400";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 card-hover-effect">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div>
          <label htmlFor="seedTopic" className="block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">
            Seed Topic / Keyword <span className="text-[#2b9e91]">*</span>
          </label>
          <input
            type="text"
            id="seedTopic"
            name="seedTopic"
            value={formData.seedTopic}
            onChange={handleChange}
            required
            placeholder="e.g., Sustainable Gardening for Urban Balconies"
            className={inputStyles}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3 uppercase tracking-wide">
                Target Audience
              </label>
              <div className="flex flex-wrap gap-2.5">
                 {TARGET_AUDIENCES.slice(0, 5).map(audience => (
                    <button
                        type="button"
                        key={audience}
                        onClick={() => handleAudienceChange(audience)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all border ${
                            formData.targetAudience === audience
                                ? 'bg-[#2b9e91] text-white border-[#2b9e91] shadow-md shadow-[#2b9e91]/20'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#2b9e91] hover:text-[#2b9e91]'
                        }`}
                    >
                        {audience}
                    </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="region" className="block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">
                Target Region / Language <span className="text-[#2b9e91]">*</span>
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className={inputStyles}
              >
                {TARGET_REGIONS.map(region => <option key={region.code} value={region.name}>{region.name}</option>)}
              </select>
            </div>
        </div>
        
         <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3 uppercase tracking-wide">
                Competitor URLs <span className="text-slate-400 font-normal text-xs normal-case ml-1">(Optional, Max 5)</span>
              </label>
              <div className="space-y-3">
              {formData.competitorUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3">
                       <input
                          type="url"
                          value={url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          placeholder="https://example.com/blog/post"
                          className={inputStyles}
                        />
                        {formData.competitorUrls.length > 1 && (
                          <button type="button" onClick={() => removeUrlInput(index)} className="p-3 text-slate-400 hover:text-red-500 rounded-xl bg-slate-50 hover:bg-red-50 transition border border-slate-200">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                          </button>
                        )}
                  </div>
              ))}
              </div>
              {formData.competitorUrls.length < 5 && (
                  <button type="button" onClick={addUrlInput} className="mt-3 text-sm font-bold text-[#2b9e91] hover:text-[#248c7f] py-2 px-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                    Add another URL
                  </button>
              )}
        </div>
         <div>
              <label htmlFor="competitorScreenshot" className="block text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">
                Competitor Screenshots <span className="text-slate-400 font-normal text-xs normal-case ml-1">(Max 10)</span>
              </label>
              <label className={`w-full flex items-center px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-white hover:border-[#2b9e91] transition-all group`}>
                <div className="p-2 bg-white rounded-full border border-slate-200 group-hover:border-[#2b9e91] mr-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-[#2b9e91]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className="text-slate-600 font-medium group-hover:text-[#0F172A]">{screenshotNames.length > 0 ? `${screenshotNames.length} file(s) selected` : "Click to upload screenshot images"}</span>
                <input id="competitorScreenshot" name="competitorScreenshot" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
              </label>
            </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
             {hasGenerationsLeft ? `${MAX_GENERATIONS - usageCount} free generations left` : "Limit reached"}
          </div>
          <button
            type="submit"
            disabled={isLoading || !formData.seedTopic.trim() || !hasGenerationsLeft}
            className="w-1/2 md:w-1/3 flex items-center justify-center bg-gradient-to-r from-[#2b9e91] to-[#3bc4b5] text-white text-lg font-bold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-[#2b9e91]/30 focus:outline-none focus:ring-4 focus:ring-[#2b9e91]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isLoading ? <Spinner /> : 'Generate Strategy'}
          </button>
        </div>
      </form>
    </div>
  );
};