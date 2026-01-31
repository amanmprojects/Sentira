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
    Check,
    AlertTriangle
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

export default function ReportsPage() {
    const { sentimentData, reelData, input } = useAnalysis();
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [hasData, setHasData] = useState(!!(sentimentData || reelData));

    const generatePDF = () => {
        if (!sentimentData && !reelData) {
            setStatusMessage("No analysis data available. Please analyze content first.");
            return;
        }

        setIsSynthesizing(true);
        setStatusMessage("Compiling Multimodal Patterns... Generating Intelligence PDF");

        setTimeout(() => {
            try {
                const doc = new jsPDF();

                // Add Header
                doc.setFontSize(22);
                doc.setTextColor(0, 180, 200);
                doc.text("SENTIRA NEURAL AUDIT REPORT", 20, 20);

                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`GENERATED: ${new Date().toLocaleString()}`, 20, 30);
                doc.text("SYSTEM: MULTIMODAL INTELLIGENCE ENGINE V1.0", 20, 35);

                if (input?.content) {
                    doc.text(`SOURCE: ${input.content}`, 20, 40);
                }

                // Content Analysis Section
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text("1. SENTIMENT ANALYSIS", 20, 55);

                doc.setFontSize(12);
                if (sentimentData) {
                    doc.text(`Confidence Score: ${Math.round(sentimentData.confidence * 100)}%`, 25, 65);
                    doc.text(`Global Category: ${sentimentData.global_category}`, 25, 75);
                    doc.text("Emotional Cues Detected:", 25, 85);

                    (sentimentData.emotion_timeline || []).slice(0, 5).forEach((seg, i) => {
                        doc.text(`- ${seg.emotion} (${Math.round(seg.intensity * 100)}%) at ${seg.start.toFixed(1)}s`, 30, 95 + (i * 10));
                    });
                } else {
                    doc.text("No sentiment data available", 25, 65);
                }

                // Bias Detection Section
                doc.setFontSize(16);
                doc.text("2. BIAS & INTEGRITY AUDIT", 20, 145);

                doc.setFontSize(12);
                if (reelData?.bias_analysis) {
                    const bias = reelData.bias_analysis;
                    doc.text(`Overall Risk Score: ${Math.round(bias.overall_score)}%`, 25, 155);
                    doc.text(`Risk Level: ${bias.risk_level}`, 25, 165);
                    doc.text("Bias Categories:", 25, 175);

                    bias.categories.slice(0, 4).forEach((cat, i) => {
                        doc.text(`- ${cat.label}: ${Math.round(cat.score)}% (${cat.detected ? 'Detected' : 'Not Detected'})`, 30, 185 + (i * 10));
                    });

                    // Add narrative summary
                    doc.setFontSize(16);
                    doc.text("3. NARRATIVE SUMMARY", 20, 225);
                    doc.setFontSize(12);
                    const splitCommentary = doc.splitTextToSize(reelData.commentary_summary || "No data available", 160);
                    doc.text(splitCommentary, 25, 235);

                    if (reelData.possible_issues && reelData.possible_issues.length > 0) {
                        doc.text("Detected Issues:", 25, 275);
                        reelData.possible_issues.slice(0, 3).forEach((issue, i) => {
                            doc.text(`- ${issue}`, 30, 285 + (i * 10));
                        });
                    }
                } else if (reelData) {
                    const splitCommentary = doc.splitTextToSize(reelData.commentary_summary || "No bias analysis available", 160);
                    doc.text(splitCommentary, 25, 155);

                    if (reelData.possible_issues && reelData.possible_issues.length > 0) {
                        doc.text("Detected Issues:", 25, 195);
                        reelData.possible_issues.slice(0, 3).forEach((issue, i) => {
                            doc.text(`- ${issue}`, 30, 205 + (i * 10));
                        });
                    }
                } else {
                    doc.text("No bias analysis data available", 25, 155);
                }

                // Save PDF
                doc.save(`SENTIRA_REPORT_${new Date().getTime()}.pdf`);

                setIsSynthesizing(false);
                setIsComplete(true);
                setStatusMessage("Report generated successfully!");
                
                setTimeout(() => {
                    setIsComplete(false);
                    setStatusMessage(null);
                }, 3000);
            } catch (error) {
                console.error("PDF generation failed:", error);
                setIsSynthesizing(false);
                setStatusMessage("Failed to generate report. Please try again.");
            }
        }, 1500);
    };

    const hasAnalysisData = sentimentData || reelData;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pt-12 overflow-x-hidden relative selection:bg-aurora-cyan/30">
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-aurora-blue">
                            <FileText size={14} /> <span className="uppercase font-black tracking-[0.4em] text-[10px]">Data Ledger</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Intelligence <span className="aurora-text">Reports</span></h1>
                        <p className="text-white/40 text-lg font-medium tracking-tight mt-2">Generate cryptographically verified narrative summaries.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generatePDF}
                        disabled={isSynthesizing}
                        className={`px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all ${
                            !hasAnalysisData 
                                ? 'bg-white/20 text-white/40 cursor-not-allowed' 
                                : 'bg-white text-black hover:scale-105'
                        }`}
                    >
                        {isSynthesizing ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⟳</span> Generating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Download size={16} /> {hasAnalysisData ? 'Download Report' : 'No Data'}
                            </span>
                        )}
                    </motion.button>
                </motion.header>

                {/* Status Banner */}
                <AnimatePresence>
                    {statusMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-2xl flex items-center gap-3 ${
                                isComplete 
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                    : statusMessage.includes('No analysis')
                                        ? 'bg-aurora-rose/10 border border-aurora-rose/30 text-aurora-rose'
                                        : 'bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan'
                            }`}
                        >
                            {isComplete ? <Check size={18} /> : 
                             statusMessage.includes('No analysis') ? <AlertTriangle size={18} /> : 
                             <Zap size={18} className="animate-pulse" />}
                            <span className="text-xs font-black uppercase tracking-wider">{statusMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Data Availability Status */}
                {!hasAnalysisData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-[2rem] bg-aurora-rose/5 border border-aurora-rose/20 text-center"
                    >
                        <AlertTriangle size={32} className="mx-auto mb-4 text-aurora-rose" />
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Analysis Data Available</h3>
                        <p className="text-white/50 text-sm">Analyze a video or audio content from the dashboard first to generate an intelligence report.</p>
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Strategy Panel */}
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 rounded-[3rem] cyber-glass border border-white/5 space-y-10"
                        >
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <Sparkles className="text-aurora-cyan" size={20} /> Report Parameters
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <FormatCard icon={<FileText />} label="Intelligence PDF" active={true} color="cyan" />
                                <FormatCard icon={<FileJson />} label="Neural JSON" color="rose" />
                                <FormatCard icon={<TableIcon />} label="Tabular CSV" color="blue" />
                                <FormatCard icon={<Clock />} label="Editable DOCX" color="cyan" />
                            </div>

                            <div className="space-y-4 pt-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Data Layers</h3>
                                <OptionToggle label="Sentiment Analysis" active={!!sentimentData} />
                                <OptionToggle label="Bias Detection" active={!!reelData?.bias_analysis} />
                                <OptionToggle label="Narrative Summary" active={!!reelData} />
                                <OptionToggle label="Content Issues" active={!!reelData?.possible_issues?.length} />
                            </div>

                            <button 
                                onClick={generatePDF}
                                disabled={isSynthesizing || !hasAnalysisData}
                                className={`w-full py-6 text-black rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.02] transition-transform ${
                                    !hasAnalysisData 
                                        ? 'bg-white/10 text-white/20 cursor-not-allowed'
                                        : 'bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'
                                }`}
                            >
                                {isSynthesizing ? 'Generating...' : 'Generate Report'}
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
                            <h2 className="text-2xl font-black uppercase tracking-tight">Analysis Summary</h2>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-aurora-cyan transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="SEARCH ANALYSIS..."
                                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-black uppercase tracking-widest outline-none focus:border-aurora-cyan/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Show analysis data */}
                        <div className="space-y-4">
                            {sentimentData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-[2rem] bg-aurora-cyan/5 border border-aurora-cyan/20"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center">
                                            <Zap size={20} className="text-aurora-cyan" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg uppercase">Sentiment Analysis</h4>
                                            <p className="text-[10px] uppercase text-white/40">Emotional Pattern Detection</p>
                                        </div>
                                        <span className="ml-auto text-xs font-black px-3 py-1 rounded-full bg-aurora-cyan text-black">
                                            {Math.round(sentimentData.confidence * 100)}% Confidence
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {reelData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Search size={20} className="text-white/60" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg uppercase">Content Analysis</h4>
                                            <p className="text-[10px] uppercase text-white/40">Bias & Narrative Audit</p>
                                        </div>
                                        {reelData.bias_analysis && (
                                            <span className={`ml-auto text-xs font-black px-3 py-1 rounded-full ${
                                                reelData.bias_analysis.overall_score >= 70 
                                                    ? 'bg-aurora-rose/20 text-aurora-rose border border-aurora-rose/30'
                                                    : 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                                            }`}>
                                                {reelData.bias_analysis.risk_level}
                                            </span>
                                        )}
                                    </div>
                                    {reelData.commentary_summary && (
                                        <p className="text-sm text-white/60 mt-3 line-clamp-2">{reelData.commentary_summary}</p>
                                    )}
                                </motion.div>
                            )}

                            {!sentimentData && !reelData && (
                                <div className="p-12 rounded-[2rem] border border-dashed border-white/10 text-center">
                                    <Clock size={48} className="mx-auto text-white/10 mb-4" />
                                    <p className="text-sm text-white/30 uppercase tracking-widest">Awaiting Analysis Data</p>
                                </div>
                            )}
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
