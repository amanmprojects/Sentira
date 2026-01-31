import type { SectionGeneratorProps } from '../types';
import type { SentimentAnalysisResponse, Emotion } from '@/lib/api';
import { checkNewPage, resetPosition, advancePosition, getCurrentPosition } from '../helpers/pagination';
import { drawEmotionSeismograph, calculateSeismographStats } from '../helpers/visualizations';

export const generateSentimentSection = (props: SectionGeneratorProps): void => {
    const { doc, sentimentData } = props;
    
    if (!sentimentData) return;
    
    resetPosition(50);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("1. SENTIMENT ANALYSIS", 20, getCurrentPosition());
    advancePosition(15);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Confidence Score: ${Math.round(sentimentData.confidence * 100)}%`, 25, getCurrentPosition());
    advancePosition(10);
    
    doc.text(`Global Category: ${sentimentData.global_category}`, 25, getCurrentPosition());
    advancePosition(10);
    
    checkNewPage(doc, 15);
    
    if (sentimentData.emotion_timeline?.length) {
        doc.text("Emotional Cues Detected:", 25, getCurrentPosition());
        advancePosition(10);
        
        const timelineToShow = sentimentData.emotion_timeline.slice(0, 15);
        timelineToShow.forEach((seg, i) => {
            checkNewPage(doc, 10);
            doc.setFontSize(11);
            doc.text(
                `${seg.start.toFixed(1)}s - ${seg.end.toFixed(1)}s: ${seg.emotion} (${Math.round(seg.intensity * 100)}%)`,
                30,
                getCurrentPosition()
            );
            advancePosition(8);
        });
    }
    
    checkNewPage(doc, 15);
    
    if (sentimentData.character_emotions?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Character Emotion Analysis:", 25, getCurrentPosition());
        advancePosition(10);
        
        sentimentData.character_emotions.forEach((char) => {
            checkNewPage(doc, 15);
            doc.setFontSize(11);
            doc.text(
                `${char.name}: ${char.dominantEmotion}, Volatility: ${char.volatility}, Screen Time: ${char.screenTime}s`,
                30,
                getCurrentPosition()
            );
            advancePosition(8);
        });
    }
    
    checkNewPage(doc, 15);
    
    if (sentimentData.emotion_seismograph) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Emotion Seismographs:", 25, getCurrentPosition());
        advancePosition(10);
        
        const emotions: Emotion[] = ["Anger", "Disgust", "Horror", "Humor", "Sadness", "Surprise"];
        emotions.forEach((emotion) => {
            const values = sentimentData.emotion_seismograph![emotion] || [];
            if (values.length > 0) {
                checkNewPage(doc, 60);
                const currentYPos = getCurrentPosition();
                drawEmotionSeismograph(doc, emotion, values, currentYPos);
                advancePosition(55);
            }
        });
    }
    
    checkNewPage(doc, 15);
    
    if (sentimentData.transcript_segments?.length) {
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Transcript Segments:", 25, getCurrentPosition());
        advancePosition(10);
        
        const transcriptToShow = sentimentData.transcript_segments.slice(0, 10);
        transcriptToShow.forEach((seg) => {
            checkNewPage(doc, 15);
            doc.setFontSize(11);
            const text = `[${seg.start.toFixed(1)}s] ${seg.emotion}: ${seg.text}`;
            const wrapped = doc.splitTextToSize(text, 155);
            doc.text(wrapped, 30, getCurrentPosition());
            advancePosition(wrapped.length * 6);
        });
    }
    
    advancePosition(10);
};
