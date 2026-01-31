import { motion } from "framer-motion";
import { Check, Play, Bookmark, BarChart3, Scale } from "lucide-react";
import { SearchResult, ViewMode } from "../types";
import {
    getPlatformIcon,
    getPlatformColor,
    getSentimentIcon,
    getSentimentColor,
    getBiasColor,
} from "../utils/platform";
import { formatDuration, getRelativeTime, formatNumber } from "../utils/format";

interface ResultCardProps {
    result: SearchResult;
    viewMode: ViewMode;
    isSelected: boolean;
    isChecked: boolean;
    onSelect: () => void;
    onToggleCheck: () => void;
    index: number;
}

export function ResultCard({
    result,
    viewMode,
    isSelected,
    isChecked,
    onSelect,
    onToggleCheck,
    index,
}: ResultCardProps) {
    const platformColor = getPlatformColor(result.platform);

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={onSelect}
                className={`group flex gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                        ? "bg-aurora-cyan/5 border-aurora-cyan/50"
                        : "bg-white/[0.02] border-white/5 hover:border-aurora-cyan/30 hover:bg-white/[0.04]"
                }`}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheck();
                    }}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-1 transition-all cursor-pointer ${
                        isChecked
                            ? "bg-aurora-cyan border-aurora-cyan"
                            : "border-white/20 hover:border-aurora-cyan/50"
                    }`}
                >
                    {isChecked && <Check size={12} className="text-black" />}
                </div>

                {result.content.thumbnailUrl && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${result.content.thumbnailUrl})` }}
                        />
                        {result.content.duration && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold">
                                {formatDuration(result.content.duration)}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: platformColor }}>{getPlatformIcon(result.platform)}</span>
                        <span className="text-aurora-cyan text-xs font-medium">
                            {result.author.username}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/30 text-xs">
                            {getRelativeTime(result.metadata.publishedAt)}
                        </span>
                        <span className="text-white/30 text-xs ml-auto">
                            {formatNumber(result.metadata.views)} views
                        </span>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-1">
                        {result.content.title || result.content.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <span
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${getSentimentColor(
                                result.quickAnalysis.sentiment.label
                            )}`}
                        >
                            {getSentimentIcon(result.quickAnalysis.sentiment.label)}
                            {Math.round(Math.abs(result.quickAnalysis.sentiment.score) * 100)}%{" "}
                            {result.quickAnalysis.sentiment.label}
                        </span>
                        <span
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${getBiasColor(
                                result.quickAnalysis.biasLevel
                            )}`}
                        >
                            <Scale size={12} />
                            {result.quickAnalysis.biasLevel} bias
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button className="px-3 py-1.5 rounded-lg bg-aurora-cyan text-black text-xs font-bold hover:bg-aurora-cyan/90 transition-all">
                        Analyze
                    </button>
                    <button className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-aurora-cyan hover:border-aurora-cyan/30 transition-all">
                        <Bookmark size={14} />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onSelect}
            className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isSelected
                    ? "bg-aurora-cyan/5 border-aurora-cyan/50"
                    : "bg-white/[0.02] border-white/5 hover:border-aurora-cyan/30 hover:bg-white/[0.04] hover:-translate-y-1"
            }`}
        >
            {result.content.thumbnailUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 mb-4">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${result.content.thumbnailUrl})` }}
                    />
                    <div
                        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                    >
                        <span style={{ color: platformColor }}>{getPlatformIcon(result.platform)}</span>
                        <span className="text-white text-[10px] font-bold capitalize">
                            {result.platform === "youtube-shorts" ? "YouTube" : result.platform}
                        </span>
                    </div>
                    {result.content.duration && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/85 text-xs font-bold">
                            {formatDuration(result.content.duration)}
                        </div>
                    )}
                    {result.contentType === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Play size={20} className="text-white ml-1" />
                            </div>
                        </div>
                    )}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCheck();
                        }}
                        className={`absolute top-3 right-3 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isChecked
                                ? "bg-aurora-cyan border-aurora-cyan"
                                : "border-white/30 bg-black/50 opacity-0 group-hover:opacity-100"
                        }`}
                    >
                        {isChecked && <Check size={14} className="text-black" />}
                    </div>
                </div>
            ) : (
                <div className="relative mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                            style={{ backgroundColor: `${platformColor}15` }}
                        >
                            <span style={{ color: platformColor }}>{getPlatformIcon(result.platform)}</span>
                            <span className="text-[10px] font-bold capitalize" style={{ color: platformColor }}>
                                {result.platform}
                            </span>
                        </div>
                        <span className="text-white/30 text-xs ml-auto">
                            {formatNumber(result.metadata.views)} views
                        </span>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCheck();
                            }}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                isChecked
                                    ? "bg-aurora-cyan border-aurora-cyan"
                                    : "border-white/20 opacity-0 group-hover:opacity-100"
                            }`}
                        >
                            {isChecked && <Check size={12} className="text-black" />}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 mb-2">
                <span className="text-aurora-cyan text-xs font-medium truncate">
                    {result.author.username}
                </span>
                {result.author.verified && (
                    <div className="w-3.5 h-3.5 rounded-full bg-aurora-blue flex items-center justify-center">
                        <Check size={8} className="text-white" />
                    </div>
                )}
                <span className="text-white/30">•</span>
                <span className="text-white/30 text-xs">{getRelativeTime(result.metadata.publishedAt)}</span>
            </div>

            <p className="text-white/80 text-sm line-clamp-2 mb-4 leading-relaxed">
                {result.content.title || result.content.text}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border bg-white/[0.02] ${getSentimentColor(
                        result.quickAnalysis.sentiment.label
                    )}`}
                >
                    {getSentimentIcon(result.quickAnalysis.sentiment.label)}
                    {Math.round(Math.abs(result.quickAnalysis.sentiment.score) * 100)}%{" "}
                    {result.quickAnalysis.sentiment.label}
                </span>
                <span
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border bg-white/[0.02] ${getBiasColor(
                        result.quickAnalysis.biasLevel
                    )}`}
                >
                    <Scale size={12} />
                    {result.quickAnalysis.biasLevel} bias
                </span>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-aurora-cyan text-black text-xs font-bold hover:bg-aurora-cyan/90 transition-all">
                    <BarChart3 size={14} />
                    Analyze Content
                </button>
                <button className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-aurora-cyan hover:border-aurora-cyan/30 transition-all">
                    <Bookmark size={16} />
                </button>
            </div>
        </motion.div>
    );
}
