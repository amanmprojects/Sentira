import type { SectionGeneratorProps } from '../types';
import type { Character } from '@/lib/api';
import { checkNewPage, advancePosition, getCurrentPosition } from '../helpers/pagination';

export const generateCharacterSection = (props: SectionGeneratorProps): void => {
    const { doc, reelData } = props;
    
    const characters = reelData?.characters;
    if (!characters?.length) return;
    
    checkNewPage(doc, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("2. CHARACTER PROFILING", 20, getCurrentPosition());
    advancePosition(15);
    
    characters.forEach((char: Character, index: number) => {
        checkNewPage(doc, 40);
        
        if (char.gender || char.race || char.tone) {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 80);
            doc.text(`Character #${index + 1}`, 25, getCurrentPosition());
            advancePosition(8);
            
            const details: string[] = [];
            if (char.gender) details.push(`Gender: ${char.gender}`);
            if (char.race) details.push(`Race: ${char.race}`);
            if (char.tone) details.push(`Tone: ${char.tone}`);
            if (char.facial_expression) details.push(`Expression: ${char.facial_expression}`);
            if (char.mood) details.push(`Mood: ${char.mood}`);
            
            if (details.length) {
                doc.setFontSize(11);
                doc.setTextColor(60, 60, 60);
                const detailsText = details.join(" | ");
                const wrapped = doc.splitTextToSize(detailsText, 155);
                doc.text(wrapped, 30, getCurrentPosition());
                advancePosition(wrapped.length * 6);
            }
            
            if (char.timestamp) {
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                doc.text(`Timestamp: ${new Date(char.timestamp).toLocaleString()}`, 30, getCurrentPosition());
                advancePosition(6);
            }
            
            if (char.notes) {
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                const wrappedNotes = doc.splitTextToSize(`Notes: ${char.notes}`, 155);
                doc.text(wrappedNotes, 30, getCurrentPosition());
                advancePosition(wrappedNotes.length * 5);
            }
            
            advancePosition(8);
        }
    });
    
    advancePosition(10);
};
