import type { SectionGeneratorProps } from '../types';
import { checkNewPage, resetPosition, advancePosition, getCurrentPosition } from '../helpers/pagination';

export const generateNarrativeSection = (props: SectionGeneratorProps): void => {
    const { doc, reelData } = props;
    
    if (!reelData) return;
    
    checkNewPage(doc, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("5. NARRATIVE SUMMARY", 20, getCurrentPosition());
    advancePosition(15);
    
    if (reelData.commentary_summary) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        const wrapped = doc.splitTextToSize(reelData.commentary_summary, 160);
        doc.text(wrapped, 25, getCurrentPosition());
        advancePosition(wrapped.length * 6);
    }
    
    advancePosition(10);
    
    if (reelData.possible_issues?.length) {
        checkNewPage(doc, 15);
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Detected Issues:", 25, getCurrentPosition());
        advancePosition(10);
        
        reelData.possible_issues.forEach((issue, i) => {
            checkNewPage(doc, 10);
            doc.setFontSize(11);
            doc.text(`${i + 1}. ${issue}`, 30, getCurrentPosition());
            advancePosition(7);
        });
    }
    
    checkNewPage(doc, 15);
    
    if (reelData.suggestions?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Recommendations:", 25, getCurrentPosition());
        advancePosition(10);
        
        reelData.suggestions.forEach((rec, i) => {
            checkNewPage(doc, 10);
            doc.setFontSize(11);
            doc.text(`${i + 1}. ${rec}`, 30, getCurrentPosition());
            advancePosition(7);
        });
    }
    
    advancePosition(10);
};
