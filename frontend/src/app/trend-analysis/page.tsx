"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAnalysis } from "@/context/AnalysisContext";
import { useState, useEffect } from "react";
import { analyzeVideoUrl } from "@/lib/api";

export default function TrendAnalysisPage() {
    const { input, isInputValid, reelData, setReelData } = useAnalysis();
    const [loading, setLoading] = useState(!reelData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (reelData || !isInputValid) return;

        async function fetchData() {
            try {
                setLoading(true);
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
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
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
                        Intelligence Feed // Back to Pulse
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="text-aurora-cyan" size={14} />
                            <span className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px]">
                                Temporal Insights
                            </span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                            Trend <span className="aurora-text">Analysis</span>
                        </h1>
                    </div>
                </motion.header>

                {loading && (
                    <div className="py-12 text-center">
                        <Loader2 className="mx-auto text-aurora-cyan animate-spin mb-4" size={32} />
                        <p className="text-white/40 text-sm">Aggregating Trend Vectors...</p>
                    </div>
                )}

                {error && (
                    <div className="p-6 bg-aurora-rose/10 border border-aurora-rose/20 rounded-2xl text-aurora-rose text-center">
                        {error}
                    </div>
                )}

                {reelData && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2.5rem] cyber-glass border border-white/5 overflow-hidden"
                    >
                        <div className="p-12 space-y-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-aurora-cyan/10">
                                    <TrendingUp size={32} className="text-aurora-cyan" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Intelligence Insights</h2>
                                    <p className="text-white/40 text-sm">Generated from multimodal pattern analysis</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Core Narrative</h3>
                                    <p className="text-white/80 leading-relaxed font-medium">
                                        {reelData.main_summary}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Potential Risks</h3>
                                        <ul className="space-y-4">
                                            {reelData.possible_issues.map((issue, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-white/60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-aurora-rose/50 mt-2 shrink-0" />
                                                    {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Market Suggestions</h3>
                                        <ul className="space-y-4">
                                            {reelData.suggestions.map((sug, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-white/60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan/50 mt-2 shrink-0" />
                                                    {sug}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
