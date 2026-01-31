"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Activity,
    Scale,
    CheckCircle,
    TrendingUp,
    Compass,
    FileText,
    Settings,
} from "lucide-react";

import BrandIcon from "./BrandIcon";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { LogOut, Zap } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";

const NAV_ITEMS = [
    { icon: <LayoutDashboard size={20} />, label: "Pulse", href: "/dashboard" },
    { icon: <Activity size={20} />, label: "Sentiment Analysis", href: "/sentiment-analysis" },
    { icon: <Scale size={20} />, label: "Detecting Bias", href: "/detecting-bias" },
    { icon: <CheckCircle size={20} />, label: "Fact Checking", href: "/fact-checking" },
    { icon: <Compass size={20} />, label: "Browse", href: "/browse" },
    { icon: <TrendingUp size={20} />, label: "Trend Analysis", href: "/trend-analysis" },
    { icon: <FileText size={20} />, label: "Reports", href: "/reports" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isAutoPilot, isAnalyzing } = useAnalysis();
    const isFullWidthPage = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/docs");

    if (isFullWidthPage) return null;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#030303]/80 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col p-6 overflow-hidden">

            {/* Branding - Click to go to Pulse (Dashboard) */}
            <Link href="/dashboard" className="flex items-center gap-3 py-6 mb-8 group relative z-10 hover:opacity-80 transition-opacity">
                <BrandIcon size="md" />
                <span className="text-2xl font-black tracking-tighter uppercase">
                    Sen<span className="aurora-text">tira</span>
                </span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 relative z-10 overflow-y-auto scrollbar-none">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center group px-4 py-4 rounded-2xl transition-all duration-300 ${isActive
                                    ? "text-white bg-white/5"
                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-3/5 bg-aurora-cyan rounded-r-full shadow-[0_0_15px_#00f2fe]"
                                    />
                                )}
                                <div className={`mr-4 transition-colors ${isActive ? "text-aurora-cyan" : "group-hover:text-aurora-cyan"}`}>
                                    {item.icon}
                                </div>
                                <span className={`font-black tracking-[0.05em] text-[13px] uppercase`}>
                                    {item.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Status & User Section */}
            <div className="mt-auto space-y-4 pt-6 relative z-10">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[11px] uppercase font-black tracking-widest text-white/30">
                            {isAutoPilot ? "Automation Link" : "Neural Engine"}
                        </span>
                        <div className={`w-2.5 h-2.5 rounded-full ${isAutoPilot ? 'bg-aurora-rose animate-spin rounded-[1px]' : 'bg-aurora-cyan animate-pulse'} shadow-[0_0_12px_currentColor]`}></div>
                    </div>

                    {isAutoPilot ? (
                        <div className="relative z-10 py-1">
                            <div className="flex items-center gap-2 text-aurora-rose">
                                <Zap size={14} className="animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-tighter italic">Neural Auto-Pilot Active</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1 relative z-10">
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isAnalyzing ? "100%" : "75%" }}
                                    transition={{ duration: isAnalyzing ? 10 : 0.5 }}
                                    className={`h-full ${isAnalyzing ? 'bg-aurora-rose' : 'bg-aurora-cyan'}`}
                                />
                            </div>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                                {isAnalyzing ? "Processing Neural Packets..." : "Usage Status: 75% Peak"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-2 py-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-10 h-10 border border-white/10 rounded-xl hover:border-aurora-cyan/50 transition-all",
                                    userButtonTrigger: "focus:shadow-none hover:scale-105 active:scale-95 transition-all"
                                }
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Active Node</span>
                            <span className="text-[10px] font-bold uppercase text-white/40 tracking-tighter">Identity Verified</span>
                        </div>
                    </div>

                    <SignOutButton>
                        <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-aurora-rose hover:border-aurora-rose/20 transition-all cursor-pointer group">
                            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </aside>
    );
}