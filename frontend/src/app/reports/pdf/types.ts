import type {
    SentimentAnalysisResponse,
    EnhancedReelAnalysis,
    Character,
    EmotionSegment,
    CharacterEmotionAnalysis
} from '@/lib/api';

export interface AnalysisInput {
    modality: 'video' | 'audio' | 'text';
    content: string;
    file?: File | null;
}

export interface SectionGeneratorProps {
    doc: any;
    sentimentData: SentimentAnalysisResponse | null;
    reelData: EnhancedReelAnalysis | null;
    input?: AnalysisInput;
}

export interface PDFGeneratorInput {
    doc: any;
    sentimentData: SentimentAnalysisResponse | null;
    reelData: EnhancedReelAnalysis | null;
    input?: AnalysisInput;
}
