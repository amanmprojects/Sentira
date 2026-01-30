"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BrandIcon from "@/components/BrandIcon";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ArrowLeft, Cpu } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="fixed inset-0 bg-[#030303] text-white flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Ambient Background Glows - Critical for immediate visual paint */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aurora-rose/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-aurora-cyan/10 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-12 relative z-10"
            >
                {/* Branding - Visible immediately */}
                <div className="flex flex-col items-center gap-6">
                    <Link href="/">
                        <div className="flex items-center gap-4 group cursor-pointer hover:scale-105 transition-all">
                            <BrandIcon size="lg" />
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase font-display">
                                Sen<span className="aurora-text">tira</span>
                            </h1>
                        </div>
                    </Link>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                <div className="flex justify-center relative min-h-[400px]">
                    {/* High-Fidelity Tactical Skeleton - Shown while Clerk loads */}
                    <ClerkLoading>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full cyber-glass border border-white/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-8 bg-[#0a0a0a]/90 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <div className="relative">
                                <Cpu className="text-white/10 animate-spin-slow" size={48} />
                                <div className="absolute inset-0 bg-aurora-cyan/20 blur-xl animate-pulse"></div>
                            </div>
                            <div className="space-y-4 w-full">
                                <div className="h-4 w-3/4 bg-white/5 rounded-full mx-auto overflow-hidden relative">
                                    <motion.div
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-aurora-cyan/20 to-transparent"
                                    />
                                </div>
                                <div className="h-2 w-1/2 bg-white/5 rounded-full mx-auto"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="h-12 bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="h-12 bg-white/5 rounded-xl border border-white/5"></div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Initializing Neural Link...</p>
                        </motion.div>
                    </ClerkLoading>

                    {/* Clerk Loaded Content */}
                    <ClerkLoaded>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <SignIn
                                appearance={{
                                    baseTheme: dark,
                                    elements: {
                                        card: "cyber-glass border border-white/20 rounded-[2.5rem] shadow-2xl bg-[#0a0a0a]/90",
                                        headerTitle: "text-white uppercase tracking-widest font-black italic text-2xl",
                                        headerSubtitle: "text-white/60 font-bold uppercase tracking-widest text-[10px]",
                                        socialButtonsBlockButton: "bg-white/10 border-white/10 text-white hover:bg-white/20 transition-all rounded-xl",
                                        socialButtonsBlockButtonText: "font-black tracking-widest uppercase text-[10px] text-white",
                                        socialButtonsBlockButtonArrow: "text-white/40",
                                        dividerLine: "bg-white/20",
                                        dividerText: "text-white/40 font-black uppercase tracking-widest text-[10px]",
                                        formFieldLabel: "text-white font-black uppercase tracking-widest text-[10px] mb-2",
                                        formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl focus:border-aurora-cyan focus:ring-1 focus:ring-aurora-cyan/30 transition-all py-3 px-4",
                                        formButtonPrimary: "bg-aurora-cyan text-black font-black uppercase tracking-widest text-[11px] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)] border-none py-4",
                                        footerActionText: "text-white/60 font-bold uppercase tracking-widest text-[10px]",
                                        footerActionLink: "text-aurora-cyan hover:text-aurora-rose transition-colors font-black uppercase tracking-widest text-[10px]",
                                        identityPreviewText: "text-white font-bold",
                                        identityPreviewEditButtonIcon: "text-aurora-cyan",
                                        formFieldAction: "text-aurora-cyan hover:text-aurora-rose transition-colors font-black uppercase tracking-widest text-[10px]",
                                        formFieldLabelRow: "mb-2"
                                    }
                                }}
                            />
                        </motion.div>
                    </ClerkLoaded>
                </div>

                {/* Back Link */}
                <Link href="/">
                    <motion.div
                        whileHover={{ x: -5 }}
                        className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to Network
                    </motion.div>
                </Link>
            </motion.div>
        </div>
    );
}