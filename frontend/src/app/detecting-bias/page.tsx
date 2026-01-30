"use client";

import { useAnalysis } from "@/context/AnalysisContext";
import { ShieldCheck } from "lucide-react";

export default function DetectingBiasPage() {
    const { modality } = useAnalysis();

    return (
        <div className="min-h-screen bg-[#050505] text-white p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 text-aurora-rose text-[10px] font-black uppercase tracking-[0.4em]">
                        <ShieldCheck size={14} /> Integrity Shield
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Detecting <span className="aurora-text text-aurora-rose">Bias</span></h1>
                </header>

                <div className="p-12 rounded-[3rem] cyber-glass border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                        <ShieldCheck size={32} className="text-aurora-rose" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white/80">Bias Recognition Active</h3>
                    <p className="text-white/40 max-w-md">The system is ready to evaluate your {modality} input for manipulative patterns, framing bias, and cherry-picked information.</p>
                </div>
            </div>
        </div>
    );
}
