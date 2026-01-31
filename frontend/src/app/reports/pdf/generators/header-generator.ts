import type { SectionGeneratorProps, AnalysisInput } from '../types';

export const generateHeader = (doc: any, input?: AnalysisInput): void => {
    doc.setFontSize(22);
    doc.setTextColor(0, 180, 200);
    doc.text("SENTIRA NEURAL AUDIT REPORT", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`GENERATED: ${new Date().toLocaleString()}`, 20, 30);
    doc.text("SYSTEM: MULTIMODAL INTELLIGENCE ENGINE V1.0", 20, 35);
    
    if (input?.content) {
        const truncated = input.content.length > 60 
            ? input.content.substring(0, 60) + '...' 
            : input.content;
        doc.text(`SOURCE: ${truncated}`, 20, 40);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("", 20, 45);
};
