import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Globe,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import dynamic from "next/dynamic";
import { REGIONAL_SUMMARY } from "../constants/bias-data";

// Dynamically import the map component to avoid SSR issues
const IndiaMap = dynamic(() => import("@/components/IndiaMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-aurora-cyan/20 border-t-aurora-cyan rounded-full animate-spin" />
        </div>
    ),
});

interface RegionalHeatmapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegionalHeatmapModal({ isOpen, onClose }: RegionalHeatmapModalProps) {
    const [hoveredRegion, setHoveredRegion] = useState<{ name: string; bias: number } | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-[95vw] w-full h-[92vh] overflow-hidden relative flex flex-col"
                    >
                        {/* Close Button */}
                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,0,0,0.1)" }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all z-20 backdrop-blur-sm"
                        >
                            <X size={20} />
                        </motion.button>

                        <div className="grid lg:grid-cols-5 gap-6 h-full overflow-hidden">
                            {/* Left Panel - Info */}
                            <div className="lg:col-span-2 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Globe className="text-aurora-cyan" size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Cultural Analysis</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none">
                                        Regional <span className="aurora-text">Heatmap</span>
                                    </h2>
                                </div>
                                <p className="text-xs md:text-sm text-white/50 font-medium leading-relaxed">
                                    Multimodal analysis of cultural sentiment bias across the Indian subcontinent. 
                                    Hover over states to see detailed bias metrics.
                                </p>

                                {/* Legend */}
                                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Bias Intensity Legend</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#ff0080] shadow-md shadow-aurora-rose/30" />
                                            <div>
                                                <span className="text-sm font-bold text-white/70 block leading-none">Critical</span>
                                                <span className="text-xs text-white/40">(75%+)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#00f2fe] shadow-md shadow-aurora-cyan/30" />
                                            <div>
                                                <span className="text-sm font-bold text-white/70 block leading-none">High</span>
                                                <span className="text-xs text-white/40">(50-74%)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#4facfe] shadow-md shadow-aurora-blue/30" />
                                            <div>
                                                <span className="text-sm font-bold text-white/70 block leading-none">Medium</span>
                                                <span className="text-xs text-white/40">(30-49%)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/30" />
                                            <div>
                                                <span className="text-sm font-bold text-white/70 block leading-none">Low</span>
                                                <span className="text-xs text-white/40">(&lt;30%)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-[#ff0080]"
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <span className="text-xs font-medium text-white/50 uppercase tracking-wide">Pulsing = Hotspot</span>
                                    </div>
                                </div>

                                {/* Regional Summary */}
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Regional Summary</h4>
                                    {REGIONAL_SUMMARY.map((region, idx) => (
                                        <motion.div 
                                            key={region.name} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/[0.03] transition-all cursor-default border border-transparent hover:border-white/5"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                {region.trend === "up" && <TrendingUp size={12} className="text-aurora-rose" />}
                                                {region.trend === "down" && <TrendingDown size={12} className="text-emerald-400" />}
                                                {region.trend === "stable" && <Minus size={12} className="text-white/40" />}
                                                <span className="text-sm font-bold uppercase tracking-wide text-white/60 group-hover:text-white/90 transition-colors">
                                                    {region.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${region.bias}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.04, ease: "easeOut" }}
                                                        className={`h-full rounded-full ${
                                                            region.bias >= 75 ? 'bg-[#ff0080]' :
                                                            region.bias >= 50 ? 'bg-[#00f2fe]' :
                                                            region.bias >= 30 ? 'bg-[#4facfe]' : 'bg-emerald-400'
                                                        }`}
                                                    />
                                                </div>
                                                <span className={`text-sm font-black tabular-nums w-11 text-right ${
                                                    region.bias >= 75 ? 'text-[#ff0080]' :
                                                    region.bias >= 50 ? 'text-[#00f2fe]' :
                                                    region.bias >= 30 ? 'text-[#4facfe]' : 'text-emerald-400'
                                                }`}>
                                                    {region.bias}%
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Panel - Map */}
                            <div className="lg:col-span-3 relative h-full flex flex-col">
                                <div className="flex-1 bg-[#020202] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
                                    <IndiaMap 
                                        onStateHover={(name, data) => {
                                            if (name && data) {
                                                setHoveredRegion({ name, bias: data.bias });
                                            } else {
                                                setHoveredRegion(null);
                                            }
                                        }}
                                    />
                                    
                                    {/* Hovered State Info - Overlay on Map */}
                                    <AnimatePresence mode="wait">
                                        {hoveredRegion && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute top-3 left-3 p-3 bg-gradient-to-br from-aurora-cyan/10 to-aurora-blue/5 border border-aurora-cyan/30 rounded-xl shadow-lg shadow-aurora-cyan/5 backdrop-blur-xl"
                                            >
                                                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-aurora-cyan mb-1 flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-aurora-cyan animate-pulse" />
                                                    Selected State
                                                </div>
                                                <p className="text-base font-black text-white mb-0.5 leading-none">{hoveredRegion.name}</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <p className={`text-2xl font-black tabular-nums leading-none ${
                                                        hoveredRegion.bias >= 75 ? 'text-[#ff0080]' :
                                                        hoveredRegion.bias >= 50 ? 'text-[#00f2fe]' :
                                                        hoveredRegion.bias >= 30 ? 'text-[#4facfe]' : 'text-emerald-400'
                                                    }`}>
                                                        {hoveredRegion.bias}%
                                                    </p>
                                                    <span className="text-[9px] text-white/40 font-medium uppercase tracking-wide">Bias</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Map Stats Overlay */}
                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2">
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex-1"
                                        >
                                            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5 leading-none">Hotspots</p>
                                            <p className="text-lg font-black text-[#ff0080] tabular-nums leading-none">8</p>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex-1"
                                        >
                                            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5 leading-none">Avg Bias</p>
                                            <p className="text-lg font-black text-[#00f2fe] tabular-nums leading-none">54.2%</p>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex-1"
                                        >
                                            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-0.5 leading-none">States</p>
                                            <p className="text-lg font-black text-white tabular-nums leading-none">28</p>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
