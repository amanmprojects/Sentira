import type { SectionGeneratorProps } from '../types';
import { checkNewPage, resetPosition, advancePosition, getCurrentPosition } from '../helpers/pagination';
import { setRiskColor } from '../helpers/color-coding';
import { drawSimpleBarChart } from '../helpers/visualizations';

export const generateBiasSection = (props: SectionGeneratorProps): void => {
    const { doc, reelData } = props;
    
    const bias = reelData?.bias_analysis;
    if (!bias) return;
    
    checkNewPage(doc, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("3. COMPREHENSIVE BIAS ANALYSIS", 20, getCurrentPosition());
    advancePosition(15);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Overall Risk Score: ${Math.round(bias.overall_score)}%`, 25, getCurrentPosition());
    advancePosition(8);
    
    doc.text(`Risk Level: ${bias.risk_level}`, 25, getCurrentPosition());
    advancePosition(12);
    
    if (bias.categories?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Bias Categories:", 25, getCurrentPosition());
        advancePosition(10);
        
        bias.categories.forEach((cat) => {
            checkNewPage(doc, 20);
            setRiskColor(doc, cat.detected ? "high" : "low");
            doc.setFontSize(11);
            doc.text(
                `${cat.label}: ${cat.score.toFixed(1)}% [${cat.strength}] - ${cat.detected ? "DETECTED" : "NOT DETECTED"}`,
                30,
                getCurrentPosition()
            );
            advancePosition(6);
            
            if (cat.description) {
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(10);
                const wrapped = doc.splitTextToSize(`  Description: ${cat.description}`, 155);
                doc.text(wrapped, 30, getCurrentPosition());
                advancePosition(wrapped.length * 5);
            }
            advancePosition(4);
        });
        doc.setTextColor(60, 60, 60);
    }
    
    advancePosition(10);
    
    if (bias.risk_vectors) {
        checkNewPage(doc, 100);
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Risk Vectors Visualization:", 25, getCurrentPosition());
        advancePosition(10);
        
        const riskData = [
            { label: 'Negative', value: bias.risk_vectors.negative_skew },
            { label: 'Neutral', value: bias.risk_vectors.neutrality },
            { label: 'Positive', value: bias.risk_vectors.positive_lean }
        ];
        
        const currentYPos = getCurrentPosition();
        drawSimpleBarChart(doc, riskData, 'Risk Distribution', currentYPos);
        advancePosition(90);
    }
    
    advancePosition(10);
    
    if (bias.evidence_matrix?.length) {
        checkNewPage(doc, 15);
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Evidence Matrix:", 25, getCurrentPosition());
        advancePosition(10);
        
        bias.evidence_matrix.forEach((evidence) => {
            checkNewPage(doc, 10);
            doc.setFontSize(11);
            doc.text(`${evidence.label}: ${evidence.value}`, 30, getCurrentPosition());
            advancePosition(7);
        });
    }
    
    advancePosition(10);
    
    if (bias.policy_conflicts?.length) {
        checkNewPage(doc, 15);
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Policy Conflicts:", 25, getCurrentPosition());
        advancePosition(10);
        
        bias.policy_conflicts.forEach((conflict) => {
            checkNewPage(doc, 20);
            doc.setFontSize(11);
            doc.text(`${conflict.category} [${conflict.level}]`, 30, getCurrentPosition());
            advancePosition(6);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const wrapped = doc.splitTextToSize(`  ${conflict.description}`, 155);
            doc.text(wrapped, 35, getCurrentPosition());
            advancePosition(wrapped.length * 5);
            advancePosition(4);
        });
    }
    
    advancePosition(10);
    
    if (bias.geographic_relevance?.length) {
        checkNewPage(doc, 15);
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Geographic Relevance:", 25, getCurrentPosition());
        advancePosition(10);
        
        doc.setFontSize(11);
        const regions = bias.geographic_relevance.join(", ");
        const wrapped = doc.splitTextToSize(`Target Regions: ${regions}`, 155);
        doc.text(wrapped, 30, getCurrentPosition());
        advancePosition(wrapped.length * 6);
    }
    
    advancePosition(10);
};
