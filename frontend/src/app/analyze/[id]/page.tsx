"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    AudioLines,
    Eye,
    Clock,
    Info,
    ChevronRight,
    Share2,
    FileText,
    ArrowLeft,
    Users,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    XCircle,
    HelpCircle,
    ExternalLink
} from "lucide-react";
import type { EnhancedReelAnalysis, Claim } from "@/lib/api";

export default function AnalysisResult() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<EnhancedReelAnalysis | null>(null);
    const [analyzedUrl, setAnalyzedUrl] = useState<string>('');

    useEffect(() => {
        // Retrieve analysis from sessionStorage
        const storedResult = sessionStorage.getItem('analysisResult');
        const storedUrl = sessionStorage.getItem('analyzedUrl');

        if (storedResult) {
            setAnalysis(JSON.parse(storedResult));
        }
        if (storedUrl) {
            setAnalyzedUrl(storedUrl);
        }
    }, []);

    if (!analysis) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-white/40">No analysis data found</p>
                    <button
                        onClick={() => router.push('/analyze')}
                        className="px-6 py-3 bg-aurora-cyan text-black rounded-2xl font-bold"
                    >
                        Start New Analysis
                    </button>
                </div>
            </div>
        );
    }

    const truthScore = analysis.overall_truth_score ?? 1.0;
    const truthColor = truthScore >= 0.7 ? 'text-green-400' : truthScore >= 0.4 ? 'text-yellow-400' : 'text-red-400';
    const harmfulness = analysis.fact_check_report?.content_harmfulness || 'low';
    const harmColor = harmfulness === 'low' ? 'text-green-400' : harmfulness === 'medium' ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8 pt-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/analyze')}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Analyzer
                </button>

                {/* Header */}
                <header className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-aurora-cyan text-sm font-bold uppercase tracking-widest mb-2">
                            <div className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse"></div> Analysis Complete
                        </div>
                        <h1 className="text-4xl font-black max-w-3xl">{analysis.main_summary}</h1>
                        {analyzedUrl && (
                            <a
                                href={analyzedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 mt-2 flex items-center gap-2 hover:text-aurora-cyan transition-colors"
                            >
                                <ExternalLink size={14} /> {analyzedUrl.slice(0, 60)}...
                            </a>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 cyber-glass border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-white/70">
                            <Share2 size={18} /> Share
                        </button>
                        <button className="px-6 py-3 bg-white text-black rounded-2xl flex items-center gap-2 hover:scale-105 transition-all font-black">
                            <FileText size={18} /> Full Report
                        </button>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Summary & Characters */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Commentary Summary */}
                        <div className="p-10 rounded-[3rem] cyber-glass border border-white/5">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <MessageSquare className="text-aurora-cyan" /> Detailed Commentary
                            </h2>
                            <p className="text-white/70 leading-relaxed text-lg">{analysis.commentary_summary}</p>
                        </div>

                        {/* Characters */}
                        {analysis.characters.length > 0 && (
                            <div className="p-10 rounded-[3rem] cyber-glass border border-white/5">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <Users className="text-aurora-rose" /> Characters Detected
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {analysis.characters.map((char, i) => (
                                        <div key={i} className="group rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-aurora-rose/30 transition-all hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                                            {char.frame_image_b64 && (
                                                <div className="relative w-full aspect-[4/5] overflow-hidden">
                                                    <img
                                                        src={char.frame_image_b64}
                                                        alt=""
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            )}
                                            <div className="p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-aurora-rose/10 flex items-center justify-center border border-aurora-rose/20 group-hover:bg-aurora-rose/20 transition-colors">
                                                        <Users size={24} className="text-aurora-rose" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-lg block">Character {i + 1}</span>
                                                        {char.timestamp !== undefined && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                                                Captured at {char.timestamp.toFixed(1)}s
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-tight">
                                                    {char.gender && <div className="p-2 rounded-lg bg-white/5 border border-white/5"><span className="text-white/20 mr-1">Gender:</span> {char.gender}</div>}
                                                    {char.race && <div className="p-2 rounded-lg bg-white/5 border border-white/5"><span className="text-white/20 mr-1">Race:</span> {char.race}</div>}
                                                    {char.tone && <div className="p-2 rounded-lg bg-white/5 border border-white/5"><span className="text-white/20 mr-1">Tone:</span> {char.tone}</div>}
                                                    {char.mood && <div className="p-2 rounded-lg bg-white/5 border border-white/5"><span className="text-white/20 mr-1">Mood:</span> {char.mood}</div>}
                                                    {char.facial_expression && <div className="p-2 rounded-lg bg-white/5 border border-white/5 col-span-2"><span className="text-white/20 mr-1">Expression:</span> {char.facial_expression}</div>}
                                                </div>
                                                {char.notes && <p className="text-white/50 text-sm leading-relaxed italic">{char.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        {analysis.transcript && (
                            <div className="p-10 rounded-[3rem] cyber-glass border border-white/5">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <AudioLines className="text-aurora-blue" /> Transcript
                                </h2>
                                <div className="bg-white/5 rounded-2xl p-6 max-h-64 overflow-y-auto">
                                    <p className="text-white/70 italic whitespace-pre-wrap">{analysis.transcript}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Scores & Issues */}
                    <div className="space-y-8">
                        {/* Truth Score */}
                        <div className="p-10 rounded-[3rem] cyber-glass border border-white/5">
                            <h2 className="text-xl font-black mb-6">Truth Score</h2>
                            <div className="flex items-center justify-center">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="40"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="50" cy="50" r="40"
                                            fill="none"
                                            stroke={truthScore >= 0.7 ? '#4ade80' : truthScore >= 0.4 ? '#facc15' : '#f87171'}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${truthScore * 251.2} 251.2`}
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className={`text-4xl font-black ${truthColor}`}>{Math.round(truthScore * 100)}%</span>
                                        <span className="text-xs text-white/40">Verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-6 text-center text-sm font-bold uppercase ${harmColor}`}>
                                Harmfulness: {harmfulness}
                            </div>
                        </div>

                        {/* Possible Issues */}
                        {analysis.possible_issues.length > 0 && (
                            <div className="p-10 rounded-[3rem] cyber-glass border border-white/5 space-y-6">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <AlertTriangle className="text-yellow-400" /> Issues Detected
                                </h2>
                                <div className="space-y-4">
                                    {analysis.possible_issues.map((issue, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
                                            {issue}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {analysis.suggestions.length > 0 && (
                            <div className="p-10 rounded-[3rem] cyber-glass border border-white/5 space-y-6">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <Info className="text-aurora-blue" /> Suggestions
                                </h2>
                                <div className="space-y-3">
                                    {analysis.suggestions.map((suggestion, i) => (
                                        <div key={i} className="flex items-start gap-3 text-white/60 text-sm">
                                            <ChevronRight size={16} className="text-aurora-cyan mt-0.5 flex-shrink-0" />
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fact Check Claims */}
                {analysis.fact_check_report && analysis.fact_check_report.claims_detected.length > 0 && (
                    <div className="p-10 rounded-[3rem] cyber-glass border border-white/5">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <ShieldAlert className="text-aurora-rose" /> Fact-Checked Claims
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {analysis.fact_check_report.claims_detected.map((claim, i) => (
                                <ClaimCard key={i} claim={claim} />
                            ))}
                        </div>

                        {/* Recommendations */}
                        {analysis.fact_check_report.recommendations.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h3 className="text-lg font-bold mb-4">Recommendations</h3>
                                <div className="flex flex-wrap gap-3">
                                    {analysis.fact_check_report.recommendations.map((rec, i) => (
                                        <div key={i} className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/60">
                                            {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ClaimCard({ claim }: { claim: Claim }) {
    const statusConfig = {
        verified_true: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Verified True' },
        verified_false: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Verified False' },
        mixed: { icon: HelpCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Mixed' },
        uncertain: { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Uncertain' },
    };

    const status = claim.verification_status ? statusConfig[claim.verification_status] : statusConfig.uncertain;
    const StatusIcon = status.icon;

    return (
        <div className={`p-6 rounded-2xl ${status.bg} border border-white/5 space-y-4`}>
            <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase text-white/40">{claim.claim_type}</span>
                <div className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={16} />
                    <span className="text-xs font-bold">{status.label}</span>
                </div>
            </div>
            <p className="font-medium">{claim.claim_text}</p>
            {claim.explanation && (
                <p className="text-sm text-white/50">{claim.explanation}</p>
            )}
            {claim.sources.length > 0 && (
                <div className="space-y-2">
                    <span className="text-xs text-white/40">Sources:</span>
                    {claim.sources.map((source, i) => (
                        <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-aurora-cyan hover:underline truncate"
                        >
                            {source.title || source.url}
                        </a>
                    ))}
                </div>
            )}
            <div className="text-xs text-white/30">
                Confidence: {Math.round(claim.confidence * 100)}%
            </div>
        </div>
    );
}
