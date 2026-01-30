"use client";

import { motion } from "framer-motion";
// Scale, AlertCircle, ArrowLeft, Loader2 handled in previous chunk
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import { useState, useEffect } from "react";
import { analyzeVideoUrl, analyzeSentiment } from "@/lib/api";
import { AnimatePresence } from "framer-motion";
import { Scale, AlertCircle, ArrowLeft, Loader2, Zap } from "lucide-react";

export default function DetectingBiasPage() {
    const router = useRouter();
    const { input, isInputValid, reelData, setReelData, isAutoPilot } = useAnalysis();
    const [loading, setLoading] = useState(!reelData);
    const [error, setError] = useState<string | null>(null);
    const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);

    useEffect(() => {
        if (isAutoPilot && reelData && !loading) {
            setAutoPilotStatus("Bias Mapping Complete. Finalizing Intelligence Report in 5s...");
            const timer = setTimeout(() => {
                router.push("/reports");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isAutoPilot, reelData, loading, router]);

    useEffect(() => {
        if (reelData || !isInputValid) return;

        async function fetchData() {
            try {
                setLoading(true);
                // analyzeVideoUrl returns { data: EnhancedReelAnalysis, source: string }
                // So we actually need analyzeVideoUrl specifically for the reelData context
                const res = await analyzeVideoUrl(input.content);
                setReelData(res.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Analysis failed");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [input.content, isInputValid, reelData, setReelData]);

    if (!isInputValid) {
        return (
            <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md"
                >
                    <AlertCircle className="mx-auto mb-4 text-aurora-rose" size={48} />
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        No Input Provided
                    </h2>
                    <p className="text-white/40 text-sm mb-6">
                        Please return to Pulse and provide content to analyze.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/20 transition-all"
                    >
                        <ArrowLeft size={16} />
                        Return to Pulse
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 relative overflow-x-hidden">
            {/* Auto-Pilot Status Banner */}
            <AnimatePresence>
                {isAutoPilot && (
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="fixed top-0 left-0 right-0 z-[60] py-3 bg-aurora-cyan text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(0,242,254,0.2)]"
                    >
                        <Zap size={14} className="animate-pulse" />
                        {autoPilotStatus || "Neural Auto-Pilot Active: Identifying Bias Vectors"}
                        <Zap size={14} className="animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1600px] mx-auto space-y-12">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-8"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Identity Verified // Back to Pulse
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Scale className="text-aurora-rose" size={14} />
                            <span className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px]">
                                Pattern Recognition
                            </span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                            Detecting <span className="aurora-text">Bias</span>
                        </h1>
                    </div>
                </motion.header>

                {/* Input Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl cyber-glass border border-white/5"
                >
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                        Analyzing Input
                    </h3>
                    <p className="text-white/80 font-medium truncate">
                        {input.content}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-aurora-rose/10 text-aurora-rose text-[10px] font-black uppercase tracking-widest">
                        {input.modality}
                    </span>
                </motion.div>

                {reelData && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-12 rounded-[2.5rem] cyber-glass border border-white/5"
                    >
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <Scale className="text-aurora-rose" size={20} />
                                    Bias Detection Report
                                </h2>
                                <p className="text-white/80 leading-relaxed font-medium">
                                    {reelData.commentary_summary}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Problematic Patterns</h3>
                                    <ul className="space-y-3">
                                        {reelData.possible_issues.map((issue, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-white/60">
                                                <AlertCircle size={14} className="text-aurora-rose shrink-0" />
                                                {issue}
                                            </li>
                                        ))}
                                        {reelData.possible_issues.length === 0 && (
                                            <li className="text-xs text-white/20 italic">No significant bias patterns detected.</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Neural Recommendations</h3>
                                    <ul className="space-y-3">
                                        {reelData.suggestions.map((sug, i) => (
                                            <li key={i} className="flex gap-2 text-xs text-white/60">
                                                <div className="w-1.5 h-1.5 rounded-full bg-aurora-rose/50 mt-1.5 shrink-0" />
                                                {sug}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
