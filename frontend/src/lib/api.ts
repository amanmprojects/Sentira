export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== Type Definitions ====================

export type VideoSourceType = 'instagram' | 'youtube';

export interface Character {
    gender?: string;
    race?: string;
    tone?: string;
    facial_expression?: string;
    mood?: string;
    notes?: string;
    timestamp?: number;
    frame_image_b64?: string;
}

export interface GoogleSearchSource {
    url: string;
    title: string;
    snippet?: string;
}

export interface Claim {
    claim_text: string;
    claim_type: string;
    confidence: number;
    verification_status?: 'verified_true' | 'verified_false' | 'mixed' | 'uncertain';
    explanation?: string;
    sources: GoogleSearchSource[];
}

export interface FactCheckReport {
    claims_detected: Claim[];
    overall_truth_score: number;
    content_harmfulness: 'low' | 'medium' | 'high';
    recommendations: string[];
    analysis_timestamp?: string;
}

export interface BiasMetric {
    label: string;
    score: number;
    strength: "Low" | "Medium" | "High" | "Critical";
    description: string;
    detected: boolean;
}

export interface PolicyConflict {
    category: string;
    level: string;
    description: string;
}

export interface EvidenceMetric {
    label: string;
    value: string;
}

export interface RiskVectors {
    negative_skew: number;
    neutrality: number;
    positive_lean: number;
}

export interface BiasAnalysis {
    overall_score: number;
    risk_level: "Low Risk" | "Medium Risk" | "High Risk" | "Critical";
    categories: BiasMetric[];
    policy_conflicts?: PolicyConflict[];
    evidence_matrix?: EvidenceMetric[];
    risk_vectors?: RiskVectors;
    geographic_relevance?: string[];
}

export interface EnhancedReelAnalysis {
    main_summary: string;
    characters: Character[];
    commentary_summary: string;
    possible_issues: string[];
    bias_analysis?: BiasAnalysis;
    transcript?: string;
    suggestions: string[];
    fact_check_report?: FactCheckReport;
    overall_truth_score?: number;
}

export type Emotion = "Anger" | "Disgust" | "Horror" | "Humor" | "Sadness" | "Surprise";

export interface EmotionSegment {
    start: number;
    end: number;
    emotion: Emotion;
    intensity: number;
}

export interface CharacterEmotionAnalysis {
    id: string;
    name: string;
    dominantEmotion: Emotion;
    volatility: "Low" | "Medium" | "High";
    screenTime: number;
}

export interface SentimentAnalysisResponse {
    emotion_timeline: EmotionSegment[];
    emotion_seismograph: Record<Emotion, number[]>;
    character_emotions: CharacterEmotionAnalysis[];
    global_category: string;
    confidence: number;
    transcript_segments: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
        emotion: Emotion;
    }>;
    duration: number;
    video_url?: string;
}

export interface VideoAnalysis {
    summary: string;
}

export interface ApiError {
    detail: string;
}

// ==================== API Functions ====================

/**
 * Analyze an Instagram reel by URL
 */
export async function analyzeReel(
    postUrl: string,
    enableFactCheck: boolean = false
): Promise<EnhancedReelAnalysis> {
    const response = await fetch(
        `${API_BASE_URL}/analyze-video/reel?enable_fact_check=${enableFactCheck}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_url: postUrl }),
            cache: 'no-store',
        }
    );

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze reel');
    }

    return response.json();
}

export async function analyzeYouTube(
    videoUrl: string,
    enableFactCheck: boolean = false
): Promise<EnhancedReelAnalysis> {
    const response = await fetch(
        `${API_BASE_URL}/analyze-video/youtube?enable_fact_check=${enableFactCheck}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ video_url: videoUrl }),
            cache: 'no-store',
        }
    );

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze YouTube video');
    }

    return response.json();
}

/**
 * Auto-detect video platform and analyze accordingly
 */
export async function analyzeVideoUrl(
    url: string,
    enableFactCheck: boolean = false
): Promise<{ data: EnhancedReelAnalysis; source: VideoSourceType }> {
    const source = detectVideoSource(url);

    if (source === 'youtube') {
        const data = await analyzeYouTube(url, enableFactCheck);
        return { data, source };
    } else {
        const data = await analyzeReel(url, enableFactCheck);
        return { data, source };
    }
}

/**
 * Detect if a URL is from YouTube or Instagram
 */
export function detectVideoSource(url: string): VideoSourceType {
    const youtubePatterns = [
        /youtube\.com/i,
        /youtu\.be/i,
        /youtube-nocookie\.com/i
    ];

    for (const pattern of youtubePatterns) {
        if (pattern.test(url)) {
            return 'youtube';
        }
    }

    // Default to instagram for all other URLs
    return 'instagram';
}

/**
 * Analyze an uploaded video file with full analysis (including bias)
 */
export async function analyzeReelUpload(
    file: File,
    enableFactCheck: boolean = false
): Promise<EnhancedReelAnalysis> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(
        `${API_BASE_URL}/analyze-video/reel/upload?enable_fact_check=${enableFactCheck}`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze uploaded reel');
    }

    return response.json();
}

/**
 * Analyze an uploaded video file
 */
export async function analyzeVideo(file: File): Promise<VideoAnalysis> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/analyze-video`, {
        method: 'POST',
        body: formData,
        cache: 'no-store',
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze video');
    }

    return response.json();
}

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Analyze sentiment/emotions for a video URL (Instagram or YouTube)
 */
export async function analyzeSentiment(
    videoUrl: string
): Promise<SentimentAnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/analyze-video/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_url: videoUrl }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze sentiment');
    }

    return response.json();
}

/**
 * Analyze sentiment/emotions for an uploaded video file
 */
export async function analyzeSentimentUpload(
    file: File
): Promise<SentimentAnalysisResponse> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/analyze-video/sentiment/upload`, {
        method: 'POST',
        body: formData,
        cache: 'no-store',
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze segment for upload');
    }

    return response.json();
}
