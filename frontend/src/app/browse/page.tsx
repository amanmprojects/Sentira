"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { KeywordFilters } from "./components/KeywordFilters";
import { GoogleCSEEmbed } from "./components/GoogleCSEEmbed";

// Simple keyword extraction from text
function extractKeywords(text: string, maxKeywords: number = 8): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "dare",
        "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
        "from", "as", "into", "through", "during", "before", "after", "above",
        "below", "between", "under", "again", "further", "then", "once", "here",
        "there", "when", "where", "why", "how", "all", "each", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "just", "and", "but", "if", "or",
        "because", "until", "while", "this", "that", "these", "those", "what",
        "which", "who", "whom", "whose", "it", "its", "i", "me", "my", "myself",
        "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
        "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
        "herself", "they", "them", "their", "theirs", "themselves", "about",
        "also", "any", "both", "even", "get", "got", "gets", "getting", "go",
        "goes", "going", "gone", "like", "make", "made", "makes", "making",
        "one", "said", "say", "says", "saying", "see", "seen", "sees", "seeing",
        "take", "takes", "took", "taking", "taken", "think", "thinks", "thought",
        "thinking", "know", "knows", "knew", "knowing", "known", "come", "comes",
        "came", "coming", "want", "wants", "wanted", "wanting", "well", "yeah",
        "yes", "uh", "um", "oh", "okay", "ok", "really", "actually", "basically",
        "something", "nothing", "everything", "anything", "someone", "everyone",
        "anyone", "thing", "things", "way", "ways", "time", "times", "people",
        "person", "much", "many", "lot", "lots", "bit", "little", "big", "good",
        "bad", "new", "old", "first", "last", "long", "great", "right", "still",
        "now", "always", "never", "often", "ever", "back", "over", "out", "up",
        "down", "off", "let", "lets", "put", "puts", "work", "works", "look",
        "looks", "looked", "looking", "being", "talk", "talks", "talked", "talking"
    ]);

    // Clean and split text into words
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const wordCount = new Map<string, number>();
    for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }

    // Sort by frequency and get top keywords
    const sortedWords = Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxKeywords)
        .map(([word]) => word);

    // Capitalize first letter for display
    return sortedWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));
}

export default function BrowsePage() {
    const { reelData, sentimentData, isAutoPilot } = useAnalysis();
    const router = useRouter();
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);

    // Extract keywords from character analysis
    const keywords = useMemo(() => {
        if (!reelData) return [];
        
        // Collect keywords from character properties
        const textSources: string[] = [];
        
        // Extract character names from sentiment data
        if (sentimentData?.character_emotions) {
            for (const character of sentimentData.character_emotions) {
                if (character.name) textSources.push(character.name);
            }
        }
        
        // Extract from characters
        if (reelData.characters && reelData.characters.length > 0) {
            for (const character of reelData.characters) {
                if (character.mood) textSources.push(character.mood);
                if (character.tone) textSources.push(character.tone);
                if (character.facial_expression) textSources.push(character.facial_expression);
                if (character.notes) textSources.push(character.notes);
                if (character.gender) textSources.push(character.gender);
                if (character.race) textSources.push(character.race);
            }
        }
        
        // Fallback to summary if no character data
        if (textSources.length === 0) {
            if (reelData.main_summary) textSources.push(reelData.main_summary);
            if (reelData.commentary_summary) textSources.push(reelData.commentary_summary);
        }
        
        const combinedText = textSources.join(" ");
        return extractKeywords(combinedText, 8);
    }, [reelData, sentimentData]);

    // Auto-select first keyword when keywords change
    const activeKeyword = selectedKeyword || (keywords.length > 0 ? keywords[0] : null);

    // Auto-select first keyword on mount
    useMemo(() => {
        if (keywords.length > 0 && !selectedKeyword) {
            setSelectedKeyword(keywords[0]);
        }
    }, [keywords, selectedKeyword]);

    useEffect(() => {
        if (isAutoPilot && keywords.length > 0) {
            setAutoPilotStatus("Browse Complete. Transferring to AI Detection in 8s...");
            const timer = setTimeout(() => {
                router.push("/ai-detection");
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isAutoPilot, keywords, router]);

    const handleKeywordChange = (keyword: string) => {
        setSelectedKeyword(keyword);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        <span className="aurora-text">Browse</span>
                    </h1>
                </motion.header>

                {/* Keyword Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles size={16} className="text-aurora-cyan" />
                        <span className="text-sm text-white/50 font-medium uppercase tracking-wider">
                            Video Keywords
                        </span>
                    </div>
                    
                    <KeywordFilters
                        keywords={keywords}
                        selectedKeyword={activeKeyword}
                        onKeywordChange={handleKeywordChange}
                    />
                </motion.div>

                {/* Search Results */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    {activeKeyword ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <Search size={14} />
                                <span>
                                    Searching for: <span className="text-aurora-cyan font-semibold">&quot;{activeKeyword}&quot;</span>
                                </span>
                            </div>
                            
                            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                                <GoogleCSEEmbed searchQuery={activeKeyword} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center">
                            <Search className="mx-auto mb-4 text-white/20" size={48} />
                            <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                                No Keywords Available
                            </h2>
                            <p className="text-white/40 text-sm max-w-md mx-auto">
                                Analyze a video first to extract keywords. Then you can search for related content here.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
