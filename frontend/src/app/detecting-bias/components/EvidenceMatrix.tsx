import { Eye, Info } from "lucide-react";
import { EvidenceLine } from "./EvidenceLine";
import { EvidenceMetric } from "@/lib/api";

interface EvidenceMatrixProps {
    metrics?: EvidenceMetric[];
}

export function EvidenceMatrix({ metrics = [] }: EvidenceMatrixProps) {
    return (
        <div className="bg-[#050505]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
                <Eye size={18} className="text-aurora-cyan" /> Evidence Matrix
            </h3>
            <div className="space-y-6 text-white/60 font-display">
                {metrics.length > 0 ? metrics.map((m, i) => (
                    <EvidenceLine key={i} label={m.label} value={m.value} />
                )) : (
                    <p className="text-xs text-white/30 italic">No specific evidence metrics gathered.</p>
                )}

                <div className="pt-4 flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <Info size={16} className="text-white/40" />
                    <p className="text-[10px] font-medium text-white/20 leading-relaxed uppercase tracking-tight">
                        Assessment calibrated against high-level narrative pattern archives.
                    </p>
                </div>
            </div>
        </div>
    );
}
