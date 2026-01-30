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
import { BorderBeam } from "./border-beam";
import BrandIcon from "./BrandIcon";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const NAV_ITEMS = [
    { icon: <LayoutDashboard size={18} />, label: "Pulse", href: "/dashboard" },
    { icon: <Video size={18} />, label: "Scanner", href: "/analyze" },
    { icon: <Hash size={18} />, label: "Topics", href: "/topic" },
    { icon: <FileText size={18} />, label: "Reports", href: "/reports" },
    { icon: <History size={18} />, label: "Archive", href: "/history" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const isFullWidthPage = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/docs");

    if (isFullWidthPage) return null;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#030303]/80 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col p-6 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <BorderBeam size={250} duration={8} delay={0} colorFrom="#00f2fe" colorTo="#ff0080" />
            </div>

            {/* Branding */}
            <div className="flex items-center gap-3 py-6 mb-8 group relative z-10">
                <BrandIcon size="md" />
                <span className="text-xl font-black tracking-tighter uppercase">
                    Sen<span className="aurora-text">tira</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 relative z-10">
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
                                <span className={`font-black tracking-[0.1em] text-[10px] uppercase`}>
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
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Neural Engine</span>
                        <div className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse shadow-[0_0_10px_#00f2fe]"></div>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "75%" }}
                                className="h-full bg-aurora-cyan"
                            />
                        </div>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Usage Status: 75% Peak</p>
                    </div>
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
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Active Node</span>
                            <span className="text-[8px] font-bold uppercase text-white/20 tracking-tighter">Identity Verified</span>
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