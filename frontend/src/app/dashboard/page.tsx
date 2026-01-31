"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Video,
    Mic,
    FileText,
    Upload,
    Link as LinkIcon,
    Activity,
    Scale,
    CheckCircle,
    ArrowRight,
    X,
    Loader2,
    Zap
} from "lucide-react";
import { useAnalysis, InputModality } from "@/context/AnalysisContext";
import { analyzeSentiment, analyzeSentimentUpload, analyzeVideoUrl, analyzeVideo } from "@/lib/api";

const MODALITY_OPTIONS: { id: InputModality; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "video", label: "Video", icon: <Video size={20} />, description: "Instagram URL or upload" },
    { id: "audio", label: "Audio", icon: <Mic size={20} />, description: "Audio file upload" },
    { id: "text", label: "Text", icon: <FileText size={20} />, description: "Paste or type content" },
];

const ACTION_CARDS = [
    {
        id: "sentiment",
        title: "Sentiment Analysis",
        description: "Analyze emotional tone from multimodal content",
        icon: <Activity size={24} />,
        href: "/sentiment-analysis",
        color: "cyan",
    },
    {
        id: "bias",
        title: "Detecting Bias",
        description: "Identify potential bias and problematic patterns",
        icon: <Scale size={24} />,
        href: "/detecting-bias",
        color: "rose",
    },
    {
        id: "factcheck",
        title: "Fact Checking",
        description: "Verify claims and generate validation reports",
        icon: <CheckCircle size={24} />,
        href: "/reports",
        color: "blue",
    },
];

