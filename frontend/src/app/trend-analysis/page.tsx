"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function TrendAnalysisPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-aurora-cyan" size={24} />
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            Trend <span className="aurora-text">Analysis</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm">
                        Pattern recognition and temporal insights
                    </p>
                </motion.header>

                {/* Content Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-aurora-cyan/10 flex items-center justify-center">
                        <TrendingUp className="text-aurora-cyan" size={32} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        Trend Analysis
                    </h2>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Explore trending topics and patterns across analyzed content. Connect to your data source to view insights.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
