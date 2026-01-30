"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Target,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock,
  FileText,
  Download,
  Share2,
  Settings,
  ArrowUp,
  ArrowDown,
  Play,
  Sparkles,
  Heart,
  Shield,
  Frown,
  Smile,
  Meh,
  Eye,
  MessageSquare,
  Hash,
  Layers,
  Activity,
  PieChart,
  Users,
  BookOpen,
  Scissors,
  TrendingDown,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAnalysis } from "@/context/AnalysisContext";

// Types
interface TimelinePoint {
  timestamp: number;
  sentiment: number;
  transcript: string;
}

interface KeyMoment {
  timestamp: number;
  sentiment: number;
  label: string;
  context: string;
}

interface Emotion {
  name: string;
  data: number[];
}

interface Topic {
  name: string;
  start: number;
  end: number;
  coverage: number;
}

interface Anomaly {
  type: string;
  timestamp: number;
  severity: "high" | "medium" | "low";
  description: string;
  context: string;
  change?: number;
}

interface Keyword {
  word: string;
  count: number;
  sentiment: number;
  trend: number[];
}

interface CTA {
  timestamp: number;
  text: string;
  strength: number;
  factors: { text: string; positive: boolean }[];
}

// Mock Data
const mockTimeline: TimelinePoint[] = Array.from({ length: 50 }, (_, i) => ({
  timestamp: i * 4,
  sentiment: Math.sin(i * 0.3) * 0.5 + Math.random() * 0.3 - 0.15,
  transcript: `Transcript segment at ${Math.floor(i * 4 / 60)}:${String((i * 4) % 60).padStart(2, "0")}`,
}));

const mockKeyMoments: KeyMoment[] = [
  { timestamp: 23, sentiment: 0.87, label: "Peak Positivity", context: "Product reveal moment" },
  { timestamp: 105, sentiment: -0.42, label: "Sentiment Drop", context: "Pricing discussion" },
  { timestamp: 192, sentiment: 0.71, label: "Recovery", context: "Customer testimonial" },
];

const mockEmotions: Emotion[] = [
  { name: "Happiness", data: [0.8, 0.7, 0.9, 0.6, 0.5, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.6, 0.7, 0.9, 0.8, 0.7, 0.6, 0.5] },
  { name: "Sadness", data: [0.6, 0.5, 0.7, 0.8, 0.6, 0.7, 0.5, 0.6, 0.8, 0.7, 0.6, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7] },
  { name: "Fear", data: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3, 0.1, 0.2, 0.3, 0.2, 0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.1] },
  { name: "Disgust", data: [0.4, 0.8, 0.3, 0.2, 0.5, 0.3, 0.4, 0.2, 0.6, 0.3, 0.4, 0.5, 0.3, 0.2, 0.4, 0.3, 0.5, 0.4, 0.3, 0.2] },
  { name: "Anger", data: [0.1, 0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.1, 0.2, 0.1, 0.3, 0.2, 0.1, 0.2, 0.1, 0.2, 0.3, 0.1, 0.2] },
  { name: "Surprise", data: [0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1] },
];

const mockTopics: Topic[] = [
  { name: "Intro", start: 0, end: 30, coverage: 0.15 },
  { name: "Product Features", start: 30, end: 120, coverage: 0.45 },
  { name: "Pricing", start: 105, end: 150, coverage: 0.22 },
  { name: "Testimonials", start: 140, end: 180, coverage: 0.18 },
  { name: "CTA", start: 175, end: 204, coverage: 0.14 },
];

const mockAnomalies: Anomaly[] = [
  {
    type: "Sentiment",
    timestamp: 102,
    severity: "high",
    description: "Sudden sentiment drop at 1:42",
    context: "Pricing discussion triggered negative shift",
    change: -0.7,
  },
  {
    type: "Pacing",
    timestamp: 85,
    severity: "medium",
    description: "Speaking pace spike at 1:25",
    context: "189 WPM detected, above optimal range",
  },
  {
    type: "Emotion",
    timestamp: 156,
    severity: "low",
    description: "Fear spike at 2:36",
    context: "Mention of competitor risks",
  },
];

const mockKeywords: Keyword[] = [
  { word: "product quality", count: 47, sentiment: 0.82, trend: [1, 2, 3, 5, 7, 8, 8, 7, 5, 3, 2, 1] },
  { word: "price", count: 23, sentiment: -0.45, trend: [0, 1, 1, 2, 5, 8, 6, 4, 2, 1, 1, 0] },
  { word: "shipping", count: 12, sentiment: 0.1, trend: [1, 1, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1] },
  { word: "customer service", count: 18, sentiment: 0.78, trend: [1, 2, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1] },
  { word: "delivery", count: 15, sentiment: 0.35, trend: [1, 1, 2, 3, 2, 2, 1, 2, 1, 2, 1, 1] },
  { word: "warranty", count: 8, sentiment: 0.65, trend: [0, 0, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0] },
];