export default function Dashboard() {
    const router = useRouter();
    const {
        input, setModality, setContent, setFile, isInputValid, clearInput,
        setSentimentData, setReelData, isAnalyzing, setIsAnalyzing,
        isAutoPilot, setIsAutoPilot
    } = useAnalysis();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDone, setIsDone] = useState(false);

    const handleModalityChange = (modality: InputModality) => {
        setModality(modality);
        setIsDone(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setContent(""); // Clear content string for files, context holds input.file
            setIsDone(false);
        }
    };

    const handleNavigate = (href: string) => {
        if (!isInputValid) return;
        router.push(href);
    };

    const handleLaunch = async () => {
        if (!isInputValid || isAnalyzing) return;
        setIsAnalyzing(true);
        setIsDone(false);
        try {
            const sentimentPromise = input.file
                ? analyzeSentimentUpload(input.file)
                : analyzeSentiment(input.content);

            const reelPromise = input.file
                ? analyzeVideo(input.file).then(res => ({ main_summary: res.summary, commentary_summary: res.summary, possible_issues: [], transcript: "", suggestions: [], characters: [] }))
                : analyzeVideoUrl(input.content).then(res => res.data);

            if (isAutoPilot) {
                // In Auto-Pilot, navigate immediately and let background handle data
                console.log("[TIME] Launching Auto-Pilot Analysis...");
                const start = Date.now();
                sentimentPromise.then(res => {
                    console.log(`[TIME] Sentiment Analysis (Background) completed in ${((Date.now() - start) / 1000).toFixed(2)}s`);
                    setSentimentData(res);
                }).catch(console.error);
                reelPromise.then(res => {
                    console.log(`[TIME] Reel Analysis (Background) completed in ${((Date.now() - start) / 1000).toFixed(2)}s`);
                    setReelData(res as any);
                }).catch(console.error);
                router.push("/sentiment-analysis");
            } else {
                // In manual mode, wait for completion to show "Done" on dashboard
                console.log("[TIME] Starting Manual Analysis...");
                const start = Date.now();
                const [sentiment, reel] = await Promise.all([
                    sentimentPromise,
                    reelPromise
                ]);
                console.log(`[TIME] Total Parallel Analysis took ${((Date.now() - start) / 1000).toFixed(2)}s`);
                setSentimentData(sentiment);
                setReelData(reel as any);
                setIsDone(true);
            }
        } catch (error) {
            console.error("Analysis launch failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Auto-Pilot Global Banner */}
                <AnimatePresence>
                    {isAutoPilot && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 rounded-2xl bg-aurora-cyan/10 border border-aurora-cyan/20 flex items-center justify-center gap-3 mb-8"
                        >
                            <Zap size={16} className="text-aurora-cyan animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-aurora-cyan">Neural Auto-Pilot Synchronized & Optimized</span>
                            <Zap size={16} className="text-aurora-cyan animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-left">
                        <span className="aurora-text">Pulse</span>
                    </h1>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-[2.5rem] cyber-glass border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-aurora-cyan rounded-full"></div>
                        <h2 className="text-lg font-black uppercase tracking-tight">Select Input Type</h2>
                    </div>

                    <div className="flex gap-3 mb-8">
                        {MODALITY_OPTIONS.map((option) => {
                            const isActive = input.modality === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleModalityChange(option.id)}
                                    className={`flex-1 px-6 py-5 rounded-2xl border transition-all duration-300 ${isActive
                                        ? "bg-aurora-cyan/10 border-aurora-cyan/50 text-white"
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={isActive ? "text-aurora-cyan" : ""}>{option.icon}</div>
                                        <span className="font-black text-xs uppercase tracking-widest">{option.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={input.modality}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {input.modality === "video" && (
                                <VideoInput
                                    value={input.content}
                                    input={input}
                                    onChange={(val: string) => { setContent(val); setIsDone(false); }}
                                    onFileUpload={handleFileUpload}
                                    fileInputRef={fileInputRef}
                                    onClear={() => { clearInput(); setIsDone(false); }}
                                    onLaunch={handleLaunch}
                                    isDone={isDone}
                                />
                            )}
                            {input.modality === "audio" && (
                                <AudioInput
                                    value={input.content}
                                    onFileUpload={handleFileUpload}
                                    fileInputRef={fileInputRef}
                                    onClear={() => { clearInput(); setIsDone(false); }}
                                    onLaunch={handleLaunch}
                                    isDone={isDone}
                                />
                            )}
                            {input.modality === "text" && (
                                <TextInput
                                    value={input.content}
                                    onChange={(val: string) => { setContent(val); setIsDone(false); }}
                                    onClear={() => { clearInput(); setIsDone(false); }}
                                    onLaunch={handleLaunch}
                                    isDone={isDone}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <div className="space-y-4 pt-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-aurora-rose rounded-full"></div>
                            <h2 className="text-lg font-black uppercase tracking-tight">Intelligence Suites</h2>
                        </div>
                        <div className="flex gap-2">
                            <div className={`px-2 py-1 rounded-md text-[8px] font-black border ${isAutoPilot ? 'border-aurora-rose text-aurora-rose bg-aurora-rose/5' : 'border-white/5 text-white/20 uppercase tracking-widest'}`}>
                                {isAutoPilot ? "AUTO-PILOT ACTIVE" : "MANUAL MODE"}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {ACTION_CARDS.map((card, index) => (
                            <ActionCard
                                key={card.id}
                                card={card}
                                index={index}
                                isInputValid={isInputValid}
                                onClick={() => handleNavigate(card.href)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VideoInput({ value, input, onChange, onFileUpload, fileInputRef, onClear, onLaunch, isDone }: any) {
    const { isAutoPilot, setIsAutoPilot, isAnalyzing } = useAnalysis();
    const [mode, setMode] = useState<"url" | "upload">("url");

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <button onClick={() => setMode("url")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "url" ? "bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30" : "bg-white/5 text-white/40 border border-white/10"}`}>URL SCAN</button>
                <button onClick={() => setMode("upload")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "upload" ? "bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30" : "bg-white/5 text-white/40 border border-white/10"}`}>UPLOAD</button>
            </div>

            {mode === "url" ? (
                <div className="relative">
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Paste Instagram Reel / YouTube URL..."
                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-aurora-cyan/50 transition-all"
                    />
                    {value && <button onClick={onClear} className="absolute right-5 top-5 text-white/20 hover:text-white"><X size={18} /></button>}
                </div>
            ) : (
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${value || input.file ? 'border-aurora-cyan/50 bg-aurora-cyan/5' : 'border-white/10 hover:border-aurora-cyan/30'}`}>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={onFileUpload} className="hidden" />
                    <Upload className={`mx-auto mb-2 ${value || input.file ? 'text-aurora-cyan' : 'text-white/20'}`} size={24} />
                    <p className={`text-xs font-black uppercase ${value || input.file ? 'text-white' : 'text-white/40'}`}>{input.file?.name || value || "Drop Intelligence Cache"}</p>
                </div>
            )}

            {(value || input.file) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className={isAutoPilot ? "text-aurora-cyan animate-pulse" : "text-white/20"} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Neural Auto-Pilot</span>
                        </div>
                        <button onClick={() => setIsAutoPilot(!isAutoPilot)} className={`w-10 h-5 rounded-full relative transition-all ${isAutoPilot ? "bg-aurora-cyan" : "bg-white/10"}`}>
                            <motion.div animate={{ x: isAutoPilot ? 22 : 4 }} className="absolute top-1 w-3 h-3 rounded-full bg-white" />
                        </button>
                    </div>
                    <button
                        onClick={onLaunch}
                        disabled={isAnalyzing}
                        className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] italic text-xs transition-all disabled:opacity-50 ${isDone
                            ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                            : "bg-aurora-cyan text-black shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-[1.01]"
                            }`}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                SENTIRA SYNCHRONIZING...
                            </div>
                        ) : isDone ? (
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle size={16} />
                                ANALYSIS COMPLETE | READY FOR REVIEW
                            </div>
                        ) : (
                            "Launch Neural Engine"
                        )}
                    </button>
                </motion.div>
            )}
        </div>
    );
}

function AudioInput({ value, onFileUpload, fileInputRef, onClear, onLaunch, isDone }: any) {
    const { isAnalyzing } = useAnalysis();
    return (
        <div className="space-y-6">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-aurora-cyan/30 transition-all">
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={onFileUpload} className="hidden" />
                <Mic className="mx-auto mb-2 text-white/20" size={24} />
                <p className="text-white/40 text-xs font-black uppercase">{value || "Select Audio Packet"}</p>
            </div>
            {value && (
                <button
                    onClick={onLaunch}
                    disabled={isAnalyzing}
                    className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] italic text-xs transition-all ${isDone
                        ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        : "bg-aurora-cyan text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                        }`}
                >
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            SENTIRA SCANNING...
                        </div>
                    ) : isDone ? (
                        "DONE | SENSORY BUFFER READY"
                    ) : (
                        "Analyze Audio Stream"
                    )}
                </button>
            )}
        </div>
    );
}

