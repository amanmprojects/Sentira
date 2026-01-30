"use client";

import { motion } from "framer-motion";

interface SentimentGaugeProps {
    score: number; // -1 to 1
    label: string;
}

export default function SentimentGauge({ score, label }: SentimentGaugeProps) {
    // Map -1..1 to 0..100 for the rotation
    const percentage = ((score + 1) / 2) * 100;
    const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-32 overflow-hidden">
                {/* Gauge Background */}
                <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-white/5 rounded-full"></div>

                {/* Gauge Gradient */}
                <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-transparent rounded-full bg-gradient-to-r from-brand-secondary via-yellow-400 to-green-500 [mask-image:linear-gradient(to_bottom,black_50%,transparent_50%)]"></div>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute bottom-0 left-1/2 w-1.5 h-32 bg-white origin-bottom -translate-x-1/2 rounded-full z-10 shadow-lg"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                </motion.div>

                {/* Center Point */}
                <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-6 h-6 bg-[#020617] border-4 border-white rounded-full z-20"></div>
            </div>

            <div className="text-center">
                <h3 className="text-4xl font-black mb-1">
                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                </h3>
                <p className="text-xl font-bold uppercase tracking-widest text-white/40">{label}</p>
            </div>
        </div>
    );
}
