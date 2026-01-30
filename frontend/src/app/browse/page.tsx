"use client";

import { motion } from "framer-motion";
import { Compass, Search } from "lucide-react";

export default function BrowsePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Compass className="text-aurora-cyan" size={24} />
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            <span className="aurora-text">Browse</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm">
                        Content library and history
                    </p>
                </motion.header>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search analyzed content..."
                        className="w-full px-14 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/10 transition-all font-medium"
                    />
                </motion.div>

                {/* Content Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-aurora-cyan/10 flex items-center justify-center">
                        <Compass className="text-aurora-cyan" size={32} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                        Browse Content
                    </h2>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Your analyzed content library will appear here. Start analyzing content from Pulse to populate this library.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
