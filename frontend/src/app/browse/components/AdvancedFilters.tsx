import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdvancedFilters({ isOpen, onClose }: AdvancedFiltersProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                                Advanced Filters
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Date Range */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                                    Date Range
                                </label>
                                <div className="space-y-2">
                                    {["Last 24 hours", "Last week", "Last month", "Custom"].map(
                                        (option) => (
                                            <label
                                                key={option}
                                                className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="dateRange"
                                                    className="accent-aurora-cyan"
                                                />
                                                {option}
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Content Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                                    Content Type
                                </label>
                                <div className="space-y-2">
                                    {["Videos", "Images", "Text Posts"].map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="accent-aurora-cyan"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                                    Sort By
                                </label>
                                <div className="space-y-2">
                                    {["Relevance", "Most Recent", "Most Popular"].map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="sortBy"
                                                defaultChecked={option === "Relevance"}
                                                className="accent-aurora-cyan"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <button className="px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all">
                                Clear All
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-aurora-cyan text-black text-sm font-bold hover:bg-aurora-cyan/90 transition-all">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
