// setting page

"use client";

import { motion } from "framer-motion";
import {
  Sliders,
  Shield,
  Zap,
  Eye,
  Trash2,
  Save
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 pt-10 selection:bg-aurora-cyan/30">
      <div className="max-w-[1100px] mx-auto space-y-10">

        {/* HEADER */}
        <div>
          <p className="text-white/40 uppercase font-black tracking-[0.2em] text-[10px] mb-1">
            System Configuration
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">
            Intelligence <span className="aurora-text">Settings</span>
          </h1>
          <p className="text-white/30 text-xs font-medium mt-2">
            Control how the AI analyzes, explains, and visualizes media.
          </p>
        </div>

        {/* ANALYSIS SETTINGS */}
        <SettingsSection
          icon={<Sliders size={16} />}
          title="Analysis Preferences"
          description="Control which intelligence modules are active during analysis."
        >
          <Toggle label="Emotion Detection" />
          <Toggle label="Toxicity Analysis" />
          <Toggle label="Factuality Verification" />
          <Toggle label="Hashtag Intelligence" />
          <Toggle label="Bias & Manipulation Detection" />
        </SettingsSection>

        {/* AI SENSITIVITY */}
        <SettingsSection
          icon={<Eye size={16} />}
          title="AI Sensitivity"
          description="Adjust how aggressively the AI flags emotional and factual signals."
        >
          <Slider label="Emotion Sensitivity" />
          <Slider label="Toxicity Threshold" />
          <Slider label="Misinformation Confidence" />
        </SettingsSection>

        {/* PERFORMANCE */}
        <SettingsSection
          icon={<Zap size={16} />}
          title="Performance & Efficiency"
          description="Balance speed, accuracy, and compute usage."
        >
          <Toggle label="Fast Mode (Reduced Frames)" />
          <Toggle label="Async Parallel Processing" />
          <Toggle label="Cache Previous Analyses" />
          <Toggle label="Background Model Warm-Up" />
        </SettingsSection>

        {/* PRIVACY */}
        <SettingsSection
          icon={<Shield size={16} />}
          title="Privacy & Data Control"
          description="Control data retention and external access."
        >
          <Toggle label="Auto-Delete Videos After Analysis" />
          <Toggle label="Disable Cloud Storage" />
          <Toggle label="Anonymize Speaker Identity" />
        </SettingsSection>

        {/* UI */}
        <SettingsSection
          icon={<Eye size={16} />}
          title="UI & Visualization"
          description="Customize how intelligence is presented."
        >
          <Toggle label="Animated Backgrounds" />
          <Toggle label="Explainability Highlights" />
          <Toggle label="Emotion Timeline Animations" />
          <Toggle label="Advanced Metrics Panel" />
        </SettingsSection>

        {/* DANGER ZONE */}
        <div className="p-8 rounded-[2rem] border border-aurora-rose/30 bg-aurora-rose/5">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-aurora-rose mb-4 flex items-center gap-2">
            <Trash2 size={14} /> Danger Zone
          </h3>
          <p className="text-xs text-white/50 mb-4">
            These actions are irreversible.
          </p>
          <button className="px-6 py-3 rounded-xl bg-aurora-rose/20 text-aurora-rose text-[10px] font-black uppercase tracking-widest hover:bg-aurora-rose/30 transition">
            Reset All Settings
          </button>
        </div>

        {/* SAVE */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-10 py-4 rounded-full bg-aurora-cyan text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-6">
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
          <span className="text-aurora-cyan">{icon}</span>
          {title}
        </h2>
        <p className="text-xs text-white/40 mt-1">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60">{label}</span>
      <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
        <div className="absolute left-1 top-1 w-3 h-3 bg-aurora-cyan rounded-full" />
      </div>
    </div>
  );
}

function Slider({ label }: { label: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-[10px] text-white/30">Adaptive</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full">
        <motion.div
          initial={{ width: "40%" }}
          animate={{ width: "65%" }}
          className="h-full bg-aurora-cyan rounded-full"
        />
      </div>
    </div>
  );
}