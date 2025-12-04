import { GoogleGenAI, Type } from "@google/genai";
import type { FormData } from '../components/InputForm';
import type { 
    TopicalAuthorityMap, 
    IntentClarityReport, 
    CompetitorAnalysis, 
    ContentBrief, 
    BrandVoiceGuide, 
    VideoBrief,
    GscPagePerformance,
    DecayAnalysis,
    Ctroptimization,
    InternalLinkSuggestion,
    AuditReport
} from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const proModel = 'gemini-2.5-pro';
const flashModel = 'gemini-2.5-flash';

/**
 * Cleans the raw text response from Gemini by removing markdown code fences
 * before parsing it as JSON.
 * @param rawText The raw string response from the model.
 * @returns A parsed JSON object.
 */
const cleanAndParseJson = (rawText: string) => {
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7).trim();
    }
    if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3).trim();
    }
    if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3).trim();
    }
    
    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse JSON after cleaning:", cleanedText);
        throw new Error(`The AI returned a response that could not be parsed as JSON. Content: "${rawText}"`);
    }
};

const contentBriefSchema = {
  type: Type.OBJECT,
  properties: {
    seo_fundamentals: {
        type: Type.OBJECT,
        properties: {
            optimized_title: { type: Type.STRING },
            meta_description: { type: Type.STRING },
            target_intent_focus: { type: Type.STRING }
        },
        required: ['optimized_title', 'meta_description', 'target_intent_focus']
    },
    content_outline: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                h2: { type: Type.STRING },
                h3s: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['h2']
        }
    },
    required_semantic_terms: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    },
    json_ld_schema: { type: Type.STRING, description: "A string containing a complete, valid, and nested JSON-LD schema (e.g., HowTo, Course, Article). This string itself must be parseable as JSON." }
  },
  required: ['seo_fundamentals', 'content_outline', 'required_semantic_terms', 'json_ld_schema']
};

export const generateTopicalAuthorityMap = async (formData: FormData): Promise<TopicalAuthorityMap> => {
    const prompt = `
      Analyze the Seed Topic and Target Audience. Break the topic into 3-4 primary Pillar Topics. For each Pillar, create 2-3 Cluster Subtopics. For each Cluster, generate 5 high-intent, long-tail Target Keywords that show commercial or specialized informational intent. For each Cluster, provide a Difficulty Score (Low/Medium/High) based on competitor saturation and a precise, actionable Next Step content recommendation. Keywords MUST be localized for the Target Region/Language.

      Seed Topic: "${formData.seedTopic}"
      Target Audience: "${formData.targetAudience || 'General Audience'}"
      Target Region/Language: "${formData.region}"

      Respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or code fences.
      The JSON object must have a single key "pillar_topics" which is an array of objects.
      Each pillar object has "pillar_name" (string) and "cluster_subtopics" (array of objects).
      Each cluster object has "cluster_name" (string), "target_keywords" (array of 5 strings), "difficulty" (enum: 'Low', 'Medium', 'High'), and "next_step" (string).
    `;
    
    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are an expert SEO Content Strategist. Your goal is to structure a given Seed Topic into a comprehensive, hierarchical Topical Authority Map designed to establish total domain expertise. You MUST use Google Search (Grounding) to validate keyword relevance and discover real-world content clusters. Your output MUST be a single, valid JSON object and nothing else.",
            temperature: 0.3,
            tools: [{googleSearch: {}}],
        },
    });

    const result = cleanAndParseJson(response.text);
    return result.pillar_topics;
};

export const generateIntentClarityReport = async (formData: FormData): Promise<IntentClarityReport> => {
    const prompt = `
      First, based on the topic seed "${formData.seedTopic}", generate a list of 10-15 related, high-intent keywords.
      Then, for that list of keywords, analyze the user intent and SERP clarity. Classify the intent into one of these types: Educational, Inspiration, Troubleshoot, Comparison, or Purchase. The Intent Clarity Score (1-100) must reflect the percentage of the top 10 SERP results that share the same primary intent. Suggest the optimal Content Type for each based on the intent.

      Target Region/Language: "${formData.region}"

      Respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or code fences.
      The JSON object must have a single key "keyword_analysis" which is an array of objects.
      Each object in the array should have "keyword" (string), "gemini_intent_classification" (enum: 'Educational', 'Inspiration', 'Troubleshoot', 'Comparison', 'Purchase'), "intent_clarity_score" (number), and "content_type_suggestion" (string).
    `;
    
    const response = await ai.models.generateContent({
        model: flashModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "Your task is to perform an advanced search intent analysis. For each keyword, you must use Google Search (Grounding) to analyze the top 10 search results (SERP) and determine the user's primary intent and the consistency of the SERP results. Your output MUST be a single, valid JSON object and nothing else.",
            temperature: 0.1,
            tools: [{googleSearch: {}}],
        },
    });

    const result = cleanAndParseJson(response.text);
    return result.keyword_analysis;
};

