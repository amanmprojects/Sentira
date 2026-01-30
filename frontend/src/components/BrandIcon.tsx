"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface BrandIconProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export default function BrandIcon({ size = "md", className = "" }: BrandIconProps) {
    const containerSizes = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-20 h-20",
    };

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 24,
        xl: 36,
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
            }}
            transition={{
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                default: { duration: 0.5 }
            }}
            className={`relative group cursor-pointer ${className}`}
        >
            {/* Dynamic Glow Layer */}
            <div className="absolute inset-0 bg-aurora-cyan/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 group-hover:bg-aurora-rose/20 transition-all duration-700"></div>

            {/* Outer Rotating Ring (Decorative) */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/5 rounded-2xl group-hover:border-aurora-cyan/20 transition-colors"
            />

            {/* Main Icon Container */}
            <div className={`${containerSizes[size]} bg-black rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group-hover:border-aurora-cyan/40 transition-all duration-500`}>
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 bg-gradient-to-tr from-aurora-cyan/5 via-transparent to-aurora-rose/5 opacity-40"></div>

                {/* Floating Particles inside */}
                <motion.div
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scale: [0.8, 1.1, 0.8],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1 right-1 w-1 h-1 bg-aurora-cyan rounded-full blur-[1px]"
                />

                {/* The Core Icon */}
                <Zap
                    className="text-aurora-cyan group-hover:text-white transition-colors duration-500 relative z-10"
                    size={iconSizes[size]}
                    fill="currentColor"
                    fillOpacity={0.1}
                />

                {/* Shine Effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000"></div>
            </div>

            {/* Orbiting Satellite (Small Dot) */}
            <motion.div
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute inset-0 p-1 pointer-events-none"
            >
                <div className="w-1.5 h-1.5 bg-aurora-rose rounded-full shadow-[0_0_10px_#ff0080]" />
            </motion.div>
        </motion.div>
    );
}