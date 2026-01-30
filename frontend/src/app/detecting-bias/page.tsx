"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    Target,
    Lock,
    Zap,
} from "lucide-react";
import { BIAS_CATEGORIES } from "./constants/bias-data";
import { BiasCard } from "./components/BiasCard";
import { NeuralRiskVectors } from "./components/NeuralRiskVectors";
import { PolicyConflicts } from "./components/PolicyConflicts";
import { EvidenceMatrix } from "./components/EvidenceMatrix";
import { RegionalHeatmapModal } from "./components/RegionalHeatmapModal";

export default function DetectingBiasPage() {
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="min-h-screen p-6 pt-10 relative selection:bg-aurora-cyan/30 text-white">
            <div className="max-w-8xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="text-aurora-cyan" size={14} />
                            <span className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px]">Narrative Security Matrix</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                            Detecting <span className="aurora-text">Bias</span>
                        </h1>
                    </div>
                </motion.header>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Metadata & Risk Indicator (4 Cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* 1. Video Context Section */}
                        <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden group">
                            <div className="aspect-video bg-[#020202] relative flex items-center justify-center">
                                <Lock size={32} className="text-white/5 group-hover:text-aurora-cyan/20 transition-all" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-aurora-cyan mb-1">Source Context</p>
                                    <h3 className="text-xs font-black uppercase tracking-tight truncate">Multi-Regional Narrative Analysis.mp4</h3>
                                </div>
                            </div>
                        </div>

                        {/* 2. Overall Bias Risk Level */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Target size={120} className="text-aurora-blue" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Bias Index Protocol</h3>
                                <div className="flex items-end gap-3">
                                    <span className="text-6xl font-black uppercase tracking-tighter italic text-aurora-blue">74.2%</span>
                                    <span className="text-[10px] font-black text-aurora-cyan uppercase pb-3 tracking-widest font-display">High Risk</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-white/50 leading-relaxed border-t border-white/5 pt-6 font-display">
                                Narrative skew detected through extreme sentiment clustering and selective contextual omission.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-aurora-cyan uppercase tracking-widest">
                                <Zap size={14} /> Critical Multi-Signal Drift detected
                            </div>
                        </div>

                        {/* 8. Confidence & Transparency */}
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-white/60">
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Confidence</span>
                                <span className="text-xs font-black">88.4%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-aurora-blue to-aurora-cyan"
                                    initial={{ width: 0 }}
                                    animate={{ width: "88.4%" }}
                                />
                            </div>
                            <p className="text-[9px] leading-relaxed text-white/20 font-bold uppercase tracking-tighter">
                                Bias assessment is based on high-level multimodal signal aggregates.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Detailed Bias Layers (8 Cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 3. Bias Type Overview */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {BIAS_CATEGORIES.map(category => (
                                <BiasCard 
                                    key={category.id} 
                                    category={category} 
                                    onCulturalBiasClick={() => setShowMap(true)}
                                />
                            ))}
                        </div>

                        {/* 4. Neural Risk Vectors */}
                        <NeuralRiskVectors />

                        <div className="grid md:grid-cols-2 gap-8">
                            <PolicyConflicts />
                            <EvidenceMatrix />
                        </div>
                    </div>
                </div>
            </div>

            {/* India Heatmap Modal */}
            <RegionalHeatmapModal isOpen={showMap} onClose={() => setShowMap(false)} />
        </div>
    );
}