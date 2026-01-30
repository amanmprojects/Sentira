"use client";

import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

const SETTINGS_SECTIONS = [
    {
        id: "profile",
        title: "Profile",
        description: "Manage your account information",
        icon: <User size={20} />,
    },
    {
        id: "notifications",
        title: "Notifications",
        description: "Configure alert preferences",
        icon: <Bell size={20} />,
    },
    {
        id: "privacy",
        title: "Privacy & Security",
        description: "Control your data and security settings",
        icon: <Shield size={20} />,
    },
    {
        id: "appearance",
        title: "Appearance",
        description: "Customize the interface",
        icon: <Palette size={20} />,
    },
];

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Page Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="text-aurora-cyan" size={24} />
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            <span className="aurora-text">Settings</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm">
                        User preferences and configuration
                    </p>
                </motion.header>

                {/* Settings Sections */}
                <div className="space-y-4">
                    {SETTINGS_SECTIONS.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="p-6 rounded-2xl cyber-glass border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/5 text-white/50 group-hover:text-aurora-cyan group-hover:bg-aurora-cyan/10 transition-all">
                                    {section.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black uppercase tracking-tight text-sm">
                                        {section.title}
                                    </h3>
                                    <p className="text-white/40 text-xs mt-0.5">
                                        {section.description}
                                    </p>
                                </div>
                                <div className="text-white/20 group-hover:text-white/40 transition-colors">
                                    →
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
