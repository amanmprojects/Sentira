import { motion } from "framer-motion";
import {
    X,
    Play,
    Check,
    Eye,
    Heart,
    MessageCircle,
    Repeat2,
    Share2,
    AlertCircle,
    Globe,
    BarChart3,
    ExternalLink,
    FolderPlus,
    Scale,
} from "lucide-react";
import { SearchResult } from "../types";
import { getPlatformIcon, getPlatformColor, getSentimentIcon } from "../utils/platform";
import { getRelativeTime, formatNumber } from "../utils/format";

interface PreviewPanelProps {
    result: SearchResult;
    onClose: () => void;
}

export function PreviewPanel({ result, onClose }: PreviewPanelProps) {
    const platformColor = getPlatformColor(result.platform);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                    Content Preview
                </h3>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {result.content.thumbnailUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${result.content.thumbnailUrl})` }}
                    />
                    {result.contentType === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                                <Play size={28} className="text-white ml-1" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: `${platformColor}15` }}
                >
                    <span style={{ color: platformColor }}>{getPlatformIcon(result.platform)}</span>
                    <span className="text-xs font-bold capitalize" style={{ color: platformColor }}>
                        {result.platform === "youtube-shorts"
                            ? "YouTube Shorts"
                            : result.platform === "twitter"
                            ? "Twitter/X Post"
                            : `${result.platform} ${result.contentType === "video" ? "Reel" : "Post"}`}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                        {result.author.displayName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{result.author.displayName}</span>
                            {result.author.verified && (
                                <div className="w-4 h-4 rounded-full bg-aurora-blue flex items-center justify-center">
                                    <Check size={10} className="text-white" />
                                </div>
                            )}
                        </div>
                        <span className="text-white/40 text-xs">{result.author.username}</span>
                    </div>
                    <span className="text-white/30 text-xs ml-auto">
                        {getRelativeTime(result.metadata.publishedAt)}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {result.content.title && <h4 className="text-white font-bold">{result.content.title}</h4>}
                <p className="text-white/70 text-sm leading-relaxed">{result.content.text}</p>
            </div>

            <div className="flex items-center gap-4 py-3 border-t border-b border-white/5">
                <span className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Eye size={14} />
                    {formatNumber(result.metadata.views)}
                </span>
                <span className="flex items-center gap-1.5 text-white/50 text-xs">
                    <Heart size={14} />
                    {formatNumber(result.metadata.likes)}
                </span>
                {result.metadata.comments && (
                    <span className="flex items-center gap-1.5 text-white/50 text-xs">
                        <MessageCircle size={14} />
                        {formatNumber(result.metadata.comments)}
                    </span>
                )}
                {result.metadata.retweets && (
                    <span className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Repeat2 size={14} />
                        {formatNumber(result.metadata.retweets)}
                    </span>
                )}
                {result.metadata.shares && (
                    <span className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Share2 size={14} />
                        {formatNumber(result.metadata.shares)}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
                    Quick Analysis Preview
                </h4>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                            {getSentimentIcon(result.quickAnalysis.sentiment.label)}
                            Sentiment
                        </span>
                        <span
                            className={`text-sm font-bold ${
                                result.quickAnalysis.sentiment.label === "positive"
                                    ? "text-green-400"
                                    : result.quickAnalysis.sentiment.label === "negative"
                                    ? "text-red-400"
                                    : "text-gray-400"
                            }`}
                        >
                            {Math.round(Math.abs(result.quickAnalysis.sentiment.score) * 100)}%{" "}
                            {result.quickAnalysis.sentiment.label} ✓
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                            <Scale size={14} />
                            Bias Level
                        </span>
                        <span
                            className={`text-sm font-bold capitalize ${
                                result.quickAnalysis.biasLevel === "low"
                                    ? "text-green-400"
                                    : result.quickAnalysis.biasLevel === "high"
                                    ? "text-red-400"
                                    : "text-orange-400"
                            }`}
                        >
                            {result.quickAnalysis.biasLevel} ✓
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                            <AlertCircle size={14} />
                            Toxicity
                        </span>
                        <span
                            className={`text-sm font-bold capitalize ${
                                result.quickAnalysis.toxicity === "none"
                                    ? "text-green-400"
                                    : result.quickAnalysis.toxicity === "high"
                                    ? "text-red-400"
                                    : "text-orange-400"
                            }`}
                        >
                            {result.quickAnalysis.toxicity === "none"
                                ? "None detected"
                                : result.quickAnalysis.toxicity}{" "}
                            ✓
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                            <Globe size={14} />
                            Language
                        </span>
                        <span className="text-sm font-bold text-aurora-cyan">
                            {result.quickAnalysis.language === "en" ? "English" : result.quickAnalysis.language}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-2 text-white/60 text-sm">
                            <BarChart3 size={14} />
                            Engagement
                        </span>
                        <span className="text-sm font-bold text-aurora-cyan">
                            {formatNumber(
                                result.metadata.views +
                                    result.metadata.likes +
                                    (result.metadata.comments || 0)
                            )}{" "}
                            interactions
                        </span>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/20">
                    <p className="text-[11px] text-white/50 leading-relaxed">
                        ℹ️ This is a preliminary analysis. Click &quot;Analyze Full Content&quot; for detailed
                        insights including fact-checking and comprehensive bias detection.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-aurora-cyan text-black font-bold hover:bg-aurora-cyan/90 transition-all">
                    <BarChart3 size={18} />
                    Analyze Full Content
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-medium hover:bg-white/5 hover:border-aurora-cyan/30 transition-all">
                    <ExternalLink size={16} />
                    View Original Post
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-medium hover:bg-white/5 hover:border-aurora-cyan/30 transition-all">
                    <FolderPlus size={16} />
                    Add to Report
                </button>
            </div>
        </motion.div>
    );
}
