"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    AlertTriangle,
    Shield,
    Globe,
    ExternalLink,
    Info,
    Clock,
    Target,
    ArrowRight,
    Link as LinkIcon,
    Zap
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { type Claim, type FactCheckReport } from "@/lib/api";

function VerificationBadge({ status }: { status: string }) {
    const config: { [key: string]: { color: string; label: string; bgColor: string } } = {
        verified_true: {
            color: "text-green-400",
            label: "VERIFIED",
            bgColor: "bg-green-400/10 border-green-400/30"
        },
        verified_false: {
            color: "text-[#ff0080]",
            label: "FALSE",
            bgColor: "bg-[#ff0080]/10 border-[#ff0080]/30"
        },
        mixed: {
            color: "text-yellow-400",
            label: "MIXED",
            bgColor: "bg-yellow-400/10 border-yellow-400/30"
        },
        uncertain: {
            color: "text-blue-400",
            label: "UNCERTAIN",
            bgColor: "bg-blue-400/10 border-blue-400/30"
        }
    };

    const conf = config[status] || {
        color: "text-white/40",
        label: "UNKNOWN",
        bgColor: "bg-white/5 border-white/10"
    };

    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${conf.color} ${conf.bgColor} border`}>
            {conf.label}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    const colors: { [key: string]: string } = {
        statistical: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
        historical: "text-purple-400 border-purple-400/30 bg-purple-400/5",
        health: "text-green-400 border-green-400/30 bg-green-400/5",
        political: "text-red-400 border-red-400/30 bg-red-400/5",
        scientific: "text-blue-400 border-blue-400/30 bg-blue-400/5",
        consumer: "text-orange-400 border-orange-400/30 bg-orange-400/5",
        other: "text-white/40 border-white/10 bg-white/5"
    };

    const className = colors[type] || colors.other;

    return (
        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${className} border`}>
            {type}
        </span>
    );
}

function ClaimCard({ claim, index }: { claim: Claim; index: number }) {
    const [showSources, setShowSources] = useState(false);

    const hasSources = claim.sources && claim.sources.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 group hover:bg-white/[0.04] hover:border-white/10 transition-all"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <TypeBadge type={claim.claim_type} />
                        {claim.verification_status && <VerificationBadge status={claim.verification_status} />}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-white/90">{claim.claim_text}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40 font-black uppercase mb-1">Confidence</p>
                    <p className="text-2xl font-black text-aurora-cyan">{Math.round(claim.confidence * 100)}%</p>
                </div>
            </div>

            {claim.explanation && (
                <div className="p-4 rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/10">
                    <p className="text-[11px] leading-relaxed text-white/70 font-medium">{claim.explanation}</p>
                </div>
            )}

            {hasSources && (
                <div className="space-y-3">
                    <button
                        onClick={() => setShowSources(!showSources)}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                        <Globe size={12} className={showSources ? "text-aurora-cyan" : ""} />
                        {showSources ? "HIDE SOURCES" : `VIEW ${claim.sources.length} SOURCE${claim.sources.length > 1 ? 'S' : ''}`}
                        <ArrowRight size={10} className={`transition-transform ${showSources ? "rotate-90" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {showSources && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pl-4 border-l-2 border-aurora-cyan/20"
                            >
                                {claim.sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-aurora-cyan/30 hover:bg-aurora-cyan/5 transition-all group/link"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-[11px] font-bold text-white/70 line-clamp-2 group-hover/link:text-aurora-cyan transition-colors">
                                                {source.title || "Source"}
                                            </p>
                                            <ExternalLink size={12} className="text-white/20 shrink-0 group-hover/link:text-aurora-cyan transition-colors" />
                                        </div>
                                        {source.snippet && (
                                            <p className="text-[10px] text-white/40 line-clamp-2 mt-1">{source.snippet}</p>
                                        )}
                                        {source.url && (
                                            <p className="text-[9px] text-white/20 truncate mt-1">{source.url}</p>
                                        )}
                                    </a>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}

function TruthScoreGauge({ score }: { score: number }) {
    const percentage = Math.round(score * 100);

    const getColor = () => {
        if (percentage >= 80) return "from-green-400 to-emerald-500";
        if (percentage >= 60) return "from-aurora-cyan to-blue-400";
        if (percentage >= 40) return "from-yellow-400 to-orange-400";
        return "from-[#ff0080] to-red-600";
    };

    return (
        <div className="relative w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(${getColor().replace('from-', '').replace(' to-', ',')} ${percentage}%, transparent ${percentage}%)`,
                opacity: 0.2
            }} />
            <div className="absolute inset-2 rounded-full bg-[#050505] flex flex-col items-center justify-center">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Truth Score</p>
                <p className="text-5xl font-black text-white">{percentage}<span className="text-lg text-white/40">%</span></p>
            </div>
        </div>
    );
}