const mockCTAs: CTA[] = [
  {
    timestamp: 15,
    text: "Check description",
    strength: 3.2,
    factors: [
      { text: "Too early in content", positive: false },
      { text: "Vague action", positive: false },
    ],
  },
  {
    timestamp: 154,
    text: "Click link for 20% off",
    strength: 8.5,
    factors: [
      { text: "Clear action", positive: true },
      { text: "Urgency language", positive: true },
      { text: "Value proposition", positive: true },
    ],
  },
  {
    timestamp: 198,
    text: "Subscribe for more",
    strength: 6.8,
    factors: [
      { text: "Clear action", positive: true },
      { text: "Generic, no unique value", positive: false },
    ],
  },
];

// Utility functions
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const getSentimentColor = (value: number) => {
  if (value > 0.2) return "#00E676";
  if (value < -0.2) return "#FF5252";
  return "#9E9E9E";
};

const getSentimentLabel = (value: number) => {
  if (value > 0.5) return "Very Positive";
  if (value > 0.2) return "Positive";
  if (value > -0.2) return "Neutral";
  if (value > -0.5) return "Negative";
  return "Very Negative";
};

const getIntensityColor = (intensity: number) => {
  if (intensity < 0.25) return "bg-white/5";
  if (intensity < 0.5) return "bg-aurora-cyan/20";
  if (intensity < 0.75) return "bg-aurora-cyan/40";
  return "bg-aurora-cyan/70";
};

const getPriorityColor = (severity: "high" | "medium" | "low") => {
  switch (severity) {
    case "high":
      return "border-l-red-500 bg-red-500/5";
    case "medium":
      return "border-l-orange-500 bg-orange-500/5";
    case "low":
      return "border-l-aurora-cyan bg-aurora-cyan/5";
  }
};

