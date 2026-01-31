"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldAlert,
    Target,
    Lock,
    Zap,
    AlertTriangle,
    Globe, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { BiasCard } from "./components/BiasCard";
import { NeuralRiskVectors } from "./components/NeuralRiskVectors";
import { PolicyConflicts } from "./components/PolicyConflicts";
import { EvidenceMatrix } from "./components/EvidenceMatrix";
import { useAnalysis } from "@/context/AnalysisContext";
import { BiasCategory, REGIONAL_SUMMARY } from "./constants/bias-data";
import dynamic from "next/dynamic";

// Dynamically import IndiaMap for main page
const IndiaMap = dynamic(() => import("@/components/IndiaMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-3xl min-h-[400px]">
            <div className="w-8 h-8 border-2 border-aurora-cyan/20 border-t-aurora-cyan rounded-full animate-spin" />
        </div>
    ),
});

export default function DetectingBiasPage() {
    const { reelData, input } = useAnalysis();
    const [hoveredRegion, setHoveredRegion] = useState<{ name: string; bias: number } | null>(null);

    // Default/Fallback data
    const [biasCategories, setBiasCategories] = useState<BiasCategory[]>([]);
    const [overallScore, setOverallScore] = useState(0);
    const [riskLevel, setRiskLevel] = useState("Unknown");

    useEffect(() => {
        console.log("[BIAS PAGE] useEffect triggered, reelData:", reelData);
        if (reelData) {
            const analysis = reelData.bias_analysis;
            console.log("[BIAS PAGE] bias_analysis:", analysis);
            console.log("[BIAS PAGE] analysis?.categories:", analysis?.categories);

            // Define default categories that should always appear
            const defaultCategories = [
                { id: "cultural", label: "Cultural Bias", desc: "Regional narrative framing with limited global socio-contextual representation." },
                { id: "sensitivity", label: "Sensitivity Bias", desc: "Potential overlook of specific community identifiers or historical contexts." },
                { id: "framing", label: "Narrative Framing", desc: "Selective inclusion of supporting visual data points to reinforce specific conclusions." },
                { id: "emotional", label: "Emotional Over-representation", desc: "Use of heightened emotional markers to influence narrative reception." }
            ];

            const apiCategories = analysis?.categories || [];

            const mappedCategories: BiasCategory[] = defaultCategories.map(defCat => {
                // Find matching category from API (loose match)
                const apiMatch = apiCategories.find(c => c.label.toLowerCase().includes(defCat.label.toLowerCase().split(' ')[0]));

                if (apiMatch) {
                    return {
                        id: defCat.id,
                        label: defCat.label,
                        status: apiMatch.detected ? "Detected" : "Not Detected",
                        strength: apiMatch.strength as any,
                        percent: Math.round(apiMatch.score),
                        desc: apiMatch.description || defCat.desc
                    };
                } else {
                    return {
                        id: defCat.id,
                        label: defCat.label,
                        status: "Not Detected",
                        strength: "Low",
                        percent: 0,
                        desc: defCat.desc
                    };
                }
            });

            setBiasCategories(mappedCategories);
            setOverallScore(Math.round(analysis?.overall_score || 0));
            setRiskLevel(analysis?.risk_level || "Low Risk");
        } else {
            setBiasCategories([]);
            setOverallScore(0);
            setRiskLevel("Awaiting Analysis");
        }
    }, [reelData]);

    if (!reelData) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white/40">
                <div className="text-center space-y-4">
                    <ShieldAlert size={48} className="mx-auto text-white/20" />
                    <p className="uppercase tracking-widest text-xs font-black">No analysis data available</p>
                    <p className="text-sm">Please analyze a video from the dashboard first.</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-4xl font-black uppercase tracking-tighter">
                            Detecting <span className="aurora-text">Bias</span>
                        </h1>
                    </div>
                </motion.header>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Metadata & Risk Indicator (4 Cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* 1. Video Context Section */}
                        <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden group">
                            <div className="p-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-aurora-cyan">Source Context</p>
                                    <h3 className="text-xs font-black uppercase tracking-tight">
                                        {input.modality === 'video' ? 'Video Analysis' : 'Content Analysis'}
                                    </h3>
                                    <p className="text-[10px] text-white/40 break-all">{input.content || input.file?.name}</p>
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
                                    <span className={`text-6xl font-black uppercase tracking-tighter italic ${overallScore > 70 ? 'text-[#ff0080]' :
                                        overallScore > 40 ? 'text-aurora-blue' : 'text-emerald-400'
                                        }`}>
                                        {overallScore}%
                                    </span>
                                    <span className="text-[10px] text-aurora-cyan uppercase pb-3 tracking-widest font-display">
                                        {riskLevel}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-white/50 leading-relaxed border-t border-white/5 pt-6 font-display">
                                {reelData.main_summary}
                            </p>
                            {overallScore > 50 && (
                                <div className="flex items-center gap-2 text-[10px] font-black text-aurora-cyan uppercase tracking-widest">
                                    <Zap size={14} /> Significant Drift Detected
                                </div>
                            )}
                        </div>

                        {/* Regional Summary - DYNAMIC */}
                        <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="text-aurora-cyan" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Geospatial Distribution</span>
                            </div>
                            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {(reelData.bias_analysis?.geographic_relevance?.length || 0) > 0 ? (
                                    // Group states by region or just list relevant states
                                    reelData.bias_analysis?.geographic_relevance?.map((location, idx) => (
                                        <div key={location} className="flex items-center justify-between group p-2 rounded-lg bg-aurora-cyan/5 border border-aurora-cyan/20 transition-all cursor-default">
                                            <div className="flex items-center gap-2 flex-1">
                                                <TrendingUp size={12} className="text-aurora-cyan animate-pulse" />
                                                <span className="text-xs font-bold uppercase tracking-wide text-white">
                                                    {location}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black tabular-nums text-aurora-cyan">
                                                {overallScore > 0 ? Math.min(100, overallScore + (idx * 5)) : 10}%
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    // Fallback to static regions but with faded styling to indicate they are placeholders/general
                                    REGIONAL_SUMMARY.map((region, idx) => (
                                        <div key={region.name} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/[0.03] transition-all cursor-default border border-transparent opacity-40">
                                            <div className="flex items-center gap-2 flex-1">
                                                <Minus size={12} className="text-white/40" />
                                                <span className="text-xs font-bold uppercase tracking-wide text-white/60">
                                                    {region.name}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black tabular-nums text-white/20">
                                                --%
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 8. Confidence & Transparency */}
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-white/60">
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Confidence</span>
                                <span className="text-xs font-black">
                                    {reelData.fact_check_report ? Math.round(reelData.fact_check_report.overall_truth_score! * 100) : 85}%
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-aurora-blue to-aurora-cyan"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reelData.fact_check_report ? reelData.fact_check_report.overall_truth_score! * 100 : 85}%` }}
                                />
                            </div>
                            <p className="text-[9px] leading-relaxed text-white/20 font-bold uppercase tracking-tighter">
                                Bias assessment based on aggregate signal processing.
                            </p>
                        </div>

                        {/* Policy Conflicts & Evidence Matrix */}
                        <PolicyConflicts conflicts={reelData.bias_analysis?.policy_conflicts} />
                        <EvidenceMatrix metrics={reelData.bias_analysis?.evidence_matrix} />
                    </div>

                    {/* RIGHT COLUMN: Map & Analysis (8 Cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* THE MAP - NOW DIRECTLY IN THE PAGE */}
                        <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-[500px] relative group shadow-2xl">
                            <div className="absolute top-6 left-8 z-20 pointer-events-none">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                    <Globe size={18} className="text-aurora-cyan" /> Regional Heatmap
                                </h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Geospatial Narrative Analysis</p>
                            </div>

                            <div className="flex-1 bg-[#020202] relative">
                                <IndiaMap
                                    onStateHover={(name, data) => {
                                        if (name && data) setHoveredRegion({ name, bias: data.bias });
                                        else setHoveredRegion(null);
                                    }}
                                    highlightedStates={reelData.bias_analysis?.geographic_relevance}
                                />

                                <AnimatePresence>
                                    {hoveredRegion && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="absolute bottom-6 left-8 p-4 bg-black/80 backdrop-blur-xl border border-aurora-cyan/30 rounded-2xl z-20"
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-widest text-aurora-cyan mb-1">State Analysis</p>
                                            <p className="text-xl font-black">{hoveredRegion.name}</p>
                                            <p className={`text-2xl font-black ${hoveredRegion.bias >= 75 ? 'text-[#ff0080]' :
                                                hoveredRegion.bias >= 50 ? 'text-[#00f2fe]' :
                                                    'text-emerald-400'
                                                }`}>
                                                {hoveredRegion.bias}% <span className="text-[10px] text-white/40 uppercase">Bias</span>
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Legend Overlay */}
                                <div className="absolute bottom-6 right-8 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 space-y-2 pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#ff0080]" />
                                        <span className="text-[8px] font-black uppercase text-white/50">Critical</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#00f2fe]" />
                                        <span className="text-[8px] font-black uppercase text-white/50">High</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="text-[8px] font-black uppercase text-white/50">Low</span>
                                    </div>
                                </div>
                               
                            </div>
                        </div>

                        {/* Bias Category Cards - Primary Analysis */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {biasCategories.length > 0 ? biasCategories.map(category => (
                                <BiasCard
                                    key={category.id}
                                    category={category}
                                />
                            )) : (
                                <div className="col-span-full p-8 text-center text-white/30 border border-white/5 rounded-2xl bg-white/[0.01]">
                                    <AlertTriangle className="mx-auto mb-2 opacity-50" />
                                    No specific bias categories detected in this analysis.
                                </div>
                            )}
                        </div>

                        {/* Neural Risk Vectors */}
                        <NeuralRiskVectors riskVectors={reelData.bias_analysis?.risk_vectors} />
                    </div>
                </div>
            </div>
        </div>
    );
}
