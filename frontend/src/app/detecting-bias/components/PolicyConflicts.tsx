import { Scale } from "lucide-react";
import { PROTOCOL_CONFLICTS } from "../constants/bias-data";

export function PolicyConflicts() {
    return (
        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <Scale size={18} className="text-aurora-blue" /> Policy Conflicts
            </h3>
            <div className="space-y-4">
                {PROTOCOL_CONFLICTS.map((p, i) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{p.category}</span>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-aurora-blue/20 text-aurora-blue uppercase">{p.level}</span>
                        </div>
                        <p className="text-[11px] font-medium text-white/40 italic leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
