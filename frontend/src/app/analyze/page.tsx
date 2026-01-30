"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Scan,
    Upload,
    Link as LinkIcon,
    Hash,
    Search,
    Play,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Cpu,
    Fingerprint
} from "lucide-react";

export default function AnalyzePage() {
    const [activeTab, setActiveTab] = useState('url');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const startAnalysis = () => {
        setIsAnalyzing(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
            }
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pt-12 overflow-hidden selection:bg-aurora-cyan/30">
            {/* Scanner Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aurora-cyan/10 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Scan className="text-aurora-cyan animate-pulse" size={48} />
                    </div>
                    <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter italic">Content <span className="aurora-text">Extraction</span></h1>
                    <p className="text-white/40 text-xl font-medium tracking-tight">Sync your source stream for real-time neural sentiment decoding.</p>
                </motion.div>

                {/* Protocol Selection */}
                <div className="flex justify-center gap-6 mb-16">
                    {[
                        { id: 'url', icon: <LinkIcon size={20} />, label: 'Remote URL' },
                        { id: 'upload', icon: <Upload size={20} />, label: 'Local Stream' },
                        { id: 'hashtag', icon: <Hash size={20} />, label: 'Topic Protocol' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${activeTab === tab.id
                                    ? 'bg-aurora-cyan border-aurora-cyan text-black shadow-[0_0_30px_rgba(0,242,254,0.3)] scale-105'
                                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scanner Interface */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-16 rounded-[4rem] cyber-glass border border-white/10 relative overflow-hidden"
                    >
                        {/* Decorative Corner Brackets */}
                        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-aurora-cyan/30 rounded-tl-3xl"></div>
                        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-aurora-cyan/30 rounded-tr-3xl"></div>
                        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-aurora-cyan/30 rounded-bl-3xl"></div>
                        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-aurora-cyan/30 rounded-br-3xl"></div>

                        {activeTab === 'url' && (
                            <div className="space-y-12">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-8 flex items-center text-aurora-cyan">
                                        <Fingerprint size={32} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ENTER SOURCE IDENTIFIER (URL)..."
                                        className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] py-8 pl-24 pr-10 text-xl font-bold italic tracking-tight outline-none focus:border-aurora-cyan/30 focus:bg-white/10 transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-4 italic text-sm text-white/30 font-medium">
                                        <div className="flex items-center gap-2 text-aurora-cyan text-xs font-black uppercase not-italic"><AlertCircle size={16} /> Compatibility Checks</div>
                                        Optimized for global video protocols including HTTP-Live-Streaming and Neural-Simulcasts.
                                    </div>
                                    <div className="aspect-video rounded-[2rem] bg-[#080808] border border-white/5 flex items-center justify-center relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-aurora-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <Play size={48} className="text-white/10 group-hover:text-aurora-cyan transition-all group-hover:scale-110" />
                                        <div className="absolute bottom-4 left-4 text-[8px] font-black uppercase text-white/20 tracking-[0.3em]">Awaiting Uplink</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'upload' && (
                            <div className="border-4 border-dashed border-white/5 rounded-[3rem] p-24 flex flex-col items-center justify-center gap-8 hover:border-aurora-cyan/20 transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-aurora-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-24 h-24 cyber-glass rounded-[2rem] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(0,242,254,0.15)] transition-all">
                                    <Upload size={48} className="text-white/20 group-hover:text-aurora-cyan" />
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black uppercase italic tracking-tighter">Initialize Local Stream</p>
                                    <p className="text-white/30 mt-2 font-bold uppercase text-xs tracking-widest">Supports H.264 / H.265 Decoding</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hashtag' && (
                            <div className="space-y-12">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-8 flex items-center text-aurora-rose">
                                        <Hash size={32} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ENTER PROTOCOL TAG..."
                                        className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] py-8 pl-24 pr-10 text-xl font-bold italic tracking-tight outline-none focus:border-aurora-rose/30 transition-all placeholder:text-white/10"
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-aurora-rose rounded-3xl text-black flex items-center justify-center hover:scale-105 transition-transform">
                                        <Search size={32} />
                                    </button>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    {['Cluster Alpha', 'Region Beta', 'Node Gamma'].map(plat => (
                                        <label key={plat} className="flex items-center gap-3 cursor-pointer bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                                            <input type="checkbox" className="accent-aurora-rose w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest text-white/50">{plat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Analysis Trigger */}
                        <div className="mt-16">
                            {!isAnalyzing ? (
                                <button
                                    onClick={startAnalysis}
                                    className="w-full py-8 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose text-black rounded-[2.5rem] text-3xl font-black uppercase tracking-tighter italic hover:scale-[1.02] transition-transform flex items-center justify-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                                >
                                    Engage Neural Scan <Cpu size={36} className="animate-spin-slow" />
                                </button>
                            ) : (
                                <div className="space-y-10">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-aurora-cyan animate-spin"></div>
                                                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-aurora-cyan" size={16} />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-2xl uppercase italic block">Neuromorphic Processing</span>
                                                <span className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Gemini Flash 2.5 Hub Connected</span>
                                            </div>
                                        </div>
                                        <span className="text-4xl font-black italic aurora-text">{progress}%</span>
                                    </div>

                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose rounded-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-8">
                                        <ScannerStep active={progress >= 20} label="Source Link" />
                                        <ScannerStep active={progress >= 50} label="Multimodal Sync" />
                                        <ScannerStep active={progress >= 85} label="Logic Encoding" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function ScannerStep({ active, label }: { active: boolean, label: string }) {
    return (
        <div className={`p-4 rounded-2xl cyber-glass border transition-all flex items-center justify-center gap-3 flex-col text-center ${active ? 'border-aurora-cyan/30 text-white' : 'border-white/5 text-white/10'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${active ? 'bg-aurora-cyan/20 border-aurora-cyan/30 text-aurora-cyan' : 'bg-white/5 border-white/5'}`}>
                <CheckCircle2 size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
    );
}
