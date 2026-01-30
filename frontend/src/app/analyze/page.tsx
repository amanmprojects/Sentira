"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    Fingerprint,
    XCircle
} from "lucide-react";
import { analyzeReel, analyzeYouTube, detectVideoSource, type EnhancedReelAnalysis, type VideoSourceType } from "@/lib/api";
import BeamGridBackground from "@/components/ui/beam-grid-background";

export default function AnalyzePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('url');
    const [urlInput, setUrlInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<EnhancedReelAnalysis | null>(null);
    const [videoSource, setVideoSource] = useState<VideoSourceType | null>(null);

    const startAnalysis = async () => {
        if (!urlInput.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        // Detect video source
        const detectedSource = detectVideoSource(urlInput);
        setVideoSource(detectedSource);

        setError(null);
        setIsAnalyzing(true);
        setProgress(0);
        setCurrentStep(`Connecting to ${detectedSource === 'youtube' ? 'YouTube' : 'Instagram'}...`);

        // Simulate initial progress while waiting for API
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) {
                    clearInterval(progressInterval);
                    return 85;
                }
                // Update step based on progress
                if (prev >= 20 && prev < 50) {
                    setCurrentStep('Downloading video content...');
                } else if (prev >= 50 && prev < 70) {
                    setCurrentStep('Multimodal analysis in progress...');
                } else if (prev >= 70) {
                    setCurrentStep('Fact-checking claims...');
                }
                return prev + 2;
            });
        }, 200);

        try {
            let result: EnhancedReelAnalysis;

            if (detectedSource === 'youtube') {
                result = await analyzeYouTube(urlInput, true);
            } else {
                result = await analyzeReel(urlInput, true);
            }

            clearInterval(progressInterval);
            setProgress(100);
            setCurrentStep('Analysis complete!');
            setAnalysisResult(result);

            // Navigate to results page with the analysis data
            setTimeout(() => {
                // Store result in sessionStorage for the results page
                sessionStorage.setItem('analysisResult', JSON.stringify(result));
                sessionStorage.setItem('analyzedUrl', urlInput);
                sessionStorage.setItem('videoSource', detectedSource);
                router.push(`/analyze/${encodeURIComponent(urlInput)}`);
            }, 1000);
        } catch (err) {
            clearInterval(progressInterval);
            setIsAnalyzing(false);
            setProgress(0);
            setError(err instanceof Error ? err.message : 'Failed to analyze video');
        }
    };

    const resetAnalysis = () => {
        setIsAnalyzing(false);
        setProgress(0);
        setError(null);
        setAnalysisResult(null);
        setCurrentStep('');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pt-12 overflow-hidden selection:bg-aurora-cyan/30">
            {/* Animated Beam Grid Background */}
            <BeamGridBackground
                gridSize={50}
                beamColor="rgba(0, 242, 254, 0.6)"
                darkBeamColor="rgba(0, 242, 254, 0.8)"
                beamCount={10}
                extraBeamCount={4}
                beamSpeed={0.08}
                beamThickness={2}
                glowIntensity={40}
                fadeIntensity={30}
            />

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

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-4"
                    >
                        <XCircle className="text-red-400" size={24} />
                        <span className="text-red-300 font-bold">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-300"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

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
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="ENTER VIDEO URL..."
                                        disabled={isAnalyzing}
                                        className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] py-8 pl-24 pr-10 text-xl font-bold italic tracking-tight outline-none focus:border-aurora-cyan/30 focus:bg-white/10 transition-all placeholder:text-white/10 disabled:opacity-50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-4 italic text-sm text-white/30 font-medium">
                                        <div className="flex items-center gap-2 text-aurora-cyan text-xs font-black uppercase not-italic"><AlertCircle size={16} /> Supported Platforms</div>
                                        Instagram Reels, YouTube videos & Shorts, TikTok videos. Enter the full URL to begin analysis.
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
                                    disabled={activeTab === 'url' && !urlInput.trim()}
                                    className="w-full py-8 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose text-black rounded-[2.5rem] text-3xl font-black uppercase tracking-tighter italic hover:scale-[1.02] transition-transform flex items-center justify-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                                <span className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">{currentStep || 'Gemini Flash 2.5 Hub Connected'}</span>
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

                                    {progress < 100 && (
                                        <button
                                            onClick={resetAnalysis}
                                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                                        >
                                            Cancel Analysis
                                        </button>
                                    )}
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