export const analyzeCompetitorContent = async (urls: string[], screenshots: string[], region: string): Promise<CompetitorAnalysis> => {
    const imageParts = screenshots.map(base64 => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64.split(',')[1],
        },
    }));

    const textPart = {
        text: `
          Analyze the following list of competitor URLs and their corresponding screenshots.
          For each competitor, provide a brief summary of their visual tone and core message.
          Then, after analyzing all competitors, provide a collective analysis of the content gaps. Identify three high-value "Content Gap Keywords" that these competitors have collectively missed or underutilized. Explain your reasoning in the "analysis" field.

          Competitor URLs: ${urls.join(', ')}
          Target Region/Language: ${region}

          Respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or code fences.
          The JSON object must have two top-level keys: "competitor_summaries" and "collective_content_gaps".
          - "competitor_summaries" must be an array of objects. Each object must have "url" (string), "visual_tone" (string), and "core_message" (string). The order of summaries must match the order of the provided URLs.
          - "collective_content_gaps" must be an object with "gap_keywords" (an array of 3 strings) and "analysis" (a string explaining the collective opportunity).
        `,
    };

    const response = await ai.models.generateContent({
        model: proModel, // Upgraded to Pro for better comparative analysis
        contents: { parts: [...imageParts, textPart] },
        config: {
            systemInstruction: "You are a Content Intelligence Analyst. Analyze the provided competitor screenshots and URLs. For each, identify their primary visual and textual messaging. Then, use Google Search (Grounding) to perform a comparative analysis and find three high-intent keywords that are semantically related but collectively under-targeted, representing a clear market content gap. Your output MUST be a single, valid JSON object and nothing else.",
            temperature: 0.5,
            tools: [{googleSearch: {}}],
            thinkingConfig: { thinkingBudget: 8192 }
        },
    });
    
    return cleanAndParseJson(response.text);
};

export const generateContentBrief = async (keyword: string, region: string): Promise<ContentBrief> => {
    const prompt = `
      Generate a detailed Content Brief for the following keyword. First, determine the most likely user intent and optimal content type.
      The output MUST include an H2/H3 outline, an SEO title, a meta description, a list of supporting semantic entities (LSI), and a complete, ready-to-use, and nested JSON-LD schema (choose HowTo, FAQPage, Course, or Article based on the inferred Intent). For the schema, ensure it is a valid JSON object provided as a string.

      Target Keyword: "${keyword}"
      Target Region/Language: "${region}"
    `;
    
    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are a Technical SEO Engineer and Content SEO Expert. Your task is to generate a complete, production-ready Content Brief. This includes a full H2/H3 outline, SEO metadata, and crucially, the correct, nested JSON-LD Schema code required for the highest possible Rich Snippet visibility on Google. The outline and semantic terms MUST be optimized for the specific intent type. Use the provided keyword and the outline you generate to create the schema.",
            responseMimeType: "application/json",
            responseSchema: contentBriefSchema,
            temperature: 0.4,
        },
    });

    return JSON.parse(response.text.trim());
};

export const analyzeBrandVoice = async (samples: string): Promise<BrandVoiceGuide> => {
    const prompt = `
        Analyze the following content samples for style, tone, and vocabulary. Generate a JSON object that captures the Brand Voice for future AI content generation. The key elements must include the 'tone_attributes' (an array of objects, each with tone, score out of 5, and a description), 'target_reading_level', 'sentence_structure', and a list of 'forbidden_words'.

        Content Samples:
        ---
        ${samples}
        ---
    `;
    const response = await ai.models.generateContent({
        model: flashModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are the Brand Voice Analyst for the Napnox AI Strategist. Your goal is to analyze the provided text samples and generate a precise, actionable style guide in JSON format.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tone_attributes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                tone: { type: Type.STRING, description: "e.g., 'Witty', 'Formal', 'Technical'" },
                                score: { type: Type.NUMBER, description: "A score from 1 to 5 representing the intensity of the tone." },
                                description: { type: Type.STRING, description: "A brief explanation of how this tone is expressed." }
                            },
                            required: ['tone', 'score', 'description']
                        }
                    },
                    target_reading_level: { type: Type.STRING, description: "e.g., '9th Grade / Conversational'" },
                    sentence_structure: { type: Type.STRING, description: "e.g., 'Prefers short, punchy sentences; uses em-dashes liberally'" },
                    forbidden_words: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['synergy', 'paradigm']" }
                },
                required: ['tone_attributes', 'target_reading_level', 'sentence_structure', 'forbidden_words']
            },
            temperature: 0.2,
        }
    });

    return JSON.parse(response.text.trim());
};

