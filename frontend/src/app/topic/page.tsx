"use client";

import { motion } from "framer-motion";
import {
    Hash,
    BarChart2,
    Layers,
    Users,
    Share2,
    ShieldAlert,
    Flame,
    Globe,
    Zap,
    TrendingDown
} from "lucide-react";

export default function TopicAnalysis() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pt-12 overflow-hidden selection:bg-aurora-cyan/30">
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 cyber-glass rounded-2xl flex items-center justify-center border border-aurora-rose/30">
                                <Hash className="text-aurora-rose" size={28} />
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Ecosystem <span className="aurora-text">Pulse</span></h1>
                        </div>
                        <p className="text-white/40 text-xl font-medium tracking-tight">Active Scan: <span className="text-white">#ClimateChange</span> • 48 Global Source Nodes</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-4 cyber-glass border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all font-black uppercase text-xs tracking-widest text-white/50">
                            <Share2 size={18} /> Telemetry Link
                        </button>
                        <button className="px-6 py-4 bg-aurora-rose text-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(255,0,128,0.2)]">
                            <Layers size={18} /> New Protocol
                        </button>
                    </div>
                </motion.header>

                {/* Statistical Telemetry Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    <MetricCard
                        label="Narrative Polarization"
                        value="0.82"
                        status="Critical"
                        desc="Strong divergence between mainstream and indy clusters."
                        icon={<ShieldAlert className="text-aurora-rose" />}
                        color="rose"
                    />
                    <MetricCard
                        label="Social Velocity"
                        value="14.2k"
                        status="Rising"
                        desc="Exponential growth detected in regional nodes."
                        icon={<Zap className="text-aurora-cyan" />}
                        color="cyan"
                    />
                    <MetricCard
                        label="Consensus Level"
                        value="22%"
                        status="Low"
                        desc="Highly fragmented information topology."
                        icon={<TrendingDown className="text-aurora-blue" />}
                        color="blue"
                    />
                </div>

                {/* Visual Intelligence Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-12 rounded-[3rem] cyber-glass border border-white/5 h-[500px] flex flex-col group relative"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-aurora-cyan to-transparent"></div>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <BarChart2 className="text-aurora-cyan" /> Source Divergence
                            </h2>
                        </div>
                        <div className="flex-1 flex flex-col justify-between pt-10">
                            {[80, 45, 90, 30, 65].map((w, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                                        <span>Node_{i + 1}</span>
                                        <span>{w}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${w}%` }}
                                            className="h-full bg-aurora-cyan shadow-[0_0_10px_#00f2fe]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-12 rounded-[3rem] cyber-glass border border-white/5 h-[500px] flex flex-col relative"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-aurora-rose to-transparent"></div>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Globe className="text-aurora-rose" /> Cluster Topology
                            </h2>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative">
                            <div className="w-48 h-48 rounded-full border border-aurora-rose/20 animate-spin-slow flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border border-aurora-cyan/20 animate-reverse-spin flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center text-white/10 uppercase font-black text-[10px] tracking-[1em]">Scanning Nodes</div>
                        </div>
                    </motion.div>
                </div>

                {/* Source Bias Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="p-12 rounded-[4rem] cyber-glass border border-white/5"
                >
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-12 italic">Bias <span className="aurora-text">Heatmap</span></h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-white/20 text-left">
                                <tr>
                                    <th className="pb-8 font-black uppercase tracking-[0.3em] text-[10px]">Source Identity</th>
                                    <th className="pb-8 font-black uppercase tracking-[0.3em] text-[10px]">Fear Index</th>
                                    <th className="pb-8 font-black uppercase tracking-[0.3em] text-[10px]">Selective Framing</th>
                                    <th className="pb-8 font-black uppercase tracking-[0.3em] text-[10px]">Loaded Lexicon</th>
                                    <th className="pb-8 font-black uppercase tracking-[0.3em] text-[10px]">Sentiment</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-4">
                                {[
                                    { cluster: 'Mainstream Network', fear: 2, frames: 4, loaded: 1, sentiment: 0.2 },
                                    { cluster: 'Independent Nodes', fear: 8, frames: 6, loaded: 9, sentiment: -0.6 },
                                    { cluster: 'Bureau Analytics', fear: 1, frames: 1, loaded: 1, sentiment: 0.1 },
                                    { cluster: 'Social Influencers', fear: 9, frames: 8, loaded: 9, sentiment: -0.8 },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-t border-white/5 group hover:bg-white/5 transition-all">
                                        <td className="py-8 font-black text-xl italic uppercase group-hover:pl-4 transition-all">{row.cluster}</td>
                                        <td className="py-8"><HeatmapCell value={row.fear} color="rose" /></td>
                                        <td className="py-8"><HeatmapCell value={row.frames} color="rose" /></td>
                                        <td className="py-8"><HeatmapCell value={row.loaded} color="rose" /></td>
                                        <td className="py-8">
                                            <span className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${row.sentiment > 0 ? 'bg-aurora-cyan/10 text-aurora-cyan' : 'bg-aurora-rose/10 text-aurora-rose border border-aurora-rose/20'}`}>
                                                {row.sentiment > 0 ? 'Positive' : 'Negative'} ({row.sentiment})
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, status, desc, icon, color }: { label: string, value: string, status: string, desc: string, icon: React.ReactNode, color: 'cyan' | 'rose' | 'blue' }) {
    const colorMap = {
        cyan: 'text-aurora-cyan',
        rose: 'text-aurora-rose',
        blue: 'text-aurora-blue'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-10 rounded-[3rem] cyber-glass border border-white/5 space-y-6 group"
        >
            <div className="flex justify-between items-start">
                <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-all">{icon}</div>
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${colorMap[color]}`}>{status}</span>
            </div>
            <div>
                <h3 className="text-white/30 font-black uppercase tracking-[0.2em] text-[10px] mb-1">{label}</h3>
                <p className="text-5xl font-black tracking-tighter italic">{value}</p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-medium">{desc}</p>
        </motion.div>
    );
}

function HeatmapCell({ value, color }: { value: number, color: 'rose' | 'cyan' }) {
    const opacity = value / 10;
    return (
        <div className="flex items-center gap-4 group">
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${value * 10}%` }}
                    className={`h-full ${color === 'rose' ? 'bg-aurora-rose shadow-[0_0_10px_#ff0080]' : 'bg-aurora-cyan'} transition-all`}
                    style={{ opacity: opacity + 0.1 }}
                />
            </div>
            <span className="text-[10px] font-black text-white/30 tracking-widest">{value}/10</span>
        </div>
    );
}
