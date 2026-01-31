import type { PDFGeneratorInput } from '../types';
import { generateHeader } from './header-generator';
import { generateSentimentSection } from './sentiment-section';
import { generateCharacterSection } from './character-section';
import { generateBiasSection } from './bias-section';
import { generateFactCheckSection } from './factcheck-section';
import { generateNarrativeSection } from './narrative-section';
import { resetPosition, getCurrentPosition } from '../helpers/pagination';

export const generateIntelligencePDF = (input: PDFGeneratorInput): void => {
    const { doc, sentimentData, reelData, input: analysisInput } = input;
    
    resetPosition();
    
    generateHeader(doc, analysisInput);
    
    generateSentimentSection({ doc, sentimentData, reelData, input: analysisInput });
    generateCharacterSection({ doc, sentimentData, reelData, input: analysisInput });
    generateBiasSection({ doc, sentimentData, reelData, input: analysisInput });
    
    if (reelData) {
        generateFactCheckSection({ doc, sentimentData, reelData, input: analysisInput });
        generateNarrativeSection({ doc, sentimentData, reelData, input: analysisInput });
    }
};