interface VideoBriefParams {
    topic: string;
    platformType: 'long' | 'short';
    videoLength: string;
    keywords: string;
    generateScript: boolean;
}

export const generateVideoBrief = async (params: VideoBriefParams): Promise<VideoBrief> => {
    const { topic, platformType, videoLength, keywords, generateScript } = params;

    const platformName = platformType === 'long' ? 'YouTube' : 'TikTok/Shorts';

    let scriptInstructions = '';
    if (generateScript) {
        scriptInstructions = `
        Additionally, generate a full video script. The script should be paced for the target video length of "${videoLength}". Structure the script into scenes, each with a "scene_title" and a detailed "script_and_visuals" description that includes narration/dialogue and suggested on-screen visuals.
        The JSON response MUST include a "full_video_script" key containing an array of these scene objects.
        `;
    }

    const keywordInstructions = keywords.trim() ? `The content should target these keywords: ${keywords}.` : '';

    const prompt = `
        Generate a comprehensive Video Content Brief for the topic: "${topic}".
        The target platform is ${platformName} (${platformType}-form video).
        The target video length is "${videoLength}".
        ${keywordInstructions}
        The primary goal is high retention and maximum clicks. The video should target a student audience looking for fun, free content.
        
        ${scriptInstructions}

        Respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or code fences.
        The JSON object must have the following keys:
        - "video_title_ideas": An array of 3 catchy, high click-through rate titles.
        - "video_hook_script": A script for the first 15 seconds (max 50 words) focusing on a pain point or question.
        - "main_segments": An array of objects, each with "segment_title" and "estimated_duration_seconds".
        - "suggested_thumbnail_elements": A descriptive string of thumbnail elements.
        ${generateScript ? '- "full_video_script": An array of objects, where each object has "scene_title" (string) and "script_and_visuals" (string).' : ''}
    `;
    
    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are the Viral Video Content Strategist. Your task is to generate a complete video brief, and optionally a full script, based on the user's specifications. Use Google Search to inform your ideas. Focus on high-engagement hooks, scannable segments, and production-ready scripts. Your output MUST be a single, valid JSON object and nothing else.",
            temperature: 0.7,
            tools: [{googleSearch: {}}]
        }
    });

    const result = cleanAndParseJson(response.text);
    return result;
}

// Phase 3 Services

export const diagnoseContentDecay = async (data: GscPagePerformance): Promise<DecayAnalysis> => {
    const prompt = `
        The following URL has experienced a performance drop.
        URL: ${data.url}
        Click Change (last 30d vs 60d prior): ${data.clicksChange.toFixed(1)}%
        Position Change (last 30d vs 60d prior): ${data.positionChange.toFixed(1)}
        Original Top Keyword: "${data.topQuery}"

        Analyze the provided query data and current SERP trends to identify the primary cause of the decay and suggest a Revision Brief.
        Query Data: ${JSON.stringify(data.queries)}

        Respond with ONLY a valid JSON object with the keys: "decay_reason", "revision_type", "revision_focus", and "new_meta_description".
    `;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are the Content Decay Specialist. Your goal is to analyze the provided GSC performance data and diagnose the most likely reason for any decline, providing an actionable fix in JSON format. Use Google Search grounding to understand current SERP trends for the target keywords.",
            temperature: 0.4,
            tools: [{googleSearch: {}}],
            thinkingConfig: { thinkingBudget: 8192 }
        },
    });

    return cleanAndParseJson(response.text);
};


