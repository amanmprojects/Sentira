"use client";

import { motion } from "framer-motion";
import {
    BarChart2,
    ShieldAlert,
    AudioLines,
    Eye,
    Clock,
    Info,
    ChevronRight,
    Play,
    Share2,
    FileText
} from "lucide-react";
import SentimentGauge from "@/components/SentimentGauge";

export default function AnalysisResult() {
    return (
        <div className="min-h-screen bg-[#020617] text-white p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-brand-primary text-sm font-bold uppercase tracking-widest mb-2">
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div> Analysis Complete
                        </div>
                        <h1 className="text-4xl font-black">Climate Change Rhetoric: Post-2024 Analysis</h1>
                        <p className="text-white/40 mt-2">Source: YouTube • Duration: 12:45 • Analyzed on Jan 30, 2026</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 glass-dark border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-white/70">
                            <Share2 size={18} /> Share
                        </button>
                        <button className="px-6 py-3 bg-white text-black rounded-2xl flex items-center gap-2 hover:scale-105 transition-all font-black">
                            <FileText size={18} /> Full Report
                        </button>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Video & Sentiment */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/10 group relative">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center z-10">
                                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play fill="white" size={32} />
                                </div>
                            </div>
                            <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-white/5">
                                Video Player Placeholder
                            </div>
                            {/* Mini Overlay Gauge */}
                            <div className="absolute bottom-8 right-8 z-20 glass-dark p-4 rounded-3xl border border-white/10 flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-white/40">Live Bias</p>
                                    <p className="font-black text-brand-secondary">High</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-brand-secondary/30 border-t-brand-secondary"></div>
                            </div>
                        </div>

                        {/* Temporal Timeline */}
                        <div className="p-10 rounded-[3rem] glass-dark border border-white/5 h-[350px] flex flex-col">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <Clock className="text-brand-primary" /> Narrative Timeline
                            </h2>
                            <div className="flex-1 flex items-center justify-center text-white/10 italic">
                                Sequential Sentiment Line Chart Placeholder
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed Metrics */}
                    <div className="space-y-8">
                        <div className="p-10 rounded-[3rem] glass-dark border border-white/5 h-fit">
                            <SentimentGauge score={0.65} label="Positive Lean" />
                        </div>

                        <div className="p-10 rounded-[3rem] glass-dark border border-white/5 space-y-6">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <ShieldAlert className="text-brand-secondary" /> Bias Indicators
                            </h2>
                            <div className="space-y-4">
                                <BiasInsight
                                    type="Selective Framing"
                                    desc="Omission of secondary source data regarding sea levels."
                                    severity="Medium"
                                />
                                <BiasInsight
                                    type="Loaded Language"
                                    desc="Frequent use of 'catastrophic' and 'calamity'."
                                    severity="High"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multimodal Analysis Tabs */}
                <div className="grid md:grid-cols-3 gap-8">
                    <AnalysisCard
                        icon={<AudioLines className="text-brand-primary" />}
                        title="Audio Tone"
                        desc="Calm, authoritative, yet uses significant emotional peaks."
                        value="82% Confidence"
                    />
                    <AnalysisCard
                        icon={<Eye className="text-brand-accent" />}
                        title="Visual Emotion"
                        desc="High frequency of 'concern' and 'seriousness' facial markers."
                        value="91% Detection"
                    />
                    <AnalysisCard
                        icon={<Info className="text-green-500" />}
                        title="Explainability"
                        desc="Flags based on mismatch between statistical calm and visual alarm."
                        value="Reasoning Active"
                    />
                </div>
            </div>
        </div>
    );
}

function BiasInsight({ type, desc, severity }: { type: string, desc: string, severity: 'Low' | 'Medium' | 'High' }) {
    const color = severity === 'High' ? 'text-brand-secondary' : severity === 'Medium' ? 'text-yellow-500' : 'text-green-500';
    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-center mb-2">
                <span className="font-black text-sm uppercase tracking-wider">{type}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${color}`}>{severity}</span>
            </div>
            <p className="text-sm text-white/50">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-brand-primary text-[10px] font-black cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW EVIDENCE <ChevronRight size={10} />
            </div>
        </div>
    );
}

function AnalysisCard({ icon, title, desc, value }: { icon: React.ReactNode, title: string, desc: string, value: string }) {
    return (
        <div className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 inline-block">{icon}</div>
            <h3 className="text-xl font-black">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            <div className="pt-4 border-t border-white/5 text-xs font-bold text-white/30 uppercase tracking-widest">{value}</div>
        </div>
    );
}