// Components
function StatCard({ icon, label, value, change, positive }: { icon: React.ReactNode; label: string; value: string; change: string; positive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161616] border border-white/5 rounded-xl p-5 hover:border-aurora-cyan/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan">
          {icon}
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold ${positive ? "text-green-500" : "text-red-500"}`}>
          {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {change}
        </span>
      </div>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </motion.div>
  );
}

function SentimentTimeline({ data, keyMoments }: { data: TimelinePoint[]; keyMoments: KeyMoment[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxTime = data[data.length - 1]?.timestamp || 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-aurora-cyan/10 flex items-center justify-center">
          <Activity className="text-aurora-cyan" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Sentiment Timeline</h2>
          <p className="text-white/40 text-xs">Real-time sentiment fluctuation across content duration</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 mt-4">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 0.5, 0, -0.5, -1].map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 w-8">{v > 0 ? `+${v}` : v}</span>
              <div className="flex-1 border-t border-white/5" />
            </div>
          ))}
        </div>

        {/* Zero Line */}
        <div className="absolute left-10 right-0 top-1/2 border-t border-white/20" />

        {/* Sentiment Area */}
        <svg className="absolute left-10 right-0 top-0 bottom-0 h-full w-[calc(100%-40px)]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FF5252" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF5252" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Positive Area */}
          <path
            d={`M 0 128 ${data.map((p, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = p.sentiment > 0 ? 128 - (p.sentiment * 128) : 128;
              return `L ${x}% ${y}`;
            }).join(" ")} L 100% 128 Z`}
            fill="url(#positiveGradient)"
          />

          {/* Negative Area */}
          <path
            d={`M 0 128 ${data.map((p, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = p.sentiment < 0 ? 128 - (p.sentiment * 128) : 128;
              return `L ${x}% ${y}`;
            }).join(" ")} L 100% 128 Z`}
            fill="url(#negativeGradient)"
          />

          {/* Line */}
          <path
            d={`M ${data.map((p, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 128 - (p.sentiment * 128);
              return `${i === 0 ? "" : "L "}${x}% ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke="#00f2fe"
            strokeWidth="2"
          />
        </svg>

        {/* Interactive Points */}
        <div className="absolute left-10 right-0 top-0 bottom-0 flex">
          {data.map((point, i) => (
            <div
              key={i}
              className="flex-1 relative cursor-pointer"
              onMouseEnter={() => {
                setHoveredPoint(point);
                setHoveredIndex(i);
              }}
              onMouseLeave={() => {
                setHoveredPoint(null);
                setHoveredIndex(null);
              }}
            >
              {hoveredIndex === i && (
                <div className="absolute top-0 bottom-0 w-px bg-aurora-cyan/50 left-1/2" />
              )}
            </div>
          ))}
        </div>

        {/* Key Moment Markers */}
        {keyMoments.map((moment, i) => {
          const xPercent = (moment.timestamp / maxTime) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-6"
              style={{ left: `calc(40px + ${xPercent}% * (100% - 40px) / 100)` }}
            >
              <div className="h-full border-l border-dashed" style={{ borderColor: getSentimentColor(moment.sentiment) }} />
              <div className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full bg-[#0F0F0F] border-2 flex items-center justify-center text-[8px]" style={{ borderColor: getSentimentColor(moment.sentiment) }}>
                📍
              </div>
            </div>
          );
        })}

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredPoint && hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-20 bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-xs shadow-xl"
              style={{
                left: `calc(40px + ${(hoveredIndex / (data.length - 1)) * 100}% * (100% - 40px) / 100)`,
                top: "10px",
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-white/60">Time: <span className="text-white font-bold">{formatTime(hoveredPoint.timestamp)}</span></p>
              <p className="text-white/60">
                Sentiment: <span className="font-bold" style={{ color: getSentimentColor(hoveredPoint.sentiment) }}>
                  {hoveredPoint.sentiment > 0 ? "+" : ""}{hoveredPoint.sentiment.toFixed(2)} ({getSentimentLabel(hoveredPoint.sentiment)})
                </span>
              </p>
              <p className="text-white/40 mt-1 max-w-[200px] truncate">{hoveredPoint.transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Time Axis */}
      <div className="flex justify-between mt-2 pl-10 text-[10px] text-white/30">
        <span>0:00</span>
        <span>{formatTime(Math.floor(maxTime / 4))}</span>
        <span>{formatTime(Math.floor(maxTime / 2))}</span>
        <span>{formatTime(Math.floor((maxTime * 3) / 4))}</span>
        <span>{formatTime(maxTime)}</span>
      </div>

      {/* Key Moments List */}
      <div className="mt-6 space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-3">Key Moments</h3>
        {keyMoments.map((moment, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:border-aurora-cyan/20 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: `${getSentimentColor(moment.sentiment)}20`, color: getSentimentColor(moment.sentiment) }}>
              📍
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">{formatTime(moment.timestamp)}</span>
                <span className="text-xs font-bold">{moment.label}</span>
                <span className="text-xs" style={{ color: getSentimentColor(moment.sentiment) }}>
                  ({moment.sentiment > 0 ? "+" : ""}{moment.sentiment.toFixed(2)})
                </span>
              </div>
              <p className="text-white/40 text-xs mt-1">{moment.context}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmotionHeatmap({ emotions }: { emotions: Emotion[] }) {
  const [hoveredCell, setHoveredCell] = useState<{ emotion: string; segment: number; value: number } | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          🔥
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Emotion Intensity Heatmap</h3>
          <p className="text-white/40 text-[10px]">Visualizes emotional fluctuations throughout content</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {emotions.map((emotion, ei) => (
            <div key={emotion.name} className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/60 w-20">{emotion.name}</span>
              <div className="flex gap-[2px] flex-1">
                {emotion.data.map((value, i) => (
                  <div
                    key={i}
                    className={`h-8 flex-1 rounded-sm ${getIntensityColor(value)} transition-all hover:ring-1 hover:ring-aurora-cyan cursor-pointer`}
                    onMouseEnter={() => setHoveredCell({ emotion: emotion.name, segment: i, value })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-white/40">
        <span>Low</span>
        <div className="flex gap-[2px]">
          <div className="w-4 h-3 bg-white/5 rounded-sm" />
          <div className="w-4 h-3 bg-aurora-cyan/20 rounded-sm" />
          <div className="w-4 h-3 bg-aurora-cyan/40 rounded-sm" />
          <div className="w-4 h-3 bg-aurora-cyan/70 rounded-sm" />
        </div>
        <span>High</span>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 p-2 bg-white/5 rounded-lg text-xs"
          >
            <span className="text-white/60">{hoveredCell.emotion}</span> at segment {hoveredCell.segment + 1}: <span className="text-aurora-cyan font-bold">{Math.round(hoveredCell.value * 100)}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TopicFlow({ topics }: { topics: Topic[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-blue/10 flex items-center justify-center">
          🌊
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Topic Evolution Flow</h3>
          <p className="text-white/40 text-[10px]">How topics transition throughout the content</p>
        </div>
      </div>

      <div className="relative py-4">
        {/* Flow visualization */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {topics.map((topic, i) => (
            <div key={i} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-r from-aurora-cyan/20 to-aurora-blue/20 border border-aurora-cyan/30 rounded-xl p-3 min-w-[120px]"
              >
                <p className="text-xs font-bold text-white mb-1">{topic.name}</p>
                <p className="text-[10px] text-white/40">{formatTime(topic.start)} - {formatTime(topic.end)}</p>
                <p className="text-[10px] text-aurora-cyan font-bold">{Math.round(topic.coverage * 100)}% coverage</p>
              </motion.div>
              {i < topics.length - 1 && (
                <div className="flex items-center mx-1">
                  <div className="w-6 h-[2px] bg-gradient-to-r from-aurora-cyan to-aurora-blue" />
                  <ChevronRight size={12} className="text-aurora-cyan -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PacingAnalysis() {
  const pacingData = [
    { time: 0, wpm: 145, optimal: true },
    { time: 30, wpm: 152, optimal: true },
    { time: 60, wpm: 165, optimal: true },
    { time: 90, wpm: 189, optimal: false },
    { time: 120, wpm: 172, optimal: false },
    { time: 150, wpm: 148, optimal: true },
    { time: 180, wpm: 142, optimal: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-cyan/10 flex items-center justify-center">
          <Clock className="text-aurora-cyan" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Content Pacing Analysis</h3>
          <p className="text-white/40 text-[10px]">Speaking speed and information density evaluation</p>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-32 flex items-end gap-1 mb-4">
        {pacingData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.wpm / 200) * 100}%` }}
              transition={{ delay: i * 0.1 }}
              className={`w-full rounded-t-sm ${d.optimal ? "bg-green-500/60" : "bg-red-500/60"}`}
            />
            <span className="text-[8px] text-white/30">{formatTime(d.time)}</span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-xs text-white/80">0:00-1:30 - Good Pace (152 WPM)</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-xs text-white/80">1:30-2:15 - Too Fast (189 WPM)</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Average pace:</span>
          <span className="font-bold">159 WPM</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-white/40">Optimal range:</span>
          <span className="text-green-500">140-160 WPM</span>
        </div>
      </div>
    </motion.div>
  );
}

