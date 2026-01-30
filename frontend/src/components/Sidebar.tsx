"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    LayoutDashboard,
    Video,
    Hash,
    FileText,
    History,
    Sparkles,
    ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
    { icon: <LayoutDashboard size={20} />, label: "Pulse", href: "/dashboard" },
    { icon: <Video size={20} />, label: "Scanner", href: "/analyze" },
    { icon: <Hash size={20} />, label: "Topics", href: "/topic" },
    { icon: <FileText size={20} />, label: "Reports", href: "/reports" },
    { icon: <History size={20} />, label: "Archive", href: "/history" },
];

export default function Sidebar() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#050505]/80 backdrop-blur-3xl border-r border-white/5 z-50 flex flex-col p-4 shadow-[10px_0_40px_rgba(0,0,0,0.5)]">
            {/* Branding */}
            <div className="flex items-center gap-3 px-4 py-8 mb-4">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-aurora-cyan to-aurora-rose rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10">
                        <Sparkles className="text-aurora-cyan" size={24} />
                    </div>
                </div>
                <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
                    Senti<span className="aurora-text">Wave</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative flex items-center group px-4 py-4 rounded-2xl transition-all duration-300 ${isActive
                                        ? "text-white"
                                        : "text-white/40 hover:text-white/80"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white/5 rounded-2xl border-l-2 border-aurora-cyan shadow-[inset_10px_0_20px_rgba(0,242,254,0.05)]"
                                    />
                                )}
                                <div className={`mr-4 transition-all duration-500 ${isActive ? "text-aurora-cyan drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]" : "group-hover:text-aurora-cyan"}`}>
                                    {item.icon}
                                </div>
                                <span className={`font-bold tracking-tight text-sm uppercase ${isActive ? "opacity-100" : "opacity-60"}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="ml-auto"
                                    >
                                        <ChevronRight size={14} className="text-aurora-cyan" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* New Analysis Quick Action */}
            <div className="mb-4">
                <Link href="/analyze">
                    <button className="w-full relative group p-[1px] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose animate-gradient-x"></div>
                        <div className="relative px-4 py-3 bg-[#050505] rounded-[15px] flex items-center justify-center gap-2">
                            <Plus size={18} className="text-white" />
                            <span className="text-xs font-black uppercase text-white tracking-widest">New Scan</span>
                        </div>
                    </button>
                </Link>
            </div>

            {/* Status Card */}
            <div className="p-6 rounded-3xl cyber-glass border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Gemini Engine</span>
                    <div className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse shadow-[0_0_10px_#00f2fe]"></div>
                </div>
                <div className="space-y-1">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            className="h-full bg-aurora-cyan"
                        />
                    </div>
                    <p className="text-[9px] text-white/40 uppercase">Usage: 752/1000 scans</p>
                </div>
            </div>
        </aside>
    );
}
