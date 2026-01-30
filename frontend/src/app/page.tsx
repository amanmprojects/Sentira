"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Activity,
  Eye,
  Binary,
  Cpu,
  Globe
} from "lucide-react";
import { useRef } from "react";
import { BorderBeam } from "@/components/ui/border-beam";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-aurora-deep text-white selection:bg-aurora-cyan/30">
      <div className="mesh-bg opacity-50"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-aurora-cyan/20 blur-[80px] rounded-full animate-float"></div>
      <div className="absolute top-[40%] right-20 w-48 h-48 bg-aurora-rose/20 blur-[100px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-h-20 max-w-7xl rounded-full z-50 px-8 py-6 flex justify-between items-center bg-white/2 backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]  transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 cyber-glass rounded-xl flex items-center justify-center border border-white/10 group">
            <Binary className="text-aurora-cyan group-hover:rotate-12 transition-transform" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Senti<span className="aurora-text">Wave</span>
          </span>
        </div>
        <div className="hidden md:flex gap-10 items-center text-xs font-black uppercase tracking-widest text-white/50">
          <Link href="#tech" className="hover:text-aurora-cyan transition-colors">Technology</Link>
          <Link href="#features" className="hover:text-aurora-rose transition-colors">Protocol</Link>
          <Link href="/dashboard" className="">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 cyber-glass border border-white/10 text-white rounded-full flex items-center gap-2 hover:border-aurora-cyan/50 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all"
            >
              Enterprise Portal <ArrowRight size={16} />
            </motion.button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-48">
        {/* Hero Section */}
        <section className="px-8 pb-32 flex flex-col items-center text-center m-5">


          <motion.h1
            style={{ y, opacity }}
            className="text-5xl md:text-[8rem] font-black leading-[0.85] tracking-tighter mb-10 uppercase"
          >
            Decoding
            <span className="aurora-text"> Sentira</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-2xl text-white/40 max-w-2xl font-medium leading-relaxed mb-16 px-4"
          >
            The next-generation multimodal framework for social media bias detection,
            driven by state-of-the-art AI temporal reasoning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-8 items-center"
          >
            <Link href="/dashboard" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-1000"></div>
              <button className="relative px-12 py-6 bg-black text-white text-xl font-black rounded-xl uppercase tracking-widest flex items-center gap-4 transition-transform hover:scale-[1.02]">
                Launch System <Zap size={24} className="fill-white" />
              </button>
            </Link>
            <button className="px-10 py-5 cyber-glass border border-white/10 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-white/5 transition-all">
              Documentation
            </button>
          </motion.div>
        </section>

        {/* Real-time Visualization Mockup */}
        <section className="px-8 max-w-7xl mx-auto mb-48">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] cyber-glass border border-white/10 p-2 overflow-hidden shadow-[0_0_100px_rgba(0,242,254,0.1)]"
          >
            <BorderBeam
              size={120}
              duration={8}
              colorFrom="#00f2fe"
              colorTo="#ff61d2"
              beamBorderRadius={48}
            />
            <div className="aspect-[21/9] w-full bg-[#080808] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
              {/* System Nodes UI Mockup */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              </div>
              <div className="text-center z-10 space-y-4">
                <Cpu className="text-aurora-cyan animate-pulse mx-auto" size={64} />
                <p className="text-white/20 font-black tracking-[0.5em] uppercase text-xs">Awaiting Neural Link</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Technical Features Grid */}
        <section id="tech" className="px-8 max-w-7xl mx-auto py-32">
          <div className="grid md:grid-cols-4 gap-8">
            <TechCard
              icon={<ShieldCheck className="text-aurora-cyan" />}
              title="Bias Protocol"
              desc="Detection of cherry-picking information with timestamped evidence."
            />
            <TechCard
              icon={<Activity className="text-aurora-rose" />}
              title="Temporal Flow"
              desc="Deep analysis of emotional shifts throughout video progression."
            />
            <TechCard
              icon={<Eye className="text-aurora-blue" />}
              title="Visual Logic"
              desc="Decoding micro-expressions and manipulative framing patterns."
            />
            <TechCard
              icon={<Globe className="text-white" />}
              title="Hashtag Pulse"
              desc="Comparative source analysis across global social ecosystems."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function TechCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-10 rounded-[2.5rem] cyber-glass border border-white/5 hover:border-white/20 transition-all group overflow-hidden"
    >
      <BorderBeam
        size={60}
        duration={6}
        colorFrom="#00f2fe"
        colorTo="#9b41ff"
        beamBorderRadius={40}
        delay={Math.random() * 3}
      />
      <div className="mb-8 p-5 rounded-2xl bg-white/5 inline-block group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-4 uppercase tracking-tight italic">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
