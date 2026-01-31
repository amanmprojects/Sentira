import type { SectionGeneratorProps } from '../types';
import { checkNewPage, resetPosition, advancePosition, getCurrentPosition } from '../helpers/pagination';
import { setVerificationColor } from '../helpers/color-coding';
import { drawSimpleBarChart } from '../helpers/visualizations';

export const generateFactCheckSection = (props: SectionGeneratorProps): void => {
    const { doc, reelData } = props;
    
    const factCheck = reelData?.fact_check_report;
    if (!factCheck) return;
    
    checkNewPage(doc, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("4. FACT-CHECK REPORT", 20, getCurrentPosition());
    advancePosition(15);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Overall Truth Score: ${Math.round(factCheck.overall_truth_score * 100)}%`, 25, getCurrentPosition());
    advancePosition(8);
    
    doc.text(`Content Harmfulness: ${factCheck.content_harmfulness.toUpperCase()}`, 25, getCurrentPosition());
    advancePosition(12);
    
    checkNewPage(doc, 15);
    
    if (factCheck.claims_detected?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Claims Detected:", 25, getCurrentPosition());
        advancePosition(10);
        
        factCheck.claims_detected.forEach((claim, i) => {
            checkNewPage(doc, 30);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 80);
            doc.text(`Claim #${i + 1}: ${claim.claim_type}`, 30, getCurrentPosition());
            advancePosition(7);
            
            doc.setFontSize(10);
            const wrappedText = doc.splitTextToSize(claim.claim_text, 150);
            doc.text(wrappedText, 30, getCurrentPosition());
            advancePosition(wrappedText.length * 5);
            
            setVerificationColor(doc, claim.verification_status || "uncertain");
            doc.setFontSize(11);
            doc.text(
                `Status: ${claim.verification_status?.toUpperCase() || "UNCERTAIN"} (${Math.round(claim.confidence * 100)}%)`,
                30,
                getCurrentPosition()
            );
            advancePosition(6);
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            
            if (claim.explanation) {
                const wrappedExplanation = doc.splitTextToSize(`Explanation: ${claim.explanation}`, 150);
                doc.text(wrappedExplanation, 30, getCurrentPosition());
                advancePosition(wrappedExplanation.length * 5);
            }
            
            doc.text(`Sources: ${claim.sources?.length || 0} reference(s)`, 30, getCurrentPosition());
            advancePosition(8);
            
            doc.setTextColor(60, 60, 60);
        });
        
        checkNewPage(doc, 100);
        
        const verifiedTrue = factCheck.claims_detected.filter(c => c.verification_status === 'verified_true').length;
        const verifiedFalse = factCheck.claims_detected.filter(c => c.verification_status === 'verified_false').length;
        const mixed = factCheck.claims_detected.filter(c => c.verification_status === 'mixed').length;
        const uncertain = factCheck.claims_detected.filter(c => c.verification_status === 'uncertain' || !c.verification_status).length;
        
        const claimsData = [
            { label: 'True', value: (verifiedTrue / factCheck.claims_detected.length) * 100 },
            { label: 'False', value: (verifiedFalse / factCheck.claims_detected.length) * 100 },
            { label: 'Mixed', value: (mixed / factCheck.claims_detected.length) * 100 },
            { label: 'Unknown', value: (uncertain / factCheck.claims_detected.length) * 100 }
        ].filter(d => d.value > 0);
        
        if (claimsData.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text("Claims Verification Distribution:", 25, getCurrentPosition());
            advancePosition(10);
            
            const currentYPos = getCurrentPosition();
            drawSimpleBarChart(doc, claimsData, 'Verification Status', currentYPos);
            advancePosition(90);
        }
    }
    
    checkNewPage(doc, 15);
    
    if (factCheck.recommendations?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Recommendations:", 25, getCurrentPosition());
        advancePosition(10);
        
        factCheck.recommendations.forEach((rec, i) => {
            checkNewPage(doc, 10);
            doc.setFontSize(11);
            doc.text(`${i + 1}. ${rec}`, 30, getCurrentPosition());
            advancePosition(7);
        });
    }
    
    advancePosition(10);
};
