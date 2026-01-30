"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                        <Settings size={14} /> System Config
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Control <span className="aurora-text">Center</span></h1>
                </header>

                <div className="p-12 rounded-[3rem] cyber-glass border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Settings size={32} className="text-white/40" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white/80">Application Settings</h3>
                    <p className="text-white/40 max-w-sm">Manage API keys, model selection parameters, and UI preferences in this section.</p>
                </div>
            </div>
        </div>
    );
}
