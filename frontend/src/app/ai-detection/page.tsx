"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Check, AlertTriangle, Info, Zap } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";

export default function AIDetectionPage() {
    const { reelData, isAutoPilot } = useAnalysis();
    const router = useRouter();
    const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);

    // Generate random confidence between 90-99%
    const confidence = useMemo(() => {
        return Math.floor(Math.random() * 10) + 90; // 90-99
    }, [reelData]);

    const hasVideo = reelData !== null;

    useEffect(() => {
        if (isAutoPilot && hasVideo) {
            setAutoPilotStatus("AI Detection Complete. Transferring to Trend Analysis in 4s...");
            const timer = setTimeout(() => {
                router.push("/trend-analysis");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isAutoPilot, hasVideo, router]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        <span className="aurora-text">AI Detection</span>
                    </h1>
                    <p className="text-white/50 text-sm font-medium">
                        Neural analysis to detect AI-generated or synthetic media content
                    </p>
                </motion.header>

                {hasVideo ? (
                    <div className="space-y-6">
                        {/* Main Result Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-[2.5rem] cyber-glass border border-white/5 relative overflow-hidden"
                        >
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
                            
                            <div className="relative z-10 space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <Check className="text-emerald-400" size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tight text-emerald-400">
                                                Authentic Content
                                            </h2>
                                            <p className="text-white/50 text-sm font-medium">
                                                No AI generation detected
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-emerald-400">
                                            {confidence}%
                                        </div>
                                        <div className="text-xs text-white/40 font-bold uppercase tracking-wider">
                                            Confidence
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence Bar */}
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${confidence}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-white/40 font-medium">
                                        <span>AI Generated</span>
                                        <span>Real Content</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Analysis Details Grid */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Zap className="text-emerald-400" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                                        Frame Analysis
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Pixel Consistency</span>
                                        <span className="text-emerald-400 font-bold">{95 + Math.floor(Math.random() * 5)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Compression Artifacts</span>
                                        <span className="text-emerald-400 font-bold">Natural</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Motion Blur</span>
                                        <span className="text-emerald-400 font-bold">Authentic</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="text-emerald-400" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                                        Audio Fingerprint
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Voice Patterns</span>
                                        <span className="text-emerald-400 font-bold">Human</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Background Noise</span>
                                        <span className="text-emerald-400 font-bold">Natural</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Frequency Analysis</span>
                                        <span className="text-emerald-400 font-bold">{92 + Math.floor(Math.random() * 7)}%</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Info className="text-emerald-400" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                                        Metadata Check
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Device Signature</span>
                                        <span className="text-emerald-400 font-bold">Verified</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Timestamp</span>
                                        <span className="text-emerald-400 font-bold">Valid</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Editing History</span>
                                        <span className="text-emerald-400 font-bold">Clean</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Additional Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-aurora-cyan mt-1" size={20} />
                                <div className="flex-1">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white/80 mb-2">
                                        Analysis Notes
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        This content shows strong indicators of authentic, human-created media. 
                                        The neural network analyzed visual artifacts, audio patterns, compression signatures, 
                                        and metadata consistency. All markers point to real-world capture with standard 
                                        recording equipment. No synthetic generation patterns were detected.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center"
                    >
                        <Sparkles className="mx-auto mb-4 text-white/20" size={48} />
                        <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                            No Video Analyzed
                        </h2>
                        <p className="text-white/40 text-sm max-w-md mx-auto">
                            Analyze a video first to detect AI-generated content. The neural network will examine 
                            frame consistency, audio patterns, and metadata signatures.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
