"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Activity, Play, Clock, MessageSquare, User,
  AlertTriangle, Info, BarChart3, Maximize2, Volume2,
  ChevronRight, Zap, TrendingUp, Loader2, ArrowLeft, VolumeX, Pause, SkipBack, SkipForward
} from "lucide-react";
import Link from "next/link";
import { useAnalysis } from "@/context/AnalysisContext";
import { analyzeSentiment, type SentimentAnalysisResponse, type Emotion, API_BASE_URL } from "@/lib/api";

function SummaryBadge({ label, value, color }: { label: string, value: string, color: 'cyan' | 'blue' | 'rose' }) {
  const colors = {
    cyan: "text-aurora-cyan border-aurora-cyan/20 bg-aurora-cyan/5",
    blue: "text-aurora-blue border-aurora-blue/20 bg-aurora-blue/5",
    rose: "text-aurora-rose border-aurora-rose/20 bg-aurora-rose/5",
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} space-y-1`}>
      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">{label}</p>
      <p className="text-sm font-black uppercase italic">{value}</p>
    </div>
  );
}

function Seismograph({ label, color, active, data }: {
  label: string;
  color: string;
  active: boolean;
  data: number[];
}) {
  const bars = data.length > 0 ? data : [10, 20, 30, 40, 35, 25, 15, 10];

  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        <TrendingUp size={10} className={active ? "text-aurora-cyan animate-pulse" : "text-white/10"} />
      </div>
      <div className="h-10 flex items-end gap-1 px-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: active ? `${h}%` : "10%" }}
            className={`flex-1 rounded-t-sm ${
              color === 'rose' ? 'bg-aurora-rose/40' :
              color === 'blue' ? 'bg-aurora-blue/40' :
              'bg-aurora-cyan/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineSegment({ color, width, label, onClick, active, style }: {
  color: string;
  width: string;
  label: string;
  onClick: () => void;
  active: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{ width, ...style }}
      className={`h-full relative group transition-all absolute top-0 ${color} ${
        active ? 'opacity-100' : 'opacity-40 hover:opacity-100'
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
        <span className="text-[8px] font-black uppercase tracking-widest text-white shadow-xl">
          {label}
        </span>
      </div>
    </div>
  );
}

function getEmotionColor(emotion: Emotion): string {
  switch (emotion) {
    case "Anger": return "text-aurora-rose";
    case "Surprise": return "text-aurora-cyan";
    case "Humor": return "text-aurora-blue";
    case "Sadness": return "text-blue-400";
    case "Horror": return "text-purple-500";
    case "Disgust": return "text-green-500";
    default: return "text-white";
  }
}

function getEmotionColorBg(emotion: Emotion): string {
  switch (emotion) {
    case "Anger": return "bg-aurora-rose";
    case "Surprise": return "bg-aurora-cyan";
    case "Humor": return "bg-aurora-blue";
    case "Sadness": return "bg-blue-400";
    case "Horror": return "bg-purple-500";
    case "Disgust": return "bg-green-500";
    default: return "bg-white";
  }
}

function NoInputState() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md"
      >
        <AlertTriangle className="mx-auto mb-4 text-aurora-cyan" size={48} />
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">
          No Input Provided
        </h2>
        <p className="text-white/40 text-sm mb-6">
          Please return to Dashboard and provide content to analyze.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/20 transition-all"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

function LoadingState({ message, subMessage }: { message: string; subMessage: string }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md space-y-6"
      >
        <Loader2 className="mx-auto text-aurora-cyan animate-spin" size={48} />
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">
            {message}
          </h2>
          <p className="text-white/40 text-sm">
            {subMessage}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
          <div className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse" />
          <span>Optimized Analysis • ~20-30s</span>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md space-y-6"
      >
        <AlertTriangle className="mx-auto text-aurora-rose" size={48} />
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">
            Analysis Failed
          </h2>
          <p className="text-white/40 text-sm mb-4">
            {error}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/20 transition-all"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

function VideoPlayer({ videoUrl, duration, currentTime, isPlaying, onTimeUpdate, onPlayStateChange }: {
  videoUrl: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      onTimeUpdate(video.currentTime);
    }
  };

  const handlePlay = () => onPlayStateChange(true);
  const handlePause = () => onPlayStateChange(false);

  return (
    <video
      ref={videoRef}
      src={`${API_BASE_URL}${videoUrl}`}
      controls
      className="w-full h-full"
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={() => onPlayStateChange(false)}
    />
  );
}

export default function SentimentAnalysisPage() {
  const { input, isInputValid } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SentimentAnalysisResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isInputValid && input.content) {
      fetchAnalysis();
    }
  }, [isInputValid, input.content]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeSentiment(input.content);
      setData(result);
      console.log('Analysis result:', result);
      console.log('video_url:', result.video_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && data && data.duration > 0) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          return next >= data.duration ? 0 : next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, data]);

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const duration = data?.duration || 30;

  if (!isInputValid) {
    return <NoInputState />;
  }

  if (loading) {
    return (
      <LoadingState
        message="Analyzing emotions across frames..."
        subMessage="This may take 20-30 seconds"
      />
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchAnalysis} />;
  }

  if (!data) {
    return <NoInputState />;
  }

  const emotionCounts = data.emotion_timeline.reduce((acc, seg) => {
    acc[seg.emotion] = (acc[seg.emotion] || 0) + seg.intensity;
    return acc;
  }, {} as Record<Emotion, number>);

  const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  const primaryEmotion = sortedEmotions[0]?.[0] || "Unknown";
  const secondaryEmotion = sortedEmotions[1]?.[0] || "Unknown";

  return (
    <div className="min-h-screen p-6 pt-10 relative selection:bg-aurora-cyan/30">
      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">

        <motion.header
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="text-aurora-cyan" size={14} />
              <span className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px]">
                Multimodal Extraction
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Sentiment <span className="aurora-text">Engine</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black text-green-400">OPTIMIZED</span>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-12 gap-6">

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden group relative aspect-[9/16] max-h-[700px]">
              {data.video_url ? (
                <VideoPlayer
                  videoUrl={data.video_url}
                  duration={duration}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeUpdate={setCurrentTime}
                  onPlayStateChange={setIsPlaying}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Video not available
                  </p>
                </div>
              )}

              <div className={isPlaying ? "hidden" : "absolute inset-0 flex items-center justify-center"}>
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 rounded-full bg-white/5 hover:bg-aurora-cyan/20 transition-all flex items-center justify-center"
                >
                  <Play fill="white" className="text-white" size={24} />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      {isPlaying ? (
                        <Pause fill="white" className="text-white" size={16} />
                      ) : (
                        <Play fill="white" className="text-white" size={16} />
                      )}
                    </button>
                    <span className="text-xs font-black tabular-nums text-white/80">
                      {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                      {Math.floor(currentTime % 60).toString().padStart(2, '0')} / {duration}s
                    </span>
                  </div>
                  <Maximize2 size={14} className="text-white/40" />
                </div>

                <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-aurora-cyan"
                    animate={{ width: `${(currentTime / duration) * 100}%` }}
                    transition={{ ease: "linear", duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <BarChart3 size={12} /> Narrative Synthesis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <SummaryBadge label="Primary" value={primaryEmotion} color="cyan" />
                <SummaryBadge label="Secondary" value={secondaryEmotion} color="blue" />
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Confidence Index</p>
                  <p className="text-xl font-black italic">
                    {Math.round(data.confidence * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Category</p>
                  <p className="text-sm font-black uppercase text-aurora-cyan">
                    {data.global_category}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] flex flex-col h-[500px]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} className="text-aurora-cyan" /> Logged Transcript
                  </h2>
                  <span className="text-[9px] font-black text-white/20 uppercase">
                    {data.transcript_segments.length} segments
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
                  {data.transcript_segments.map((seg) => (
                    <div
                      key={seg.id}
                      onClick={() => setCurrentTime(seg.start)}
                      className={`p-4 rounded-xl transition-all cursor-pointer border ${
                        currentTime >= seg.start && currentTime <= seg.end
                          ? "bg-white/5 border-aurora-cyan/30"
                          : "border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-white/20 tabular-nums">
                          {Math.floor(seg.start / 60).toString().padStart(2, '0')}:
                          {Math.floor(seg.start % 60).toString().padStart(2, '0')} -
                          {Math.floor(seg.end / 60).toString().padStart(2, '0')}:
                          {Math.floor(seg.end % 60).toString().padStart(2, '0')}
                        </span>
                        {seg.emotion && (
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${getEmotionColor(seg.emotion)}`}>
                            {seg.emotion}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-white/70">
                        {seg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-6 h-[500px] overflow-hidden">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-aurora-cyan" /> Neural Seismograph
                </h2>
                <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pr-2 scrollbar-none pb-12">
                  {(["Anger", "Disgust", "Horror", "Humor", "Sadness", "Surprise"] as Emotion[]).map((emotion) => {
                    const emotionColor = emotion === "Anger" ? "rose" : emotion === "Humor" ? "cyan" : "blue";
                    const isActive = data.emotion_timeline.some(
                      seg => seg.emotion === emotion && currentTime >= seg.start && currentTime <= seg.end
                    );
                    return (
                      <Seismograph
                        key={emotion}
                        label={emotion}
                        color={emotionColor}
                        active={isActive}
                        data={data.emotion_seismograph[emotion] || []}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Dominance Timeline
              </h2>
              <div className="relative h-12 w-full bg-white/5 rounded-xl overflow-hidden">
                {data.emotion_timeline.map((seg, i) => {
                  const width = ((seg.end - seg.start) / duration) * 100;
                  const left = (seg.start / duration) * 100;
                  const color = getEmotionColorBg(seg.emotion);

                  return (
                    <TimelineSegment
                      key={i}
                      color={color}
                      width={`${width}%`}
                      style={{ left: `${left}%` }}
                      label={seg.emotion}
                      onClick={() => setCurrentTime(seg.start)}
                      active={currentTime >= seg.start && currentTime <= seg.end}
                    />
                  );
                })}

                <motion.div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_#fff] z-10"
                  animate={{ left: `${(currentTime / duration) * 100}%` }}
                  transition={{ ease: "linear", duration: 0.5 }}
                />
              </div>
            </div>

            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-aurora-cyan" /> Facial Expression Map
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.character_emotions.map(char => (
                  <div key={char.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-aurora-cyan/10 flex items-center justify-center border border-aurora-cyan/20">
                        <User size={20} className="text-aurora-cyan" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase italic">{char.name}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                          S-TIME: {Math.round(char.screenTime)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[9px] font-black uppercase ${getEmotionColor(char.dominantEmotion)}`}>
                        {char.dominantEmotion}
                      </p>
                      <p className="text-[8px] font-bold text-white/20 uppercase">
                        VOLATILITY: {char.volatility}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <Info size={18} className="text-white/20 mt-1 shrink-0" />
              <p className="text-[11px] leading-relaxed text-white/30 font-medium font-display">
                <span className="text-white/60 font-black uppercase tracking-widest">Transparency Protocol:</span> All emotional signals detected are strictly derived from high-fidelity
                machine learning analysis of pixel volatility (facial landmarks) and acoustic frequency logs. Sentira does not infer
                intent, personality traits, or sensitive demographic data. All insights are timestamp-locked to specific observable cues within the media packet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
