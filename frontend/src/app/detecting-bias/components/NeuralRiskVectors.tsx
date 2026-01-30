import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { EMOTION_DISTRIBUTION } from "../constants/bias-data";
import { RiskVector } from "./RiskVector";

export function NeuralRiskVectors() {
    return (
        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <Activity size={18} className="text-aurora-blue" /> Neural Risk Vectors
                </h3>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sentiment Bias Scopes</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <RiskVector label="Negative Skew" value="High" color="blue" percent={46} />
                <RiskVector label="Neutrality" value="Low" color="white" percent={34} />
                <RiskVector label="Positive Lean" value="Med" color="cyan" percent={20} />
            </div>

            <div className="space-y-6">
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                    {EMOTION_DISTRIBUTION.map((e, i) => (
                        <motion.div
                            key={i}
                            className={e.color}
                            style={{ width: `${e.value}%` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                    ))}
                </div>
                <div className="p-4 bg-aurora-blue/5 border border-aurora-blue/10 rounded-2xl">
                    <p className="text-xs font-medium text-white/70 italic leading-relaxed">
                        Negative risk vectors account for <span className="text-aurora-blue font-black">46%</span> of detected signals. Neutrality remains constrained.
                    </p>
                </div>
            </div>
        </div>
    );
}
