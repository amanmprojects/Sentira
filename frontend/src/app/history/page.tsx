"use client";

import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Video,
    Hash,
    ChevronRight,
    Calendar,
    Layers,
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pt-12 overflow-hidden selection:bg-aurora-cyan/30">
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-aurora-rose">
                            <Sparkles size={14} /> <span className="uppercase font-black tracking-[0.4em] text-[10px]">Data Repository</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Neural <span className="aurora-text">Archive</span></h1>
                        <p className="text-white/40 text-lg font-medium tracking-tight mt-2">Historical telemetry of all processed narrative protocols.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-aurora-cyan transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="SEARCH HASH / NODE / ID..."
                                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-8 w-96 text-xs font-black italic uppercase tracking-widest outline-none focus:border-aurora-cyan/30 focus:bg-white/10 transition-all font-medium"
                            />
                        </div>
                        <button className="p-4 cyber-glass border border-white/10 rounded-2xl text-white/50 hover:text-white transition-all shadow-xl">
                            <Filter size={24} />
                        </button>
                    </div>
                </motion.header>

                {/* Ledger Interface */}
                <div className="space-y-6">
                    <div className="flex items-center gap-6 text-white/20 font-black uppercase tracking-[0.3em] text-[9px] px-10">
                        <div className="flex-1">Source Protocol</div>
                        <div className="w-48">Classification</div>
                        <div className="w-48 text-center">Neural Flux</div>
                        <div className="w-48 text-right pr-12">Timestamp</div>
                        <div className="w-12"></div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: 'Climate Threat Node Analysis', sub: 'YouTube-Sync • 12m 45s', type: 'Scanner', icon: <Video />, sentiment: 0.65, date: 'TODAY [14:20]' },
                            { title: 'Election Fragmentation Protocol', sub: '48 Nodes • X-Global', type: 'Topic Pulse', icon: <Hash />, sentiment: -0.42, date: 'YESTERDAY [09:15]' },
                            { title: 'Consumer Behavior Synapse', sub: 'TikTok-Direct • 03m 12s', type: 'Scanner', icon: <Video />, sentiment: 0.15, date: 'JAN 28 [16:40]' },
                            { title: 'Green Energy Validity Check', sub: 'Insta-Source • 08m 30s', type: 'Scanner', icon: <Video />, sentiment: 0.82, date: 'JAN 25 [11:10]' },
                            { title: 'Neural Web Topology Scan', sub: '12 Nodes • Social-Mesh', type: 'Topic Pulse', icon: <Hash />, sentiment: 0.35, date: 'JAN 22 [20:05]' },
                        ].map((item, idx) => (
                            <Link href="/analyze/demo-id" key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-6 p-8 rounded-[2.5rem] cyber-glass border border-white/5 hover:border-aurora-cyan/30 hover:bg-white/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-aurora-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex-1 flex items-center gap-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all ${item.type === 'Scanner' ? 'text-aurora-cyan shadow-[inset_0_0_20px_rgba(0,242,254,0.05)]' : 'text-aurora-rose shadow-[inset_0_0_20px_rgba(255,0,128,0.05)]'}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase group-hover:text-white transition-colors tracking-tight">{item.title}</h3>
                                            <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">{item.sub}</p>
                                        </div>
                                    </div>

                                    <div className="w-48 flex items-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${item.type === 'Scanner' ? 'border-aurora-cyan/30 text-aurora-cyan bg-aurora-cyan/5' : 'border-aurora-rose/30 text-aurora-rose bg-aurora-rose/5'}`}>
                                            {item.type}
                                        </span>
                                    </div>

                                    <div className="w-48 flex flex-col items-center gap-2">
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${Math.abs(item.sentiment) * 100}%` }}
                                                className={`h-full ${item.sentiment > 0 ? 'bg-aurora-cyan shadow-[0_0_10px_#00f2fe]' : 'bg-aurora-rose shadow-[0_0_10px_#ff0080]'}`}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.sentiment > 0 ? 'text-aurora-cyan' : 'text-aurora-rose'}`}>
                                            {item.sentiment > 0 ? 'Pos. Bias' : 'Neg. Bias'} [{item.sentiment}]
                                        </span>
                                    </div>

                                    <div className="w-48 text-[11px] font-black italic text-right pr-12 text-white/40 group-hover:text-white transition-colors">
                                        {item.date}
                                    </div>

                                    <div className="w-12 flex justify-end">
                                        <ChevronRight size={24} className="text-white/10 group-hover:text-aurora-cyan transition-all transform group-hover:translate-x-2" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
