"use client";

import { motion } from "framer-motion";
import { Check, Hash } from "lucide-react";

interface KeywordFiltersProps {
    keywords: string[];
    selectedKeyword: string | null;
    onKeywordChange: (keyword: string) => void;
}

export function KeywordFilters({
    keywords,
    selectedKeyword,
    onKeywordChange,
}: KeywordFiltersProps) {
    if (keywords.length === 0) {
        return (
            <div className="flex items-center gap-3 py-2">
                <span className="text-white/40 text-sm italic">
                    No keywords extracted yet. Analyze a video to see keywords here.
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {keywords.map((keyword) => {
                const isActive = selectedKeyword === keyword;
                return (
                    <motion.button
                        key={keyword}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onKeywordChange(keyword)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${
                            isActive
                                ? "bg-aurora-cyan text-black border-aurora-cyan font-bold"
                                : "bg-transparent border-white/10 text-white/60 hover:border-aurora-cyan/50 hover:text-white"
                        }`}
                    >
                        <Hash 
                            size={14} 
                            className={isActive ? "text-black" : "text-aurora-cyan"} 
                        />
                        <span className="text-sm font-semibold">{keyword}</span>
                        {isActive && <Check size={14} />}
                    </motion.button>
                );
            })}
        </div>
    );
}
