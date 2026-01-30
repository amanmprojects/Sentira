"use client";

import { motion } from "framer-motion";
import { Scale, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAnalysis } from "@/context/AnalysisContext";

export default function DetectingBiasPage() {
    const { input, isInputValid } = useAnalysis();

    if (!isInputValid) {
        return (
            <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-12 rounded-[2.5rem] cyber-glass border border-white/5 max-w-md"
                >
                    <AlertCircle className="mx-auto mb-4 text-aurora-rose" size={48} />
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        No Input Provided
                    </h2>
                    <p className="text-white/40 text-sm mb-6">
                        Please return to Pulse and provide content to analyze.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/20 transition-all"
                    >
                        <ArrowLeft size={16} />
                        Return to Pulse
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Pulse
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Scale className="text-aurora-rose" size={24} />
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            Detecting <span className="aurora-text">Bias</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm">
                        Identify potential bias and problematic patterns in your {input.modality} content
                    </p>
                </motion.header>

                {/* Input Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl cyber-glass border border-white/5"
                >
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                        Analyzing Input
                    </h3>
                    <p className="text-white/80 font-medium truncate">
                        {input.content}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-aurora-rose/10 text-aurora-rose text-[10px] font-black uppercase tracking-widest">
                        {input.modality}
                    </span>
                </motion.div>

                {/* Analysis Results Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-aurora-rose/10 flex items-center justify-center">
                        <Scale className="text-aurora-rose" size={32} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        Bias Detection In Progress
                    </h2>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Bias detection results will appear here. Connect your backend API to process the content.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