function AnomalyDetection({ anomalies }: { anomalies: Anomaly[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Anomaly Detection</h3>
          <p className="text-white/40 text-[10px]">Unusual patterns and outliers requiring attention</p>
        </div>
      </div>

      {anomalies.length > 0 ? (
        <div className="space-y-3">
          {anomalies.map((anomaly, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(anomaly.severity)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  anomaly.severity === "high" ? "bg-red-500/20 text-red-500" :
                  anomaly.severity === "medium" ? "bg-orange-500/20 text-orange-500" :
                  "bg-aurora-cyan/20 text-aurora-cyan"
                }`}>
                  {anomaly.severity} priority
                </span>
                <span className="text-[10px] text-white/40">{anomaly.type}</span>
              </div>
              <p className="text-sm font-medium text-white mb-1">{anomaly.description}</p>
              {anomaly.change && (
                <p className="text-xs text-red-400">Change: {anomaly.change}</p>
              )}
              <p className="text-xs text-white/40 mt-1">{anomaly.context}</p>
              <div className="flex gap-2 mt-3">
                <button className="text-[10px] px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  View Details
                </button>
                <button className="text-[10px] px-3 py-1.5 bg-aurora-cyan/10 text-aurora-cyan rounded-lg hover:bg-aurora-cyan/20 transition-colors">
                  Jump to {formatTime(anomaly.timestamp)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
          <p className="text-sm font-medium">No Significant Anomalies Detected</p>
          <p className="text-xs text-white/40">Content flows smoothly with consistent patterns</p>
        </div>
      )}
    </motion.div>
  );
}

function TrendingKeywords({ keywords }: { keywords: Keyword[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Hash className="text-purple-500" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Trending Keywords</h3>
          <p className="text-white/40 text-[10px]">Most frequently mentioned terms and their sentiment</p>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2 mb-4">
        {keywords.map((kw, i) => {
          const fontSize = Math.min(Math.max(10, kw.count / 3), 18);
          const color = kw.sentiment > 0.3 ? "#00E676" : kw.sentiment < -0.3 ? "#FF5252" : "#9E9E9E";
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-aurora-cyan/30 transition-all"
              style={{ fontSize: `${fontSize}px`, color }}
            >
              {kw.word} <span className="text-white/40 text-[10px]">({kw.count})</span>
            </motion.span>
          );
        })}
      </div>

      {/* Mini Trends */}
      <div className="space-y-2">
        {keywords.slice(0, 3).map((kw, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-white/60 w-24 truncate">{kw.word}</span>
            <div className="flex-1 flex items-end h-4 gap-[1px]">
              {kw.trend.map((v, ti) => (
                <div
                  key={ti}
                  className="flex-1 bg-aurora-cyan/40 rounded-sm"
                  style={{ height: `${(v / 8) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SentimentDistribution() {
  const distribution = { positive: 65, neutral: 25, negative: 10 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-cyan/10 flex items-center justify-center">
          <PieChart className="text-aurora-cyan" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Sentiment Breakdown</h3>
          <p className="text-white/40 text-[10px]">Distribution of positive, neutral, and negative</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative w-32 h-32 mx-auto my-4">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {/* Background */}
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A2A2A" strokeWidth="3" />
          
          {/* Positive */}
          <circle
            cx="18" cy="18" r="15.915" fill="none"
            stroke="#00E676" strokeWidth="3"
            strokeDasharray={`${distribution.positive} ${100 - distribution.positive}`}
            strokeDashoffset="25"
            className="transition-all duration-1000"
          />
          
          {/* Neutral */}
          <circle
            cx="18" cy="18" r="15.915" fill="none"
            stroke="#9E9E9E" strokeWidth="3"
            strokeDasharray={`${distribution.neutral} ${100 - distribution.neutral}`}
            strokeDashoffset={`${25 - distribution.positive}`}
            className="transition-all duration-1000"
          />
          
          {/* Negative */}
          <circle
            cx="18" cy="18" r="15.915" fill="none"
            stroke="#FF5252" strokeWidth="3"
            strokeDasharray={`${distribution.negative} ${100 - distribution.negative}`}
            strokeDashoffset={`${25 - distribution.positive - distribution.neutral}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-green-500">{distribution.positive}%</span>
          <span className="text-[10px] text-white/40">Positive</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs">Positive</span>
          </div>
          <span className="text-xs font-bold">{distribution.positive}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/40" />
            <span className="text-xs">Neutral</span>
          </div>
          <span className="text-xs font-bold">{distribution.neutral}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs">Negative</span>
          </div>
          <span className="text-xs font-bold">{distribution.negative}%</span>
        </div>
      </div>

      {/* Comparison Badge */}
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-[10px] text-green-400">
          +12% more positive than similar content in your niche
        </p>
      </div>
    </motion.div>
  );
}

function ViralityScore() {
  const score = 72;
  const factors = [
    { text: "Strong emotional hooks", detail: "Joy peaks at 0:23, 2:15, 3:45", positive: true },
    { text: "Controversial topic", detail: "Generates discussion and debate", positive: true },
    { text: "Optimal video length", detail: "3:24 is ideal for retention", positive: true },
    { text: "Lacks clear call-to-action", detail: "CTA appears too late", positive: null },
    { text: "Low urgency signals", detail: "No time-sensitive content", positive: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-rose/10 flex items-center justify-center">
          🚀
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Virality Score</h3>
          <p className="text-white/40 text-[10px]">Predicted likelihood of content going viral</p>
        </div>
      </div>

      {/* Gauge */}
      <div className="relative w-32 h-16 mx-auto overflow-hidden my-4">
        <div className="absolute w-32 h-32 border-[12px] border-white/5 rounded-full" />
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: (score / 100) * 180 - 90 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 left-1/2 w-1 h-16 bg-aurora-cyan origin-bottom -translate-x-1/2 rounded-full"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-[#161616] border-2 border-aurora-cyan rounded-full" />
      </div>
      <div className="text-center mb-4">
        <span className="text-3xl font-black text-green-500">{score}</span>
        <span className="text-white/40">/100</span>
        <p className="text-xs text-green-400">High Potential</p>
      </div>

      {/* Factors */}
      <div className="space-y-2">
        {factors.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={f.positive === true ? "text-green-500" : f.positive === false ? "text-red-500" : "text-orange-500"}>
              {f.positive === true ? "✓" : f.positive === false ? "✗" : "⚠"}
            </span>
            <div>
              <p className="text-white/80">{f.text}</p>
              <p className="text-white/40 text-[10px]">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CTAAnalysis({ ctas }: { ctas: CTA[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-blue/10 flex items-center justify-center">
          <Target className="text-aurora-blue" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">CTA Analysis</h3>
          <p className="text-white/40 text-[10px]">Effectiveness of identified CTAs</p>
        </div>
      </div>

      <div className="space-y-3">
        {ctas.map((cta, i) => (
          <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40">{formatTime(cta.timestamp)}</span>
              <span className={`text-xs font-bold ${cta.strength >= 7 ? "text-green-500" : cta.strength >= 5 ? "text-orange-500" : "text-red-500"}`}>
                {cta.strength.toFixed(1)}/10
              </span>
            </div>
            <p className="text-sm text-white mb-2">"{cta.text}"</p>
            <div className="flex flex-wrap gap-1">
              {cta.factors.map((f, fi) => (
                <span key={fi} className={`text-[10px] px-2 py-0.5 rounded ${f.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {f.positive ? "✓" : "⚠"} {f.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className="mt-4 p-3 bg-aurora-cyan/10 border border-aurora-cyan/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/60">CTA Effectiveness</span>
          <span className="text-lg font-black text-aurora-cyan">7.5/10</span>
        </div>
        <div className="text-[10px] text-white/40 space-y-1">
          <p>✓ Multiple CTAs present</p>
          <p>✓ Urgency language used</p>
          <p>⚠ First CTA too early</p>
        </div>
      </div>
    </motion.div>
  );
}

function EngagementPrediction() {
  const predictions = [
    { time: 5, engagement: 95, label: "Strong Hook", type: "positive" },
    { time: 45, engagement: 82, label: null, type: null },
    { time: 90, engagement: 68, label: null, type: null },
    { time: 105, engagement: 52, label: "Drop-off Risk", type: "warning" },
    { time: 130, engagement: 71, label: "Recovery Point", type: "positive" },
    { time: 180, engagement: 65, label: null, type: null },
    { time: 204, engagement: 58, label: null, type: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-aurora-cyan/10 flex items-center justify-center">
          <Users className="text-aurora-cyan" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Predicted Audience Engagement</h2>
          <p className="text-white/40 text-xs">Expected viewer retention and drop-off analysis</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area */}
          <path
            d={`M 0 ${100 - predictions[0].engagement} ${predictions.map((p, i) => {
              const x = (i / (predictions.length - 1)) * 100;
              const y = 100 - p.engagement;
              return `L ${x} ${y}`;
            }).join(" ")} L 100 100 L 0 100 Z`}
            fill="url(#engagementGradient)"
          />
          
          {/* Line */}
          <path
            d={`M ${predictions.map((p, i) => {
              const x = (i / (predictions.length - 1)) * 100;
              const y = 100 - p.engagement;
              return `${i === 0 ? "" : "L "}${x} ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke="#00f2fe"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Points with labels */}
          {predictions.map((p, i) => {
            const x = (i / (predictions.length - 1)) * 100;
            const y = 100 - p.engagement;
            return p.label ? (
              <g key={i}>
                <circle cx={x} cy={y} r="0.8" fill={p.type === "positive" ? "#00E676" : "#FFA726"} vectorEffect="non-scaling-stroke" />
              </g>
            ) : null;
          })}
        </svg>

        {/* Annotations */}
        {predictions.filter(p => p.label).map((p, i) => {
          const idx = predictions.findIndex(pred => pred === p);
          const x = (idx / (predictions.length - 1)) * 100;
          return (
            <div
              key={i}
              className="absolute text-[10px] transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${x}%`, top: `${100 - p.engagement}%` }}
            >
              <div className={`px-2 py-1 rounded whitespace-nowrap ${p.type === "positive" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"}`}>
                {p.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-orange-500 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Critical Drop-off Zone: 1:30-2:00</p>
              <p className="text-[10px] text-white/40 mt-1">Predicted 34% viewer loss. Long explanation without visuals.</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-500 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Strong Hook Detected: 0:00-0:15</p>
              <p className="text-[10px] text-white/40 mt-1">Opening question captures attention. 92% retention.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ComparativeTrends() {
  const metrics = [
    { name: "Positive Sentiment", current: "65%", average: "58%", industry: "52%", change: "+12%", better: true },
    { name: "Engagement Score", current: "8.2/10", average: "7.4/10", industry: "6.8/10", change: "+11%", better: true },
    { name: "Bias Detection", current: "Low", average: "Medium", industry: "Medium", change: "Better", better: true },
    { name: "Claim Accuracy", current: "78%", average: "65%", industry: "60%", change: "+20%", better: true },
    { name: "Virality Score", current: "72/100", average: "65/100", industry: "58/100", change: "+11%", better: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-aurora-blue/10 flex items-center justify-center">
          <BarChart3 className="text-aurora-blue" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Performance Comparison</h2>
          <p className="text-white/40 text-xs">Compare with your past content and industry benchmarks</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 text-white/40 font-medium">Metric</th>
              <th className="text-center py-3 text-aurora-cyan font-medium">This Video</th>
              <th className="text-center py-3 text-white/40 font-medium">Your Avg</th>
              <th className="text-center py-3 text-white/40 font-medium">Industry</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-3 text-white/60">{m.name}</td>
                <td className="py-3 text-center">
                  <span className="font-bold text-white">{m.current}</span>
                  <span className={`block text-[10px] ${m.better ? "text-green-500" : "text-red-500"}`}>
                    {m.change} {m.better ? "↑" : "↓"}
                  </span>
                </td>
                <td className="py-3 text-center text-white/40">{m.average}</td>
                <td className="py-3 text-center text-white/40">{m.industry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trend Sparklines */}
      <div className="mt-6 space-y-2">
        <p className="text-[10px] text-white/40 uppercase tracking-wider">Performance Trend (Last 10 Videos)</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 w-24">Sentiment</span>
          <div className="flex items-end h-4 gap-[2px] flex-1">
            {[1, 3, 3, 4, 5, 5, 6, 7, 7, 8].map((v, i) => (
              <div key={i} className="flex-1 bg-green-500/60 rounded-sm" style={{ height: `${v * 10}%` }} />
            ))}
          </div>
          <span className="text-[10px] text-green-500">Improving ↑</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 w-24">Engagement</span>
          <div className="flex items-end h-4 gap-[2px] flex-1">
            {[3, 4, 4, 5, 5, 6, 6, 7, 7, 8].map((v, i) => (
              <div key={i} className="flex-1 bg-aurora-cyan/60 rounded-sm" style={{ height: `${v * 10}%` }} />
            ))}
          </div>
          <span className="text-[10px] text-aurora-cyan">Improving ↑</span>
        </div>
      </div>
    </motion.div>
  );
}

function AudienceSegments() {
  const segments = [
    {
      icon: "👔",
      name: "Professionals",
      positive: 78,
      neutral: 15,
      negative: 7,
      appeal: "High",
      why: ["Data-driven approach", "Professional tone", "Clear value prop"],
      tip: "Add more case studies",
    },
    {
      icon: "🎓",
      name: "Students",
      positive: 45,
      neutral: 35,
      negative: 20,
      appeal: "Medium",
      why: ["Relatable examples", "Modern presentation"],
      tip: "Use simpler language",
    },
    {
      icon: "👴",
      name: "Senior Citizens",
      positive: 32,
      neutral: 28,
      negative: 40,
      appeal: "Low",
      why: ["Clear visuals"],
      tip: "Slow down pacing",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Users className="text-purple-500" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Audience Segment Analysis</h2>
          <p className="text-white/40 text-xs">How different demographics might react to this content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-4 bg-white/[0.02] rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{seg.icon}</span>
              <span className="text-sm font-bold">{seg.name}</span>
            </div>

            {/* Sentiment Bars */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${seg.positive}%` }} />
                </div>
                <span className="text-[10px] text-green-500 w-8">{seg.positive}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full" style={{ width: `${seg.neutral}%` }} />
                </div>
                <span className="text-[10px] text-white/40 w-8">{seg.neutral}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${seg.negative}%` }} />
                </div>
                <span className="text-[10px] text-red-500 w-8">{seg.negative}%</span>
              </div>
            </div>

            <div className={`text-xs font-bold mb-2 ${seg.appeal === "High" ? "text-green-500" : seg.appeal === "Medium" ? "text-orange-500" : "text-red-500"}`}>
              Appeal: {seg.appeal}
            </div>

            <div className="text-[10px] text-white/40 space-y-1 mb-3">
              {seg.why.map((w, wi) => (
                <p key={wi}>• {w}</p>
              ))}
            </div>

            <div className="p-2 bg-aurora-cyan/10 rounded-lg text-[10px] text-aurora-cyan">
              💡 {seg.tip}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function LanguageComplexity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-blue/10 flex items-center justify-center">
          <BookOpen className="text-aurora-blue" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Language Complexity</h3>
          <p className="text-white/40 text-[10px]">Reading level and accessibility metrics</p>
        </div>
      </div>

      {/* Gauge */}
      <div className="text-center my-4">
        <div className="text-4xl font-black text-aurora-cyan">Grade 8</div>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-white/40">
          <span>Easy</span>
          <div className="w-24 h-2 bg-white/10 rounded-full">
            <div className="w-1/2 h-full bg-aurora-cyan rounded-full" />
          </div>
          <span>Hard</span>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-white/40">Flesch Reading Ease</span>
          <span className="font-bold">65/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Flesch-Kincaid Grade</span>
          <span className="font-bold">8.2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">SMOG Index</span>
          <span className="font-bold">7.8</span>
        </div>
      </div>

      <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-[10px] text-green-400">
        ✓ Accessibility: Good - Understandable by most audiences
      </div>
    </motion.div>
  );
}

function ShareableMoments() {
  const moments = [
    { time: "0:23-0:38", score: 9.2, reason: "Emotional peak (Joy)", platform: "Instagram Reels, TikTok" },
    { time: "2:10-2:30", score: 8.1, reason: "Controversial statement", platform: "Twitter, YouTube Shorts" },
    { time: "3:10-3:24", score: 7.5, reason: "Strong CTA moment", platform: "All platforms" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-aurora-rose/10 flex items-center justify-center">
          <Scissors className="text-aurora-rose" size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Shareable Moments</h3>
          <p className="text-white/40 text-[10px]">Best segments to clip for social media</p>
        </div>
      </div>

      <div className="space-y-3">
        {moments.map((m, i) => (
          <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">{m.time}</span>
              <span className="text-xs font-bold text-aurora-cyan">{m.score}/10 ★</span>
            </div>
            <p className="text-xs text-white/80 mb-1">✓ {m.reason}</p>
            <p className="text-[10px] text-white/40">Best for: {m.platform}</p>
            <button className="mt-2 text-[10px] px-3 py-1.5 bg-aurora-cyan/10 text-aurora-cyan rounded-lg hover:bg-aurora-cyan/20 transition-colors">
              Export Clip
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TrendForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          🔮
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Performance Forecast</h3>
          <p className="text-white/40 text-[10px]">Predicted metrics based on trends</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-white/[0.02] rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Views (7 days)</span>
            <span className="text-xs text-aurora-cyan">78% confidence</span>
          </div>
          <div className="text-xl font-black">15,000</div>
          <div className="text-[10px] text-white/40">Range: 12K - 18K</div>
        </div>

        <div className="p-3 bg-white/[0.02] rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Engagement Rate</span>
            <span className="text-xs text-aurora-cyan">72% confidence</span>
          </div>
          <div className="text-xl font-black">5.2%</div>
          <div className="text-[10px] text-white/40">Range: 4.2% - 5.8%</div>
        </div>

        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-xs text-green-400">
            📈 Sentiment Trend: +2% improvement expected
          </p>
          <p className="text-[10px] text-white/40 mt-1">Based on positive comments trend</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40">
        <p className="font-medium mb-1">Analysis based on:</p>
        <p>• 47 similar videos analyzed</p>
        <p>• Your historical performance</p>
        <p>• Current trending topics</p>
      </div>
    </motion.div>
  );
}

// Main Component
export default function TrendAnalysisPage() {
  const { input, isInputValid } = useAnalysis();
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, we'll show the page even without input
  const showContent = true; // In production: isInputValid

  if (!showContent && !isInputValid) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md"
        >
          <BarChart3 className="mx-auto mb-4 text-aurora-rose" size={48} />
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">
            No Content Analyzed
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Upload content on the Pulse page to see trend analysis here.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/20 transition-all"
          >
            <ArrowLeft size={16} />
            Go to Pulse Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Pulse
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-aurora-cyan" size={28} />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Trend <span className="aurora-text">Analysis</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            Temporal insights, pattern recognition, and predictive analytics
          </p>
        </motion.header>

        {/* Section 1: Hero Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Overall Trend"
            value="Positive"
            change="+12%"
            positive={true}
          />
          <StatCard
            icon={<Target size={20} />}
            label="Engagement"
            value="8.2/10"
            change="+0.8"
            positive={true}
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Virality"
            value="72/100"
            change="+5"
            positive={true}
          />
          <StatCard
            icon={<RefreshCw size={20} />}
            label="Topics"
            value="7"
            change="+2"
            positive={true}
          />
        </div>

        {/* Section 2: Sentiment Timeline */}
        <SentimentTimeline data={mockTimeline} keyMoments={mockKeyMoments} />

        {/* Section 3: Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - 60% */}
          <div className="lg:col-span-3 space-y-6">
            <EmotionHeatmap emotions={mockEmotions} />
            <TopicFlow topics={mockTopics} />
            <PacingAnalysis />
            <AnomalyDetection anomalies={mockAnomalies} />
          </div>

          {/* Right Column - 40% */}
          <div className="lg:col-span-2 space-y-6">
            <TrendingKeywords keywords={mockKeywords} />
            <SentimentDistribution />
            <ViralityScore />
            <CTAAnalysis ctas={mockCTAs} />
          </div>
        </div>

        {/* Section 4: Full-Width Components */}
        <EngagementPrediction />
        <ComparativeTrends />
        <AudienceSegments />

        {/* Section 5: Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LanguageComplexity />
          <ShareableMoments />
          <TrendForecast />
        </div>

        {/* Section 6: Export & Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 py-8"
        >
          <button className="flex items-center gap-2 px-6 py-3 border border-aurora-cyan/30 text-aurora-cyan rounded-full text-xs font-black uppercase tracking-widest hover:bg-aurora-cyan hover:text-black transition-all">
            <FileText size={16} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-aurora-cyan/30 text-aurora-cyan rounded-full text-xs font-black uppercase tracking-widest hover:bg-aurora-cyan hover:text-black transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-aurora-cyan/30 text-aurora-cyan rounded-full text-xs font-black uppercase tracking-widest hover:bg-aurora-cyan hover:text-black transition-all">
            <Share2 size={16} /> Share Insights
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Settings size={16} /> Customize Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <RefreshCw size={16} /> Reanalyze
          </button>
        </motion.div>
      </div>
    </div>
  );
}