export const optimizeCTR = async (data: GscPagePerformance): Promise<Ctroptimization> => {
    const prompt = `
        The following URL has a high impression count but a low Click-Through Rate (CTR).
        URL: ${data.url}
        Impressions (90d): ${data.impressions}
        CTR (90d): ${data.ctr.toFixed(2)}%
        Top Query Driving Impressions: "${data.topQuery}"

        Generate 3 distinct, high-impact Title and Meta Description pairs to immediately boost clicks. Titles must be under 60 characters. Leverage strong emotional hooks and power words.

        Respond with ONLY a valid JSON object with a single key "ctr_optimizations", which is an array of 3 objects. Each object must contain "new_title" and "new_meta_description".
    `;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are the Click-Through Rate (CTR) Optimization Specialist. Your sole focus is to generate highly persuasive, optimized titles and meta descriptions for the provided low-CTR URL. Use Google Search grounding to analyze what titles are currently performing well for the top query. Your output must be a valid JSON object.",
            temperature: 0.7,
            tools: [{googleSearch: {}}],
            thinkingConfig: { thinkingBudget: 4096 }
        },
    });

    return cleanAndParseJson(response.text);
};

export const generateInternalLinks = async (targetArticle: string, sourceIndex: string): Promise<InternalLinkSuggestion[]> => {
    const prompt = `
        The Target Article to receive links is provided below under [TARGET ARTICLE].
        The index of available Source Articles to link from is provided under [SOURCE INDEX].

        Identify 5 optimal locations in the Target Article where a link to a Source Article should be placed. For each location, provide the source URL to link to, suggest the exact anchor text to use in the target article, and provide a short contextual snippet from the target article to show where the link should be placed.

        [TARGET ARTICLE]
        ${targetArticle}
        [/TARGET ARTICLE]

        [SOURCE INDEX]
        ${sourceIndex}
        [/SOURCE INDEX]
    `;

    const response = await ai.models.generateContent({
        model: proModel,
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: "You are the Internal Link Architect. Your task is to match the content of the target URL with the most semantically relevant source URLs from the provided index. You must suggest the exact paragraph location and anchor text for the link. Your output must be valid JSON.",
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: 8192 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    internal_link_suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                source_url_to_link_from: { type: Type.STRING, description: "The URL from the source index to link TO." },
                                suggested_anchor_text: { type: Type.STRING, description: "The exact text within the target article to be hyperlinked." },
                                contextual_snippet: { type: Type.STRING, description: "A short surrounding sentence from the target article for placement verification." }
                            },
                            required: ['source_url_to_link_from', 'suggested_anchor_text', 'contextual_snippet']
                        }
                    }
                },
                required: ['internal_link_suggestions']
            }
        },
    });

    const result = JSON.parse(response.text.trim());
    return result.internal_link_suggestions;
};

export const generateContentAudit = async (content: string, keyword: string): Promise<AuditReport> => {
    const prompt = `
      Please analyze the following content for SEO performance, identify on-page issues, and perform a competitive content gap analysis using the primary keyword: "${keyword}".

      [START OF ARTICLE CONTENT]
      ${content}
      [END OF ARTICLE CONTENT]

      Respond with ONLY a valid JSON object based on the analysis. The JSON object must adhere to the following structure:
      - "audit_title": A short, descriptive title for this audit report.
      - "summary_sentiment": A single word: 'Excellent', 'Good', 'Fair', or 'Poor'.
      - "core_metrics": An object with "word_count" (integer), "readability_score_flesch" (number, 0-100), and "primary_keyword" (string).
      - "on_page_review": An array of objects, each with "element" (string, e.g., 'H1 Tag'), "status" ('Pass', 'Fail', 'Warning'), and "recommendation" (string).
      - "keyword_and_gap_analysis": An array of objects, each with "keyword_phrase" (string), "relevance_score" (integer, 1-5), and "notes" (string).
      Do not include any other text, markdown formatting, or code fences.
    `;

    const response = await ai.models.generateContent({
        model: proModel, // Use pro for detailed analysis
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: `You are 'Atlas', a Senior SEO Content Auditor and Data Analyst specializing in content gap analysis, topical authority, and technical on-page optimization. Your sole purpose is to analyze user-provided text content against best-in-class SEO standards and current search trends (using Google Search grounding).
RULES:
1. Strict JSON Output: You MUST produce a single, valid JSON object as your response. Do not add any text, markdown, or commentary outside of the JSON structure.
2. Grounded Analysis: You MUST use the Google Search grounding tool to verify keyword search volume trends, identify real-time competitive gaps, and ensure topical relevance.
3. Actionability: Every recommendation MUST be concise, prioritized, and immediately actionable for a content editor.
4. Tone: Maintain an objective, professional, and data-driven tone. Do not use filler words, subjective opinions, or conversational language.`,
            temperature: 0.2,
            tools: [{googleSearch: {}}],
            thinkingConfig: { thinkingBudget: 8192 }
        },
    });

    return cleanAndParseJson(response.text);
};