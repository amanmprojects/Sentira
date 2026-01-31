import jsPDF from 'jspdf';
import type { SentimentAnalysisResponse, EnhancedReelAnalysis } from '@/lib/api';
import type { AnalysisInput } from './types';
import { generateIntelligencePDF } from './generators/pdf-generator';

export const generateReportPDF = ({
    sentimentData,
    reelData,
    input
}: {
    sentimentData: SentimentAnalysisResponse | null;
    reelData: EnhancedReelAnalysis | null;
    input?: AnalysisInput;
}): void => {
    if (!sentimentData && !reelData) {
        throw new Error("No analysis data available");
    }
    
    const doc = new jsPDF();
    
    generateIntelligencePDF({ doc, sentimentData, reelData, input });
    
    doc.save(`SENTIRA_REPORT_${new Date().getTime()}.pdf`);
};
