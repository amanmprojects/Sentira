"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Search,
    CheckCircle,
    AlertCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Download,
    Share2,
    FileText,
    BarChart3,
    AlertTriangle,
    BookOpen,
    Beaker,
    Clock,
    RefreshCw,
} from "lucide-react";

// Types
interface Claim {
    id: number;
    text: string;
    timestamp: string;
    status: "verified" | "unverified" | "disputed";
    confidence: number;
    sources: string[];
    evidenceDetails?: {
        fullSources: { name: string; url: string }[];
        dataPoints: string[];
        methodology: string;
        conflicts?: string[];
    };
}

interface Source {
    name: string;
    url: string;
    verificationDate: string;
    credibility: "high" | "medium" | "low";
    additionalInfo?: string;
}

interface VagueLanguage {
    phrase: string;
    timestamp: string;
    issue: string;
    suggestion: string;
}

interface FactCheckData {
    filename: string;
    duration: string;
    overallFactuality: number;
    claimDensity: {
        value: number;
        label: "Low" | "Medium" | "High";
        unit: string;
    };
    unverifiedClaims: number;
    confidenceIndex: number;
    claims: Claim[];
    sources: Source[];
    statisticalData: { point: string; status: "verified" | "partial" | "contradicts" }[];
    vagueLanguage: VagueLanguage[];
    methodology: string[];
}

interface FactCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: FactCheckData;
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

type TabId = "overview" | "claims" | "evidence";

// Mock data for demonstration
const mockData: FactCheckData = {
    filename: "instagram_reel.mp4",
    duration: "0:45",
    overallFactuality: 78,
    claimDensity: { value: 2, label: "Low", unit: "claims/min" },
    unverifiedClaims: 1,
    confidenceIndex: 85,
    claims: [
        {
            id: 1,
            text: "This product is 100% organic certified",
            timestamp: "0:23",
            status: "verified",
            confidence: 92,
            sources: ["USDA Organic Database", "Product Label"],
            evidenceDetails: {
                fullSources: [
                    { name: "USDA Organic Database", url: "https://organic.usda.gov" },
                    { name: "Product Certification", url: "https://example.com/cert" },
                ],
                dataPoints: ["Certificate ID: ORG-2024-1234", "Valid until: Dec 2026"],
                methodology: "Cross-referenced with federal certification database",
            },
        },
        {
            id: 2,
            text: "Our customers report 95% satisfaction rate",
            timestamp: "0:34",
            status: "unverified",
            confidence: 45,
            sources: ["No independent source found"],
            evidenceDetails: {
                fullSources: [],
                dataPoints: ["Claim made without cited source"],
                methodology: "Unable to verify through independent channels",
            },
        },
        {
            id: 3,
            text: "This ingredient has been banned in 5 countries",
            timestamp: "1:02",
            status: "disputed",
            confidence: 30,
            sources: ["Conflicting data found"],
            evidenceDetails: {
                fullSources: [
                    { name: "FDA Database", url: "https://fda.gov" },
                    { name: "EU Food Safety", url: "https://efsa.europa.eu" },
                ],
                dataPoints: ["Ingredient is restricted, not banned", "Only 2 countries have restrictions"],
                methodology: "Verified against international regulatory databases",
                conflicts: ["Manufacturer claims vs regulatory records"],
            },
        },
    ],
    sources: [
        { name: "USDA Organic Certification Database", url: "organic.usda.gov", verificationDate: "Jan 30, 2026", credibility: "high" },
        { name: "Amazon Customer Reviews", url: "amazon.com/reviews", verificationDate: "Jan 30, 2026", credibility: "medium", additionalInfo: "Sample size: 1,247 reviews" },
        { name: "FDA Product Registration", url: "fda.gov/registration", verificationDate: "Jan 29, 2026", credibility: "high" },
    ],
    statisticalData: [
        { point: "Customer satisfaction: 4.2/5 (1,247 reviews)", status: "verified" },
        { point: "Organic certification: Active since 2024", status: "verified" },
        { point: "Ingredient composition: Matches label claims", status: "verified" },
        { point: "Price comparison: Average market range", status: "partial" },
    ],
    vagueLanguage: [
        { phrase: "Better than competitors", timestamp: "0:34", issue: "Subjective claim, no defined baseline", suggestion: "Specify metric and comparison" },
        { phrase: "Premium quality", timestamp: "1:12", issue: "Undefined quality metric", suggestion: "Use specific quality indicators" },
    ],
    methodology: [
        "Claim extraction: NLP pattern recognition",
        "Evidence gathering: 12 trusted databases queried",
        "Cross-referencing: 3+ independent sources required",
        "Confidence calculation: Source credibility weighted",
    ],
};