function NoDataState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white/40 p-6">
            <div className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md space-y-6">
                <AlertTriangle size={48} className="mx-auto text-aurora-cyan" />
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        No Analysis Data
                    </h2>
                    <p className="text-sm text-white/40">
                        Analyze content from the Dashboard first to generate fact-checking results.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function FactCheckingPage() {
    const { reelData, sentimentData, input, isAutoPilot } = useAnalysis();
    const router = useRouter();
    const [factCheckData, setFactCheckData] = useState<FactCheckReport | null>(null);
    const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);

    useEffect(() => {
        if (reelData?.fact_check_report) {
            setFactCheckData(reelData.fact_check_report);
        }
    }, [reelData]);

    useEffect(() => {
        if (isAutoPilot && factCheckData) {
            setAutoPilotStatus("Fact Check Complete. Transferring to Browse in 8s...");
            const timer = setTimeout(() => {
                router.push("/browse");
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isAutoPilot, factCheckData, router]);

    if (!factCheckData) {
        return <NoDataState />;
    }

    const truthScore = factCheckData.overall_truth_score || 0.85;
    const claims = factCheckData.claims_detected || [];
    const harmfulness = factCheckData.content_harmfulness || "low";
    const recommendations = factCheckData.recommendations || [];

    const harmfulnessColor = harmfulness === "high" ? "text-[#ff0080]" : harmfulness === "medium" ? "text-yellow-400" : "text-green-400";
    const harmfulnessBg = harmfulness === "high" ? "bg-[#ff0080]/10 border-[#ff0080]/30" : harmfulness === "medium" ? "bg-yellow-400/10 border-yellow-400/30" : "bg-green-400/10 border-green-400/30";

    return (
        <div className="min-h-screen p-6 pt-10 relative selection:bg-aurora-cyan/30 text-white">
            <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">

                <motion.header
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="text-aurora-cyan" size={14} />
                            <span className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px]">
                                Claim Verification Protocol
                            </span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">
                            Fact <span className="aurora-text">Checking</span>
                        </h1>
                    </div>
                    {input?.content && (
                        <div className="text-right">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Analyzing</p>
                            <p className="text-xs font-black truncate max-w-md">{input.content || input.file?.name}</p>
                        </div>
                    )}
                </motion.header>

                <div className="grid lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6"
                        >
                            <TruthScoreGauge score={truthScore} />

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${harmfulnessColor} ${harmfulnessBg}`}>
                                        Harmfulness: {harmfulness}
                                    </span>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Claims Detected</p>
                                    <p className="text-4xl font-black text-white">{claims.length}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                <Target size={12} className="text-aurora-cyan" /> Guidelines
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-[11px] text-white/60">
                                    <CheckCircle size={12} className="text-green-400 shrink-0 mt-0.5" />
                                    <span>Green = Verified by sources</span>
                                </div>
                                <div className="flex items-start gap-3 text-[11px] text-white/60">
                                    <AlertTriangle size={12} className="text-[#ff0080] shrink-0 mt-0.5" />
                                    <span>Red = Contradicted by sources</span>
                                </div>
                                <div className="flex items-start gap-3 text-[11px] text-white/60">
                                    <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                                    <span>Blue = Insufficient evidence</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        {claims.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center"
                            >
                                <CheckCircle size={48} className="mx-auto text-green-400/20 mb-4" />
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2">No Claims Detected</h3>
                                <p className="text-sm text-white/40">
                                    This content doesn't appear to contain verifiable factual claims.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between mb-6"
                                >
                                    <h2 className="text-lg font-black uppercase tracking-wider">
                                        Detected Claims
                                    </h2>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan">
                                        {claims.length} TOTAL
                                    </span>
                                </motion.div>

                                {claims.map((claim, index) => (
                                    <ClaimCard key={index} claim={claim} index={index} />
                                ))}
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-8 rounded-[2.5rem] bg-aurora-cyan/5 border border-aurora-cyan/10 space-y-4"
                            >
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-aurora-cyan flex items-center gap-2">
                                    <Zap size={12} /> Recommendations
                                </h3>
                                <div className="space-y-2 pl-4">
                                    {recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-1 h-1 rounded-full bg-aurora-cyan mt-1.5 shrink-0" />
                                            <p className="text-sm text-white/70">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-start gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors"
                        >
                            <Info size={18} className="text-white/20 mt-1 shrink-0 group-hover:text-aurora-cyan/60 transition-colors" />
                            <p className="text-[11px] leading-relaxed text-white/30 font-medium font-display">
                                <span className="text-white/60 font-black uppercase tracking-widest">AI Verification Protocol:</span> All claims are verified using Google Search with sources. Confidence scores indicate AI certainty about claim detection, not truthfulness. Source links provide external verification. This system cannot replace human editorial review.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
