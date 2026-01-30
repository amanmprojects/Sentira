"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Activity,
  Eye,
  Cpu,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Terminal,
  FileCode
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { BorderBeam } from "@/components/border-beam";
import BrandIcon from "@/components/BrandIcon";
import { GridScan } from "@/components/grid-scan";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen text-white">
      <GridScan
        scanColor="#ff0080"
        linesColor="#4facfe"
        gridScale={0.5}
        uTilt={-0.3}
        scanOpacity={0.7}
        scanGlow={2.5}
      />

      {/* Hero Refined Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
        <div className="cyber-glass rounded-full px-8 py-4 flex justify-between items-center border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
            <BrandIcon size="sm" />
            <span className="text-xl font-black tracking-tighter uppercase">
              Sen<span className="aurora-text">tira</span>
            </span>
          </Link>
          <div className="hidden md:flex gap-8 items-center text-[10px] font-black uppercase tracking-widest text-white/40">
            <Link href="#neural-link" className="hover:text-aurora-rose transition-colors">Protocols</Link>
            <Link href="#features" className="hover:text-aurora-cyan transition-colors">Features</Link>
            <Link href="/sign-in">
              <button className="px-5 py-2.5 bg-white text-black rounded-full font-black text-[9px] hover:scale-105 transition-all uppercase cursor-pointer">
                Enterprise Portal
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-56">
        {/* Hero Section */}
        <section className="px-8 pb-32 flex flex-col items-center text-center">
          <motion.h1
            style={{ y, opacity }}
            className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tighter mb-12 uppercase italic"
          >
            Decoding<br />
            <span className="aurora-text">Sentiment.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/40 max-w-2xl font-medium leading-relaxed mb-16 px-4"
          >
            A high-fidelity multimodal framework for analyzing <span className="text-white">text, audio, and video</span> streams,
            driven by state-of-the-art AI temporal reasoning and narrative extraction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-8 items-center"
          >
            <Link href="/sign-in">
              <button className="group relative px-12 py-6 bg-white text-black text-lg font-black rounded-2xl uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] overflow-hidden flex items-center gap-4 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan/20 to-aurora-rose/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Terminal size={24} className="group-hover:rotate-12 transition-transform" />
                Launch Console
              </button>
            </Link>
            <Link href="/docs">
              <button className="group relative px-12 py-6 cyber-glass border border-white/10 text-white font-black text-sm rounded-2xl uppercase tracking-widest hover:border-aurora-rose/30 transition-all flex items-center gap-4 cursor-pointer">
                <BorderBeam size={100} duration={8} colorFrom="#ff0080" colorTo="transparent" />
                <FileCode size={20} className="text-aurora-rose" />
                Documentation
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Console Preview Area - Neural Uplink Enhanced */}
        <section id="neural-link" className="px-8 max-w-6xl mx-auto mb-64">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] p-1.5 overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-rose animate-gradient-x opacity-20"></div>
            <div className="relative rounded-[3.85rem] cyber-glass border border-white/10 p-4 aspect-video overflow-hidden">
              <BorderBeam size={600} duration={20} colorFrom="#00f2fe" colorTo="#ff0080" />
              <div className="w-full h-full bg-[#080808]/80 rounded-[3.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                {/* Neural Data Stream Visualization */}
                <NeuralDataStream />

                <div className="absolute top-12 left-12 flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/40 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>

                <div className="flex flex-col items-center gap-8 relative z-10">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-8 border border-dashed border-aurora-cyan/20 rounded-full"
                    />
                    <div className="w-32 h-32 rounded-full cyber-glass flex items-center justify-center border border-white/10 group-hover:border-aurora-cyan/50 transition-all duration-500 shadow-[0_0_50px_rgba(0,242,254,0.1)]">
                      <Cpu className="text-aurora-cyan animate-pulse" size={48} />
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-4xl font-black uppercase tracking-[0.2em] italic">Neural <span className="aurora-text">Uplink</span></h3>
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center justify-center gap-3">
                        <span className="w-12 h-1px bg-white/10"></span>
                        <p className="text-white/30 font-black tracking-[0.4em] uppercase text-[10px]">Processing Multimodal Streams</p>
                        <span className="w-12 h-1px bg-white/10"></span>
                      </div>
                      <Link href="/sign-in">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-aurora-cyan text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_#00f2fe] transition-all cursor-pointer"
                        >
                          Try it now
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
                  <div className="flex gap-8">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-aurora-cyan"></div> Stream: ACTIVE</span>
                    <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-aurora-rose"></div> Latency: 4ms</span>
                  </div>
                  <span className="text-aurora-cyan">Protocol 2.5 Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tactical Features Grid */}
        <section id="features" className="px-8 max-w-7xl mx-auto pb-48">
          <div className="grid md:grid-cols-4 gap-6">
            <TechCard
              icon={<ShieldCheck className="text-aurora-cyan" />}
              title="Bias Protocol"
              desc="Deep-layer detection of cherry-picked narratives and framing."
            />
            <TechCard
              icon={<Activity className="text-aurora-rose" />}
              title="Temporal Flow"
              desc="Real-time analysis of emotional peaks throughout source media."
            />
            <TechCard
              icon={<Eye className="text-aurora-blue" />}
              title="Visual Logic"
              desc="Decoding micro-expressions and manipulative camera framing."
            />
            <TechCard
              icon={<Globe className="text-white" />}
              title="Global Archive"
              desc="Cross-platform sentiment mining across digital ecosystems."
            />
          </div>
        </section>
      </main>

      {/* Footer Restored and Enhanced */}
      <footer className="relative z-10 py-32 border-t border-white/5 bg-[#050505]/40 backdrop-blur-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-aurora-rose/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-aurora-cyan/5 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="md:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <BrandIcon size="lg" />
              <div>
                <h4 className="text-3xl font-black uppercase tracking-tighter italic">Sen<span className="aurora-text">tira</span></h4>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Intelligence Framework</p>
              </div>
            </div>
            <p className="text-white/40 text-lg leading-relaxed max-w-md font-medium">
              Pioneering the next generation of digital sentiment analysis through neural video extraction and narrative protocol.
            </p>
            <div className="flex gap-6">
              <SocialLink icon={<Github size={20} />} />
              <SocialLink icon={<Twitter size={20} />} />
              <SocialLink icon={<Linkedin size={20} />} />
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Protocol</h5>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li className="hover:text-aurora-cyan transition-colors cursor-pointer capitalize"><Link href="/docs">Architecture</Link></li>
              <li className="hover:text-aurora-cyan transition-colors cursor-pointer capitalize"><Link href="/docs">Security Matrix</Link></li>
              <li className="hover:text-aurora-cyan transition-colors cursor-pointer capitalize"><Link href="/docs">API Access</Link></li>
              <li className="hover:text-aurora-cyan transition-colors cursor-pointer capitalize"><Link href="/docs">Source Streams</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Enterprise</h5>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li className="hover:text-aurora-rose transition-colors cursor-pointer capitalize"><Link href="/sign-in">Intelligence Hub</Link></li>
              <li className="hover:text-aurora-rose transition-colors cursor-pointer capitalize"><Link href="/sign-in">Neural Pricing</Link></li>
              <li className="hover:text-aurora-rose transition-colors cursor-pointer capitalize"><Link href="/docs">Documentation</Link></li>
              <li className="hover:text-aurora-rose transition-colors cursor-pointer capitalize"><Link href="/docs">Status Log</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 mt-32 pt-12 border-t border-white/5 flex flex-col md:row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">© 2026 Sentira Protocol. All Rights Reserved.</p>
          <div className="flex gap-12 text-[9px] font-black uppercase tracking-widest text-white/10">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NeuralDataStream() {
  const [mounted, setMounted] = useState(false);
  const [streams] = useState(() => 
    [...Array(20)].map(() => ({
      y: Math.random() * 800,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2
    }))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on client to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
      {streams.map((stream, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-aurora-cyan"
          initial={{ width: 0, x: -100, y: stream.y }}
          animate={{ width: [0, 200, 0], x: 1200 }}
          transition={{ duration: stream.duration, repeat: Infinity, delay: stream.delay }}
        />
      ))}
    </div>
  );
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
      className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
    >
      {icon}
    </motion.div>
  );
}

function TechCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-10 rounded-[2.5rem] cyber-glass border border-white/5 hover:border-aurora-cyan/20 transition-all group relative overflow-hidden"
    >
      <BorderBeam size={150} duration={10} colorFrom="#00f2fe" colorTo="transparent" />
      <div className="mb-8 p-4 rounded-xl bg-white/5 inline-block transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-black mb-3 uppercase tracking-tight italic">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}