export default function FactCheckModal({
    isOpen,
    onClose,
    data = mockData,
    isLoading = false,
    error = null,
    onRetry,
}: FactCheckModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [expandedClaims, setExpandedClaims] = useState<Set<number>>(new Set());

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const toggleClaimExpand = useCallback((claimId: number) => {
        setExpandedClaims((prev) => {
            const next = new Set(prev);
            if (next.has(claimId)) {
                next.delete(claimId);
            } else {
                next.add(claimId);
            }
            return next;
        });
    }, []);

    const tabs: { id: TabId; label: string; count?: number }[] = [
        { id: "overview", label: "Overview" },
        { id: "claims", label: "Claims", count: data?.claims.length },
        { id: "evidence", label: "Evidence" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[850px] max-h-[80vh] md:max-h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <ModalHeader
                            filename={data?.filename}
                            duration={data?.duration}
                            onClose={onClose}
                        />

                        {/* Tab Navigation */}
                        <TabNavigation
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-none p-6">
                            {isLoading ? (
                                <LoadingState />
                            ) : error ? (
                                <ErrorState error={error} onRetry={onRetry} />
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {activeTab === "overview" && <OverviewTab data={data} />}
                                        {activeTab === "claims" && (
                                            <ClaimsTab
                                                claims={data.claims}
                                                expandedClaims={expandedClaims}
                                                onToggleExpand={toggleClaimExpand}
                                            />
                                        )}
                                        {activeTab === "evidence" && <EvidenceTab data={data} />}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer */}
                        {!isLoading && !error && <ModalFooter />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Header Component
function ModalHeader({
    filename,
    duration,
    onClose,
}: {
    filename?: string;
    duration?: string;
    onClose: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-aurora-cyan/10">
                    <Search className="w-5 h-5 text-aurora-cyan" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Fact Checking Results</h2>
                    <p className="text-sm text-white/40">
                        Analyzed: {filename} • Duration: {duration}
                    </p>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-aurora-cyan transition-colors"
            >
                <X size={20} />
            </motion.button>
        </div>
    );
}

// Tab Navigation Component
function TabNavigation({
    tabs,
    activeTab,
    onTabChange,
}: {
    tabs: { id: TabId; label: string; count?: number }[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}) {
    return (
        <div className="flex gap-1 px-6 py-3 border-b border-white/10 bg-white/[0.02]">
            {tabs.map((tab) => (
                <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        activeTab === tab.id
                            ? "text-white"
                            : "text-white/40 hover:text-white/70"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === tab.id
                                ? "bg-aurora-cyan/20 text-aurora-cyan"
                                : "bg-white/10 text-white/40"
                        }`}>
                            {tab.count}
                        </span>
                    )}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-aurora-cyan rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.button>
            ))}
        </div>
    );
}

// Overview Tab Component
function OverviewTab({ data }: { data: FactCheckData }) {
    const getFactualityColor = (value: number) => {
        if (value >= 80) return "text-emerald-400";
        if (value >= 60) return "text-aurora-cyan";
        if (value >= 40) return "text-orange-400";
        return "text-red-400";
    };

    const getFactualityBgColor = (value: number) => {
        if (value >= 80) return "bg-emerald-400";
        if (value >= 60) return "bg-aurora-cyan";
        if (value >= 40) return "bg-orange-400";
        return "bg-red-400";
    };

    const getConfidenceLabel = (value: number) => {
        if (value >= 80) return "High Confidence";
        if (value >= 60) return "Medium Confidence";
        return "Low Confidence";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Factuality */}
            <MetricCard
                title="Overall Factuality"
                icon={<CheckCircle size={18} />}
            >
                <div className="mt-4">
                    <span className={`text-4xl font-black ${getFactualityColor(data.overallFactuality)}`}>
                        {data.overallFactuality}%
                    </span>
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.overallFactuality}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className={`h-full rounded-full ${getFactualityBgColor(data.overallFactuality)}`}
                        />
                    </div>
                    <p className="mt-2 text-xs text-white/40">Factually accurate content</p>
                </div>
            </MetricCard>

            {/* Claim Density */}
            <MetricCard
                title="Claim Density"
                icon={<BarChart3 size={18} />}
            >
                <div className="mt-4">
                    <span className={`text-lg font-bold ${
                        data.claimDensity.label === "Low" ? "text-emerald-400" :
                        data.claimDensity.label === "Medium" ? "text-aurora-cyan" : "text-orange-400"
                    }`}>
                        {data.claimDensity.label}
                    </span>
                    <p className="text-3xl font-black text-white mt-1">
                        {data.claimDensity.value} <span className="text-sm text-white/40 font-normal">{data.claimDensity.unit}</span>
                    </p>
                    <p className="mt-2 text-xs text-white/40">Factual claims detected per minute</p>
                </div>
            </MetricCard>

            {/* Unverified Claims */}
            <MetricCard
                title="Unverified Claims"
                icon={<AlertTriangle size={18} />}
            >
                <div className="mt-4">
                    <span className={`text-4xl font-black ${
                        data.unverifiedClaims > 0 ? "text-orange-400" : "text-emerald-400"
                    }`}>
                        {data.unverifiedClaims}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                        {data.unverifiedClaims > 0 ? (
                            <>
                                <AlertCircle size={14} className="text-orange-400" />
                                <span className="text-xs text-orange-400">Needs review</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={14} className="text-emerald-400" />
                                <span className="text-xs text-emerald-400">All verified</span>
                            </>
                        )}
                    </div>
                </div>
            </MetricCard>

            {/* Confidence Index */}
            <MetricCard
                title="Confidence Index"
                icon={<Beaker size={18} />}
            >
                <div className="mt-4">
                    <div className="relative w-24 h-24 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                                fill="none"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 251.2" }}
                                animate={{ strokeDasharray: `${(data.confidenceIndex / 100) * 251.2} 251.2` }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00f2fe" />
                                    <stop offset="100%" stopColor="#4facfe" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-white">{data.confidenceIndex}%</span>
                        </div>
                    </div>
                    <p className="text-center mt-2 text-sm text-aurora-cyan font-medium">
                        {getConfidenceLabel(data.confidenceIndex)}
                    </p>
                </div>
            </MetricCard>
        </div>
    );
}

// Metric Card Component
function MetricCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 transition-colors"
        >
            <div className="flex items-center gap-2 text-white/60">
                {icon}
                <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
            </div>
            {children}
        </motion.div>
    );
}

// Claims Tab Component
function ClaimsTab({
    claims,
    expandedClaims,
    onToggleExpand,
}: {
    claims: Claim[];
    expandedClaims: Set<number>;
    onToggleExpand: (id: number) => void;
}) {
    if (claims.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle size={48} className="text-emerald-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Claims Detected</h3>
                <p className="text-white/40 text-sm max-w-md">
                    This content appears to be opinion-based or narrative without specific factual claims.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {claims.map((claim) => (
                <ClaimCard
                    key={claim.id}
                    claim={claim}
                    isExpanded={expandedClaims.has(claim.id)}
                    onToggleExpand={() => onToggleExpand(claim.id)}
                />
            ))}
        </div>
    );
}

// Claim Card Component
function ClaimCard({
    claim,
    isExpanded,
    onToggleExpand,
}: {
    claim: Claim;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    const statusConfig = {
        verified: {
            color: "border-l-emerald-400",
            badge: "bg-emerald-400/10 text-emerald-400",
            icon: <CheckCircle size={14} />,
            label: "Verified",
        },
        unverified: {
            color: "border-l-white/30",
            badge: "bg-white/10 text-white/60",
            icon: <AlertCircle size={14} />,
            label: "Unverified",
        },
        disputed: {
            color: "border-l-red-400",
            badge: "bg-red-400/10 text-red-400",
            icon: <XCircle size={14} />,
            label: "Disputed",
        },
    };

    const config = statusConfig[claim.status];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/[0.03] border border-white/10 border-l-4 ${config.color} rounded-xl overflow-hidden`}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white/40">Claim #{claim.id}</span>
                    <button className="flex items-center gap-1 text-xs text-aurora-cyan hover:text-aurora-cyan/80 transition-colors">
                        <Clock size={12} />
                        {claim.timestamp}
                    </button>
                </div>

                {/* Claim Text */}
                <p className="text-white font-medium mb-4">"{claim.text}"</p>

                {/* Status & Info */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                        {config.icon}
                        {config.label}
                    </span>
                    <span className="text-xs text-white/40">
                        Confidence: {claim.confidence}%
                    </span>
                </div>

                {/* Sources Preview */}
                <p className="text-xs text-white/50">
                    Sources: {claim.sources.slice(0, 2).join(", ")}
                    {claim.sources.length > 2 && ` and ${claim.sources.length - 2} more`}
                </p>

                {/* Expand Button */}
                <motion.button
                    onClick={onToggleExpand}
                    className="flex items-center gap-1 mt-4 text-xs text-aurora-cyan hover:text-aurora-cyan/80 transition-colors"
                    whileHover={{ x: 2 }}
                >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? "Hide Evidence Details" : "View Evidence Details"}
                </motion.button>
            </div>

            {/* Expanded Evidence */}
            <AnimatePresence>
                {isExpanded && claim.evidenceDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="border-t border-white/10 bg-white/[0.02]"
                    >
                        <div className="p-5 space-y-4">
                            {/* Full Sources */}
                            {claim.evidenceDetails.fullSources.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Sources</h4>
                                    <ul className="space-y-2">
                                        {claim.evidenceDetails.fullSources.map((source, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <ExternalLink size={12} className="text-aurora-cyan" />
                                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-aurora-cyan hover:underline">
                                                    {source.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Data Points */}
                            <div>
                                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Data Points</h4>
                                <ul className="space-y-1">
                                    {claim.evidenceDetails.dataPoints.map((point, i) => (
                                        <li key={i} className="text-sm text-white/70">• {point}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Methodology */}
                            <div>
                                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Methodology</h4>
                                <p className="text-sm text-white/70">{claim.evidenceDetails.methodology}</p>
                            </div>

                            {/* Conflicts */}
                            {claim.evidenceDetails.conflicts && claim.evidenceDetails.conflicts.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Conflicting Information</h4>
                                    <ul className="space-y-1">
                                        {claim.evidenceDetails.conflicts.map((conflict, i) => (
                                            <li key={i} className="text-sm text-red-400/80">• {conflict}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Evidence Tab Component
function EvidenceTab({ data }: { data: FactCheckData }) {
    return (
        <div className="space-y-6">
            {/* Sources Referenced */}
            <EvidenceSection
                title="Sources Referenced"
                icon={<BookOpen size={18} />}
                count={data.sources.length}
            >
                <div className="space-y-4">
                    {data.sources.map((source, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-white/30 text-sm">{i + 1}.</span>
                            <div className="flex-1">
                                <p className="font-semibold text-white">{source.name}</p>
                                <a href={`https://${source.url}`} target="_blank" rel="noopener noreferrer" className="text-aurora-cyan text-sm hover:underline flex items-center gap-1">
                                    {source.url}
                                    <ExternalLink size={12} />
                                </a>
                                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                    <span>Verified: {source.verificationDate}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${
                                        source.credibility === "high" ? "bg-emerald-400/10 text-emerald-400" :
                                        source.credibility === "medium" ? "bg-aurora-cyan/10 text-aurora-cyan" :
                                        "bg-orange-400/10 text-orange-400"
                                    }`}>
                                        {source.credibility} credibility
                                    </span>
                                </div>
                                {source.additionalInfo && (
                                    <p className="text-xs text-white/40 mt-1">{source.additionalInfo}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </EvidenceSection>

            {/* Statistical Data */}
            <EvidenceSection
                title="Statistical Data & Facts Verified"
                icon={<BarChart3 size={18} />}
            >
                <ul className="space-y-2">
                    {data.statisticalData.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            {item.status === "verified" && <CheckCircle size={14} className="text-emerald-400" />}
                            {item.status === "partial" && <AlertCircle size={14} className="text-orange-400" />}
                            {item.status === "contradicts" && <XCircle size={14} className="text-red-400" />}
                            <span className="text-white/80">{item.point}</span>
                        </li>
                    ))}
                </ul>
            </EvidenceSection>

            {/* Vague Language */}
            {data.vagueLanguage.length > 0 && (
                <EvidenceSection
                    title="Vague Language Detected"
                    icon={<AlertTriangle size={18} />}
                    count={data.vagueLanguage.length}
                    variant="warning"
                >
                    <div className="space-y-4">
                        {data.vagueLanguage.map((item, i) => (
                            <div key={i} className="bg-orange-400/5 border border-orange-400/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-orange-400">"{item.phrase}"</span>
                                    <span className="text-xs text-white/40">[{item.timestamp}]</span>
                                </div>
                                <p className="text-sm text-white/60 mb-1">
                                    <span className="text-white/40">Issue:</span> {item.issue}
                                </p>
                                <p className="text-sm text-white/60">
                                    <span className="text-white/40">Suggestion:</span> {item.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </EvidenceSection>
            )}

            {/* Methodology */}
            <EvidenceSection
                title="Analysis Methodology"
                icon={<Beaker size={18} />}
            >
                <ul className="space-y-2">
                    {data.methodology.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="text-aurora-cyan">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </EvidenceSection>
        </div>
    );
}

// Evidence Section Component
function EvidenceSection({
    title,
    icon,
    count,
    variant = "default",
    children,
}: {
    title: string;
    icon: React.ReactNode;
    count?: number;
    variant?: "default" | "warning";
    children: React.ReactNode;
}) {
    return (
        <div className={`border rounded-xl overflow-hidden ${
            variant === "warning" ? "border-orange-400/30" : "border-white/10"
        }`}>
            <div className={`flex items-center gap-2 px-5 py-3 ${
                variant === "warning" ? "bg-orange-400/5" : "bg-white/[0.03]"
            }`}>
                <span className={variant === "warning" ? "text-orange-400" : "text-aurora-cyan"}>{icon}</span>
                <h3 className="font-semibold text-white">{title}</h3>
                {count !== undefined && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                        variant === "warning" ? "bg-orange-400/20 text-orange-400" : "bg-white/10 text-white/60"
                    }`}>
                        {count}
                    </span>
                )}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// Loading State Component
function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-aurora-cyan/20 border-t-aurora-cyan rounded-full mb-6"
            />
            <h3 className="text-lg font-bold text-white mb-4">Analyzing Claims...</h3>
            <div className="space-y-2 text-sm text-white/40">
                <motion.p
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                    Extracting factual claims...
                </motion.p>
                <p>Gathering evidence from sources...</p>
                <p>Cross-referencing data...</p>
            </div>
            <p className="mt-6 text-xs text-white/30">Estimated time: 30 seconds</p>
        </div>
    );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-400/10 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fact Checking Unavailable</h3>
            <p className="text-white/50 text-sm max-w-md mb-2">{error}</p>
            <div className="text-left text-xs text-white/40 mb-6">
                <p className="mb-1">Possible reasons:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Content language not supported</li>
                    <li>Insufficient audio/text quality</li>
                    <li>External database temporarily unavailable</li>
                </ul>
            </div>
            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="flex items-center gap-2 px-5 py-2.5 bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan rounded-lg text-sm font-semibold hover:bg-aurora-cyan/20 transition-colors"
                >
                    <RefreshCw size={16} />
                    Retry Analysis
                </motion.button>
            )}
        </div>
    );
}

// Footer Component
function ModalFooter() {
    return (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
                <Download size={16} />
                Export Report
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
                <Share2 size={16} />
                Share Results
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-lg text-sm font-semibold text-aurora-cyan hover:bg-aurora-cyan/20 transition-colors"
            >
                <FileText size={16} />
                View in Reports
            </motion.button>
        </div>
    );
}
