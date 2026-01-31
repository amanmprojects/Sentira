import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { RiskVector } from "./RiskVector";
import { RiskVectors as RiskVectorsType } from "@/lib/api";

interface NeuralRiskVectorsProps {
    riskVectors?: RiskVectorsType;
}

export function NeuralRiskVectors({ riskVectors }: NeuralRiskVectorsProps) {
    // Default values if data not present
    const negative = riskVectors?.negative_skew ?? 0;
    const neutral = riskVectors?.neutrality ?? 0;
    const positive = riskVectors?.positive_lean ?? 0;

    return (
        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <Activity size={18} className="text-aurora-blue" /> Neural Risk Vectors
                </h3>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sentiment Bias Scopes</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <RiskVector label="Negative Skew" value={negative > 50 ? "High" : negative > 20 ? "Med" : "Low"} color="blue" percent={negative} />
                <RiskVector label="Neutrality" value={neutral > 50 ? "High" : "Low"} color="white" percent={neutral} />
                <RiskVector label="Positive Lean" value={positive > 50 ? "High" : "Low"} color="cyan" percent={positive} />
            </div>

            <div className="space-y-6">
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                    {/* Visual bar distribution */}
                    <div className="bg-aurora-blue" style={{ width: `${negative}%` }} />
                    <div className="bg-white/20" style={{ width: `${neutral}%` }} />
                    <div className="bg-aurora-cyan" style={{ width: `${positive}%` }} />
                </div>
                <div className="p-4 bg-aurora-blue/5 border border-aurora-blue/10 rounded-2xl">
                    <p className="text-xs font-medium text-white/70 italic leading-relaxed">
                        Negative risk vectors account for <span className="text-aurora-blue font-black">{Math.round(negative)}%</span> of detected signals.
                    </p>
                </div>
            </div>
        </div>
    );
}
