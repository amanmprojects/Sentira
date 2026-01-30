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
    Sparkles,
} from "lucide-react";
import { useAnalysis, InputModality } from "@/context/AnalysisContext";
import FactCheckModal from "@/components/FactCheckModal";

const MODALITY_OPTIONS: { id: InputModality; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "video", label: "Video", icon: <Video size={20} />, description: "Instagram Reel & YT Short URL or upload" },
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
    const { input, setModality, setContent, setFile, isInputValid, clearInput } = useAnalysis();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFactCheckModalOpen, setIsFactCheckModalOpen] = useState(false);

    const handleModalityChange = (modality: InputModality) => {
        setModality(modality);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setContent(file.name);
        }
    };

    const handleActionCardClick = (cardId: string, href: string) => {
        if (!isInputValid) {
            return;
        }
        
        // Open modal for fact checking instead of navigating
        if (cardId === "factcheck") {
            setIsFactCheckModalOpen(true);
            return;
        }
        
        router.push(href);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Dashboard Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-left">
                        <span className="aurora-text">Pulse</span>
                    </h1>
                   
                </motion.header>

                {/* Multimodal Input Selector Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-[2.5rem] cyber-glass border border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-aurora-cyan rounded-full"></div>
                        <h2 className="text-lg font-black uppercase tracking-tight">
                            Select Input Type
                        </h2>
                    </div>

                    {/* Modality Tabs */}
                    <div className="flex gap-3 mb-8">
                        {MODALITY_OPTIONS.map((option) => {
                            const isActive = input.modality === option.id;
                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleModalityChange(option.id)}
                                    className={`flex-1 px-6 py-5 rounded-2xl border transition-all duration-300 ${
                                        isActive
                                            ? "bg-aurora-cyan/10 border-aurora-cyan/50 text-white"
                                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`transition-colors ${
                                                isActive ? "text-aurora-cyan" : ""
                                            }`}
                                        >
                                            {option.icon}
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest">
                                            {option.label}
                                        </span>
                                        <span className="text-[10px] text-white/30 hidden md:block">
                                            {option.description}
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                exit={{ opacity: 0, scaleX: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="w-full h-1 bg-aurora-cyan rounded-full mt-3"
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Dynamic Input Area */}
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
                                    onChange={setContent}
                                    onFileUpload={handleFileUpload}
                                    fileInputRef={fileInputRef}
                                    onClear={clearInput}
                                />
                            )}
                            {input.modality === "audio" && (
                                <AudioInput
                                    value={input.content}
                                    onFileUpload={handleFileUpload}
                                    fileInputRef={fileInputRef}
                                    onClear={clearInput}
                                />
                            )}
                            {input.modality === "text" && (
                                <TextInput
                                    value={input.content}
                                    onChange={setContent}
                                    onClear={clearInput}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Action Cards Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-aurora-rose rounded-full"></div>
                        <h2 className="text-lg font-black uppercase tracking-tight">
                            Choose Analysis
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {ACTION_CARDS.map((card, index) => (
                            <ActionCard
                                key={card.id}
                                card={card}
                                index={index}
                                isInputValid={isInputValid}
                                onClick={() => handleActionCardClick(card.id, card.href)}
                            />
                        ))}
                    </div>

                    {!isInputValid && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-white/30 text-xs mt-4"
                        >
                            Please provide input above to enable analysis
                        </motion.p>
                    )}
                </motion.div>
            </div>

            {/* Fact Check Modal */}
            <FactCheckModal
                isOpen={isFactCheckModalOpen}
                onClose={() => setIsFactCheckModalOpen(false)}
            />
        </div>
    );
}

// Video Input Component
function VideoInput({
    value,
    onChange,
    onFileUpload,
    fileInputRef,
    onClear,
}: {
    value: string;
    onChange: (value: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onClear: () => void;
}) {
    const [inputMode, setInputMode] = useState<"url" | "upload">("url");

    return (
        <div className="space-y-4">
            {/* Input Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setInputMode("url")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        inputMode === "url"
                            ? "bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                    }`}
                >
                    <LinkIcon size={14} className="inline mr-2" />
                    URL
                </button>
                <button
                    onClick={() => setInputMode("upload")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        inputMode === "upload"
                            ? "bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                    }`}
                >
                    <Upload size={14} className="inline mr-2" />
                    Upload
                </button>
            </div>

            {inputMode === "url" ? (
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-aurora-cyan">
                        <LinkIcon size={18} />
                    </div>
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Paste Instagram Reel URL or Youtube Short URL here..."
                        className="w-full px-14 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/10 transition-all font-medium"
                    />
                    {value && (
                        <button
                            onClick={onClear}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-aurora-cyan/30 hover:bg-white/5 transition-all"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={onFileUpload}
                        className="hidden"
                    />
                    <Upload className="mx-auto mb-3 text-white/30" size={32} />
                    <p className="text-white/50 text-sm font-medium">
                        {value || "Click to upload video file"}
                    </p>
                    <p className="text-white/20 text-xs mt-1">MP4, MOV, AVI supported</p>
                </div>
            )}
        </div>
    );
}

// Audio Input Component
function AudioInput({
    value,
    onFileUpload,
    fileInputRef,
    onClear,
}: {
    value: string;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onClear: () => void;
}) {
    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-aurora-cyan/30 hover:bg-white/5 transition-all"
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={onFileUpload}
                className="hidden"
            />
            <Mic className="mx-auto mb-3 text-white/30" size={32} />
            <p className="text-white/50 text-sm font-medium">
                {value || "Click to upload audio file"}
            </p>
            <p className="text-white/20 text-xs mt-1">MP3, WAV, M4A supported</p>
            {value && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="mt-3 px-4 py-2 bg-white/5 rounded-xl text-white/40 hover:text-white/60 text-xs font-medium transition-colors"
                >
                    Clear
                </button>
            )}
        </div>
    );
}

// Text Input Component
function TextInput({
    value,
    onChange,
    onClear,
}: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
}) {
    return (
        <div className="relative">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste or type your content here for analysis..."
                rows={6}
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/10 transition-all font-medium resize-none"
            />
            <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-white/20 text-xs">{value.length} characters</span>
                {value && (
                    <button
                        onClick={onClear}
                        className="text-white/30 hover:text-white/60 text-xs font-medium transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

// Action Card Component
function ActionCard({
    card,
    index,
    isInputValid,
    onClick,
}: {
    card: (typeof ACTION_CARDS)[0];
    index: number;
    isInputValid: boolean;
    onClick: () => void;
}) {
    const colorMap = {
        cyan: {
            bg: "hover:bg-aurora-cyan/5",
            border: "hover:border-aurora-cyan/30",
            icon: "text-aurora-cyan",
            glow: "group-hover:shadow-[0_0_30px_rgba(0,242,254,0.1)]",
        },
        rose: {
            bg: "hover:bg-aurora-rose/5",
            border: "hover:border-aurora-rose/30",
            icon: "text-aurora-rose",
            glow: "group-hover:shadow-[0_0_30px_rgba(255,0,128,0.1)]",
        },
        blue: {
            bg: "hover:bg-aurora-blue/5",
            border: "hover:border-aurora-blue/30",
            icon: "text-aurora-blue",
            glow: "group-hover:shadow-[0_0_30px_rgba(79,172,254,0.1)]",
        },
    };

    const colors = colorMap[card.color as keyof typeof colorMap];

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                delay: 0.3 + index * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { 
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }
            }}
            whileTap={{ 
                scale: 0.98,
                transition: { 
                    duration: 0.1,
                    ease: "easeOut"
                }
            }}
            onClick={onClick}
            disabled={!isInputValid}
            className={`group relative p-8 rounded-[2rem] cyber-glass border border-white/5 text-left transition-all duration-500 ease-out ${
                colors.bg
            } ${colors.border} ${colors.glow} ${
                !isInputValid ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
        >
            <motion.div
                className={`p-4 rounded-2xl bg-white/5 inline-block mb-4 transition-all duration-300 ease-out`}
                whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
            >
                <div className={colors.icon}>{card.icon}</div>
            </motion.div>
            <motion.h3 
                className="text-base font-black uppercase tracking-tight mb-2"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                {card.title}
            </motion.h3>
            <p className="text-white/40 text-xs leading-relaxed transition-colors duration-300 group-hover:text-white/60">
                {card.description}
            </p>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ 
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className={`absolute bottom-6 right-6 ${colors.icon}`}
            >
                <ArrowRight size={18} />
            </motion.div>
        </motion.button>
    );
}