function TextInput({ value, onChange, onClear, onLaunch, isDone }: any) {
    const { isAnalyzing } = useAnalysis();
    return (
        <div className="space-y-6">
            <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} placeholder="Paste linguistic data..." className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-aurora-cyan/50 transition-all resize-none" />
            {value && (
                <button
                    onClick={onLaunch}
                    disabled={isAnalyzing}
                    className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] italic text-xs transition-all ${isDone
                        ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        : "bg-aurora-cyan text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                        }`}
                >
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            SENTIRA ANALYZING...
                        </div>
                    ) : isDone ? (
                        "DONE | LINGUISTIC BUFFER READY"
                    ) : (
                        "Process Text Node"
                    )}
                </button>
            )}
        </div>
    );
}

function ActionCard({ card, index, isInputValid, onClick }: any) {
    return (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={!isInputValid}
            className={`group relative p-8 rounded-[2rem] cyber-glass border border-white/5 text-left transition-all ${card.color === 'cyan' ? 'hover:border-aurora-cyan/30' : card.color === 'rose' ? 'hover:border-aurora-rose/30' : 'hover:border-aurora-blue/30'
                } ${!isInputValid ? "opacity-30 grayscale cursor-not-allowed" : "cursor-pointer"}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-white/5 ${card.color === 'cyan' ? 'text-aurora-cyan' : card.color === 'rose' ? 'text-aurora-rose' : 'text-aurora-blue'}`}>
                    {card.icon}
                </div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-tighter mb-2 italic">{card.title}</h3>
            <p className="text-white/30 text-[10px] leading-relaxed font-bold uppercase">{card.description}</p>
        </motion.button>
    );
}
