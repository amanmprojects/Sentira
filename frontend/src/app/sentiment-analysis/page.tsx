"use client";

import { useAnalysis } from "@/context/AnalysisContext";
import { Activity } from "lucide-react";

export default function SentimentAnalysisPage() {
    const { modality, text, videoUrl } = useAnalysis();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 text-aurora-cyan text-[10px] font-black uppercase tracking-[0.4em]">
                        <Activity size={14} /> Intelligence Port
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Sentiment <span className="aurora-text">Analysis</span></h1>
                </header>

                <div className="p-8 rounded-[2rem] cyber-glass border border-white/5 space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-white/60">Current Context</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-[10px] uppercase font-black text-white/30 mb-1">Modality</p>
                            <p className="text-lg font-bold uppercase text-aurora-cyan">{modality}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-[10px] uppercase font-black text-white/30 mb-1">Status</p>
                            <p className="text-lg font-bold uppercase text-green-400">Ready</p>
                        </div>
                    </div>
                    {modality === 'text' && text && (
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-[10px] uppercase font-black text-white/30 mb-1">Active Text</p>
                            <p className="text-sm text-white/70 line-clamp-3">{text}</p>
                        </div>
                    )}
                    {modality === 'video' && videoUrl && (
                        <div className="p-4 rounded-xl bg-white/5">
                            <p className="text-[10px] uppercase font-black text-white/30 mb-1">Active URL</p>
                            <p className="text-sm text-white/70 truncate">{videoUrl}</p>
                        </div>
                    )}
                </div>

                <div className="p-12 rounded-[3rem] cyber-glass border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                        <Activity size={32} className="text-aurora-cyan" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Initialization</h3>
                    <p className="text-white/40 max-w-sm">Detailed sentiment scoring and emotional flux mapping will be displayed here based on your {modality} input.</p>
                </div>
            </div>
        </div>
    );
}
