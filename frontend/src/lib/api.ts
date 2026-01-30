const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==================== Type Definitions ====================

export interface Character {
    race?: string;
    tone?: string;
    facial_expression?: string;
    mood?: string;
    notes?: string;
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

export interface EnhancedReelAnalysis {
    main_summary: string;
    characters: Character[];
    commentary_summary: string;
    possible_issues: string[];
    transcript?: string;
    suggestions: string[];
    fact_check_report?: FactCheckReport;
    overall_truth_score?: number;
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
    enableFactCheck: boolean = true
): Promise<EnhancedReelAnalysis> {
    const response = await fetch(
        `${API_BASE_URL}/analyze-video/reel?enable_fact_check=${enableFactCheck}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_url: postUrl }),
        }
    );

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to analyze reel');
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
