"use client";

import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Clock,
    Search,
    FileJson,
    Table as TableIcon,
    Sparkles,
    Zap,
    Check
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

export default function ReportsPage() {
    const { sentimentData, reelData, isAutoPilot } = useAnalysis();
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [autoPilotStatus, setAutoPilotStatus] = useState<string | null>(null);

    useEffect(() => {
        if (isAutoPilot && (sentimentData || reelData) && !isComplete) {
            setAutoPilotStatus("Initializing Neural Synthesis... Accessing Data Vaults");

            const step1 = setTimeout(() => {
                setIsSynthesizing(true);
                setAutoPilotStatus("Compiling Multimodal Patterns... Generating Intelligence PDF");
            }, 3000);

            const step2 = setTimeout(() => {
                // Generate PDF
                const doc = new jsPDF();

                // Add Header
                doc.setFontSize(22);
                doc.setTextColor(0, 180, 200); // Darker Cyan for readability on white PDF
                doc.text("SENTIRA NEURAL AUDIT REPORT", 20, 20);

                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`GENERATED: ${new Date().toLocaleString()}`, 20, 30);
                doc.text("SYSTEM: MULTIMODAL INTELLIGENCE ENGINE V1.0", 20, 35);

                // Content Analysis Section
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text("1. SENTIMENT ANALYSIS", 20, 50);

                doc.setFontSize(12);
                if (sentimentData) {
                    doc.text(`Confidence Score: ${Math.round(sentimentData.confidence * 100)}%`, 25, 60);
                    doc.text(`Global Category: ${sentimentData.global_category}`, 25, 70);
                    doc.text("Emotional Cues Detected:", 25, 80);

                    sentimentData.emotion_timeline.slice(0, 5).forEach((seg, i) => {
                        doc.text(`- ${seg.emotion} (${Math.round(seg.intensity * 100)}%) at ${seg.start.toFixed(1)}s`, 30, 90 + (i * 10));
                    });
                }

                // Bias Detection Section
                doc.setFontSize(16);
                doc.text("2. BIAS & INTEGRITY AUDIT", 20, 150);

                doc.setFontSize(12);
                if (reelData) {
                    const splitCommentary = doc.splitTextToSize(reelData.commentary_summary || "No data available", 160);
                    doc.text(splitCommentary, 25, 160);

                    doc.text("Detected Patterns:", 25, 190);
                    reelData.possible_issues.slice(0, 3).forEach((issue, i) => {
                        doc.text(`- ${issue}`, 30, 200 + (i * 10));
                    });
                }

                // Save PDF
                doc.save(`SENTIRA_REPORT_${new Date().getTime()}.pdf`);

                setIsSynthesizing(false);
                setIsComplete(true);
                setAutoPilotStatus("Full Suite Analysis Complete. PDF Report Stored and Downloaded.");
            }, 8000);

            return () => {
                clearTimeout(step1);
                clearTimeout(step2);
            };
        }
    }, [isAutoPilot, sentimentData, reelData, isComplete]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pt-12 overflow-x-hidden relative selection:bg-aurora-cyan/30">
            {/* Auto-Pilot Status Banner */}
            <AnimatePresence>
                {isAutoPilot && (
                    <motion.div
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        exit={{ y: -100 }}
                        className="fixed top-0 left-0 right-0 z-[60] py-3 bg-aurora-cyan text-black font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(0,242,254,0.2)]"
                    >
                        {isComplete ? <Check size={14} /> : <Zap size={14} className="animate-pulse" />}
                        {autoPilotStatus || "Neural Auto-Pilot Active: Finalizing Sequence"}
                        {isComplete ? <Check size={14} /> : <Zap size={14} className="animate-pulse" />}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-end"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-aurora-blue">
                            <Zap size={14} /> <span className="uppercase font-black tracking-[0.4em] text-[10px]">Data Ledger</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Intelligence <span className="aurora-text">Reports</span></h1>
                        <p className="text-white/40 text-lg font-medium tracking-tight mt-2">Generate cryptographically verified narrative summaries.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all"
                    >
                        Synthesize New Report
                    </motion.button>
                </motion.header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Strategy Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 rounded-[3rem] cyber-glass border border-white/5 space-y-10"
                        >
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Sparkles className="text-aurora-cyan" size={20} /> Parameter Sync
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <FormatCard icon={<FileText />} label="Intelligence PDF" active={true} color="cyan" />
                                <FormatCard icon={<FileJson />} label="Neural JSON" color="rose" />
                                <FormatCard icon={<TableIcon />} label="Tabular CSV" color="blue" />
                                <FormatCard icon={<Clock />} label="Editable DOCX" color="cyan" />
                            </div>

                            <div className="space-y-4 pt-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Extraction Layers</h3>
                                <OptionToggle label="Sentiment Waves" active={true} />
                                <OptionToggle label="Bias Evidence Map" active={true} />
                                <OptionToggle label="Temporal Paradoxes" active={false} />
                                <OptionToggle label="Gemini Reasoning" active={true} />
                            </div>

                            <button className="w-full py-6 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose text-black rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.02] transition-transform">
                                Engage Synthesis
                            </button>
                        </motion.div>
                    </div>

                    {/* Ledger Records */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 p-12 rounded-[4rem] cyber-glass border border-white/5 space-y-10"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Access Log</h2>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-aurora-cyan transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="IDENTIFYING SCAN..."
                                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-black uppercase tracking-widest outline-none focus:border-aurora-cyan/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'CLIMATE_THREAT_LVL_4.PDF', date: '2H AGO', size: '2.4 MB', status: 'DECODED', type: 'cyan' },
                                { name: 'POLAR_ELECTION_V2.JSON', date: '5H AGO', size: '1.1 MB', status: 'DECODED', type: 'rose' },
                                { name: 'SOCIAL_ENGINEERING_REAN.PDF', date: '1D AGO', size: '4.8 MB', status: 'STALE', type: 'white' },
                            ].map((report, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center justify-between p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-aurora-cyan/30 transition-all`}>
                                            <FileText size={24} className="text-white/20 group-hover:text-aurora-cyan" />
                                        </div>
                                        <div>
                                            <h4 className="font-black italic text-lg uppercase group-hover:text-white transition-colors">{report.name}</h4>
                                            <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{report.date} • {report.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${report.status === 'DECODED' ? 'border-aurora-cyan/30 text-aurora-cyan bg-aurora-cyan/5' : 'border-white/10 text-white/20 bg-white/5'}`}>
                                            {report.status}
                                        </span>
                                        <Download size={24} className="text-white/10 group-hover:text-aurora-cyan transition-all group-hover:scale-110" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function FormatCard({ icon, label, active = false, color }: { icon: React.ReactNode, label: string, active?: boolean, color: string }) {
    const colorMap: { [key: string]: string } = {
        cyan: 'text-aurora-cyan border-aurora-cyan/30 bg-aurora-cyan/5',
        rose: 'text-aurora-rose border-aurora-rose/30 bg-aurora-rose/5',
        blue: 'text-aurora-blue border-aurora-blue/30 bg-aurora-blue/5',
    };

    return (
        <div className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex flex-col items-center gap-4 text-center group ${active ? colorMap[color] : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'}`}>
            <div className="group-hover:scale-110 transition-transform">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{label}</span>
        </div>
    );
}

function OptionToggle({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <span className="text-xs font-black uppercase tracking-widest text-white/60">{label}</span>
            <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${active ? 'bg-aurora-cyan shadow-[0_0_15px_rgba(0,242,254,0.3)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`}></div>
            </div>
        </div>
    );
}
