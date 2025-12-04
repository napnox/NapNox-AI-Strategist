export interface ClusterSubtopic {
  cluster_name: string;
  target_keywords: string[];
  difficulty: 'Low' | 'Medium' | 'High';
  next_step: string;
}

export interface PillarTopic {
  pillar_name: string;
  cluster_subtopics: ClusterSubtopic[];
}

export type TopicalAuthorityMap = PillarTopic[];

export interface IntentClarityItem {
  keyword: string;
  gemini_intent_classification: 'Educational' | 'Inspiration' | 'Troubleshoot' | 'Comparison' | 'Purchase';
  intent_clarity_score: number;
  content_type_suggestion: string;
}

export type IntentClarityReport = IntentClarityItem[];

export interface CompetitorSummary {
  url: string;
  visual_tone: string;
  core_message: string;
}

export interface CompetitorAnalysis {
  competitor_summaries: CompetitorSummary[];
  collective_content_gaps: {
    gap_keywords: string[];
    analysis: string;
  };
}


export interface ContentOutlineItem {
  h2: string;
  h3s?: string[];
}

export interface ContentBrief {
  seo_fundamentals: {
    optimized_title: string;
    meta_description: string;
    target_intent_focus: string;
  };
  content_outline: ContentOutlineItem[];
  required_semantic_terms: string[];
  json_ld_schema: string;
}

export interface ToneAttribute {
    tone: string;
    score: number;
    description: string;
}

export interface BrandVoiceGuide {
    tone_attributes: ToneAttribute[];
    target_reading_level: string;
    sentence_structure: string;
    forbidden_words: string[];
}


export interface VideoScene {
    scene_title: string;
    script_and_visuals: string;
}

export interface VideoBrief {
    video_title_ideas: string[];
    video_hook_script: string;
    main_segments: {
        segment_title: string;
        estimated_duration_seconds: number;
    }[];
    suggested_thumbnail_elements: string;
    full_video_script?: VideoScene[];
}

// Phase 3: GSC Performance Audit Types
export interface GscQuery {
    query: string;
    clicks: number;
    impressions: number;
    position: number;
}

export interface GscPagePerformance {
    url: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    clicksChange: number; // Percentage
    positionChange: number; // Absolute change
    topQuery: string;
    queries: GscQuery[];
}

export interface DecayAnalysis {
    decay_reason: string;
    revision_type: string;
    revision_focus: string;
    new_meta_description: string;
}

export interface CtrOptimizationPair {
    new_title: string;
    new_meta_description: string;
}

export interface Ctroptimization {
    ctr_optimizations: CtrOptimizationPair[];
}


// Phase 3: Internal Linking Types
export interface InternalLinkSuggestion {
    source_url_to_link_from: string;
    suggested_anchor_text: string;
    contextual_snippet: string;
}

// Content Auditor Types
export interface CoreMetrics {
    word_count: number;
    readability_score_flesch: number;
    primary_keyword: string;
}

export interface OnPageReviewItem {
    element: string;
    status: 'Pass' | 'Fail' | 'Warning';
    recommendation: string;
}

export interface KeywordGapAnalysisItem {
    keyword_phrase: string;
    relevance_score: number;
    notes: string;
}

export interface AuditReport {
    audit_title: string;
    summary_sentiment: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    core_metrics: CoreMetrics;
    on_page_review: OnPageReviewItem[];
    keyword_and_gap_analysis: KeywordGapAnalysisItem[];
}