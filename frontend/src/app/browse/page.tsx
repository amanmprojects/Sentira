"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Grid3X3,
    List,
    ChevronLeft,
    ChevronRight,
    X,
    Eye,
    AlertCircle,
    BarChart3,
    FolderPlus,
} from "lucide-react";
import { Platform } from "./types";
import { MOCK_RESULTS } from "./data/mockResults";
import { SearchHeader } from "./components/SearchHeader";
import { PlatformFilters } from "./components/PlatformFilters";
import { AdvancedFilters } from "./components/AdvancedFilters";
import { ResultCard } from "./components/ResultCard";
import { PreviewPanel } from "./components/PreviewPanel";

export default function BrowsePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedResult, setSelectedResult] = useState<(typeof MOCK_RESULTS)[0] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredResults = useMemo(() => {
        if (selectedPlatform === "all") return MOCK_RESULTS;
        return MOCK_RESULTS.filter((r) => r.platform === selectedPlatform);
    }, [selectedPlatform]);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const toggleItemSelection = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        <span className="aurora-text">Browse</span>
                    </h1>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <SearchHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSearch={handleSearch}
                        onKeyPress={handleKeyPress}
                    />

                    <PlatformFilters
                        selectedPlatform={selectedPlatform}
                        onPlatformChange={setSelectedPlatform}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        showFilters={showFilters}
                    />

                    <AdvancedFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                        {hasSearched && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-between"
                            >
                                <span className="text-white/50 text-sm">
                                    {isLoading
                                        ? "Searching..."
                                        : `${filteredResults.length} results found`}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-all ${
                                            viewMode === "grid"
                                                ? "bg-aurora-cyan/20 text-aurora-cyan"
                                                : "text-white/40 hover:text-white/60"
                                        }`}
                                    >
                                        <Grid3X3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-all ${
                                            viewMode === "list"
                                                ? "bg-aurora-cyan/20 text-aurora-cyan"
                                                : "text-white/40 hover:text-white/60"
                                        }`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {isLoading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
                                    >
                                        <div className="h-40 bg-white/5 rounded-xl mb-4" />
                                        <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasSearched && !isLoading && filteredResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={
                                    viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-3"
                                }
                            >
                                {filteredResults.map((result, index) => (
                                    <ResultCard
                                        key={result.id}
                                        result={result}
                                        viewMode={viewMode}
                                        isSelected={selectedResult?.id === result.id}
                                        isChecked={selectedItems.includes(result.id)}
                                        onSelect={() => setSelectedResult(result)}
                                        onToggleCheck={() => toggleItemSelection(result.id)}
                                        index={index}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {hasSearched && !isLoading && filteredResults.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-12 rounded-[2.5rem] cyber-glass border border-white/5 text-center"
                            >
                                <AlertCircle className="mx-auto mb-4 text-white/20" size={48} />
                                <h2 className="text-xl font-black uppercase tracking-tight mb-2">
                                    No Results Found
                                </h2>
                                <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
                                    We couldn&apos;t find any content matching your search.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setSelectedPlatform("all")}
                                        className="px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="px-4 py-2 rounded-xl bg-aurora-cyan text-black text-sm font-bold hover:bg-aurora-cyan/90 transition-all"
                                    >
                                        Try New Search
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {hasSearched && !isLoading && filteredResults.length > 0 && (
                            <div className="flex items-center justify-center gap-2 pt-6">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                {[1, 2, 3].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                            currentPage === page
                                                ? "bg-aurora-cyan text-black"
                                                : "border border-white/10 text-white/60 hover:bg-white/5"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-6">
                            <AnimatePresence mode="wait">
                                {selectedResult ? (
                                    <PreviewPanel
                                        result={selectedResult}
                                        onClose={() => setSelectedResult(null)}
                                    />
                                ) : (
                                    hasSearched &&
                                    !isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center"
                                        >
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Eye className="text-white/20" size={28} />
                                            </div>
                                            <p className="text-white/40 text-sm">
                                                Select a result to preview details
                                            </p>
                                        </motion.div>
                                    )
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                        >
                            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0a0a0a] border border-aurora-cyan/30 shadow-[0_0_40px_rgba(0,242,254,0.15)]">
                                <span className="text-sm font-bold text-white">
                                    ✓ {selectedItems.length} items selected
                                </span>
                                <div className="w-px h-6 bg-white/10" />
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-cyan text-black text-sm font-bold hover:bg-aurora-cyan/90 transition-all">
                                    <BarChart3 size={16} />
                                    Analyze All
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all">
                                    <FolderPlus size={16} />
                                    Add to Report
                                </button>
                                <button
                                    onClick={() => setSelectedItems([])}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
