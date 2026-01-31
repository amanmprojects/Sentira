import { motion } from "framer-motion";
import { Check, SlidersHorizontal } from "lucide-react";
import { Platform } from "../types";
import { PLATFORMS } from "../data/platforms";

interface PlatformFiltersProps {
    selectedPlatform: Platform;
    onPlatformChange: (platform: Platform) => void;
    onToggleFilters: () => void;
    showFilters: boolean;
}

export function PlatformFilters({
    selectedPlatform,
    onPlatformChange,
    onToggleFilters,
    showFilters,
}: PlatformFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {PLATFORMS.map((platform) => {
                const isActive = selectedPlatform === platform.id;
                return (
                    <motion.button
                        key={platform.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPlatformChange(platform.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${
                            isActive
                                ? "bg-aurora-cyan text-black border-aurora-cyan font-bold"
                                : "bg-transparent border-white/10 text-white/60 hover:border-aurora-cyan/50 hover:text-white"
                        }`}
                    >
                        <span
                            style={{
                                color: isActive ? "#050505" : platform.color,
                            }}
                        >
                            {platform.icon}
                        </span>
                        <span className="text-sm font-semibold">{platform.label}</span>
                        {isActive && <Check size={14} />}
                    </motion.button>
                );
            })}

            <button
                onClick={onToggleFilters}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                    showFilters
                        ? "border-aurora-cyan/50 text-aurora-cyan"
                        : "border-white/10 text-white/40 hover:text-white/60"
                }`}
            >
                <SlidersHorizontal size={14} />
                <span className="text-sm font-medium">Advanced Filters</span>
            </button>
        </div>
    );
}
