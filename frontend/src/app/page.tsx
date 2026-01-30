"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  FileText,
  Headphones,
  Link as LinkIcon,
  ShieldCheck,
  Sparkles,
  Type,
  Upload,
  Video
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BeamGridBackground } from "@/components/ui/beam-grid-background";
import { useAnalysis } from "@/context/AnalysisContext";

export default function Home() {
  const {
    modality,
    setModality,
    text,
    setText,
    setAudioFile,
    setVideoFile,
    videoUrl,
    setVideoUrl
  } = useAnalysis();
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white p-6 md:p-12 overflow-hidden">
      <BeamGridBackground
        gridSize={50}
        beamColor="rgba(0, 242, 254, 0.4)"
        darkBeamColor="rgba(0, 242, 254, 0.6)"
        beamCount={8}
        extraBeamCount={3}
        beamSpeed={0.06}
        beamThickness={1.5}
        glowIntensity={25}
        fadeIntensity={20}
      />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-aurora-cyan uppercase font-black tracking-[0.4em] text-[10px]">Command Center</span>
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan shadow-[0_0_8px_#00f2fe]"></div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter">
            Inbound <span className="aurora-text">Pulse</span>
          </h1>
        </motion.header>

        {/* Multimodal Input Section */}
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-10">
            {/* 1. Multimodal Input Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[2.5rem] cyber-glass border border-white/5 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                  <Sparkles className="text-aurora-cyan" size={20} /> Select Modality
                </h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <ModalityTab
                  active={modality === "text"}
                  onClick={() => setModality("text")}
                  icon={<Type size={20} />}
                  label="Text"
                />
                <ModalityTab
                  active={modality === "audio"}
                  onClick={() => setModality("audio")}
                  icon={<Headphones size={20} />}
                  label="Audio"
                />
                <ModalityTab
                  active={modality === "video"}
                  onClick={() => setModality("video")}
                  icon={<Video size={20} />}
                  label="Video"
                />
              </div>

              {/* 2. Input Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={modality}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="min-h-[240px] flex flex-col"
                >
                  {modality === "text" && (
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text content for analysis..."
                      className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/20 transition-all resize-none placeholder:text-white/20"
                    />
                  )}

                  {modality === "audio" && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl group hover:border-aurora-cyan/30 transition-all cursor-pointer p-8">
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        id="audio-upload"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="audio-upload" className="flex flex-col items-center gap-4 cursor-pointer">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,242,254,0.1)] transition-all">
                          <Upload size={32} className="text-white/40 group-hover:text-aurora-cyan" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black uppercase tracking-tight">Upload Audio Stream</p>
                          <p className="text-sm text-white/30 font-medium">MP3, WAV, or AAC formats supported</p>
                        </div>
                      </label>
                    </div>
                  )}

                  {modality === "video" && (
                    <div className="space-y-6">
                      <div className="relative group">
                        <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-aurora-cyan transition-colors" size={20} />
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="Input social media URL (Instagram, Reels, etc.)"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-aurora-cyan/50 transition-all placeholder:text-white/20"
                        />
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl group hover:border-aurora-rose/30 transition-all cursor-pointer p-8 min-h-[140px]">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          id="video-upload"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="video-upload" className="flex items-center gap-4 cursor-pointer">
                          <Upload size={20} className="text-white/40 group-hover:text-aurora-rose" />
                          <span className="text-sm font-black uppercase tracking-widest text-white/40 group-hover:text-white">Or Upload MP4 File</span>
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* 3. Action Cards Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ActionCard
              title="Sentiment Analysis"
              description="Deep emotional flux and tonal recognition engine."
              icon={<Activity size={24} className="text-aurora-cyan" />}
              color="cyan"
              onClick={() => router.push("/sentiment-analysis")}
            />
            <ActionCard
              title="Detecting Bias"
              description="Identify manipulative framing and cherry-picked facts."
              icon={<ShieldCheck size={24} className="text-aurora-rose" />}
              color="rose"
              onClick={() => router.push("/detecting-bias")}
            />
            <ActionCard
              title="Fact Checking"
              description="Real-time verification against global knowledge bases."
              icon={<FileText size={24} className="text-aurora-blue" />}
              color="blue"
              onClick={() => router.push("/reports")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalityTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all ${active
        ? "bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        : "text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent"
        }`}
    >
      <div className={active ? "text-aurora-cyan" : ""}>{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ActionCard({ title, description, icon, color, onClick }: { title: string, description: string, icon: React.ReactNode, color: 'cyan' | 'rose' | 'blue', onClick: () => void }) {
  const colorStyles = {
    cyan: "hover:border-aurora-cyan group-hover:shadow-[0_0_25px_rgba(0,242,254,0.1)]",
    rose: "hover:border-aurora-rose group-hover:shadow-[0_0_25px_rgba(255,0,128,0.1)]",
    blue: "hover:border-aurora-blue group-hover:shadow-[0_0_25px_rgba(79,172,254,0.1)]",
  };

  return (
    <motion.button
      whileHover={{ x: 10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative p-8 rounded-[2.5rem] cyber-glass border border-white/5 text-left transition-all duration-500 overflow-hidden ${colorStyles[color]}`}
    >
      <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700 scale-[3]">
        {icon}
      </div>

      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            {title}
            <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
          </h3>
          <p className="text-sm text-white/40 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}
