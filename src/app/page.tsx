'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HackIndiaBenchmarkPanel from '@/components/HackIndiaBenchmarkPanel';
import { Wand2, Layers, Zap, Image as ImageIcon, Scissors, Crop, Sparkles, Tag, ArrowRight, ShieldCheck, Gamepad2, CheckCircle2, PackageCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'original' | 'transparent' | 'crop' | 'variation'>('original');

  const sampleImage = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1024&q=80&auto=format&fit=crop';

  const demoTransformations = {
    original: {
      url: sampleImage,
      params: 'f_auto,q_auto',
      title: 'Original AI Master Render',
      desc: 'High-res text-to-image output synthesized for 3D game characters (1024×1024 PNG)'
    },
    transparent: {
      url: sampleImage,
      params: 'f_auto,q_auto,e_background_removal',
      title: 'Cloudinary AI Background Removal',
      desc: 'Instant transparent PNG sprite cutout ready for Unity, Unreal Engine & Godot'
    },
    crop: {
      url: sampleImage,
      params: 'f_auto,q_auto,c_fill,g_auto,w_512,h_512',
      title: 'Cloudinary Smart Gravity Crop (512×512)',
      desc: 'AI detects focal point of interest for UI cards, hotbars, and dialogue portraits'
    },
    variation: {
      url: sampleImage,
      params: 'f_auto,q_auto,e_gen_replace:from_armor;to_gold_cybernetic_armor',
      title: 'Generative Armor & Pose Variation',
      desc: 'Generates golden cybernetic plating and lighting variants without re-prompting'
    }
  };

  const currentDemo = demoTransformations[activeTab];

  // Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-28 overflow-hidden border-b border-slate-800/60">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />
          
          {/* Glowing background animated blobs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500 blur-[140px] rounded-full pointer-events-none"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.12, scale: 1.1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
            className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-purple-600 blur-[150px] rounded-full pointer-events-none"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
          >
            
            {/* Hackathon Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-semibold text-cyan-400 mb-8 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Production SaaS • Powered by Cloudinary AI Pipeline</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]"
            >
              Generate. Transform. Organize. <span className="gradient-text">Ship.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              The SaaS platform for indie game developers to <strong className="text-white">generate game-ready visual assets</strong> with AI and automate media pipelines with Cloudinary.
            </motion.p>

            {/* Call to Actions */}
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/generator"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Start Creating Game Assets</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-200 font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  <span>Open Studio Dashboard</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick stats banner */}
            <motion.div
              variants={itemVariants}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80"
            >
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-2xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Game Engine Ready</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-2xl font-extrabold text-cyan-400">f_auto & q_auto</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Cloudinary Optimized</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-2xl font-extrabold text-purple-400">1-Click</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Asset Pack Engine</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                <p className="text-2xl font-extrabold text-emerald-400">Unity / Unreal</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">C# Snippet Export</p>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* 21st.dev STYLE INTERACTIVE CLOUDINARY DEMO WIDGET */}
        <section className="py-24 bg-slate-950/60 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                Live Cloudinary Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
                See Cloudinary Media Transformations in Action
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">
                Click below to see how GameForge AI transforms raw AI outputs into production game engine deliverables in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl backdrop-blur-xl"
            >
              {/* Tab selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'original'
                      ? 'bg-slate-800 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>1. AI Generation</span>
                </button>

                <button
                  onClick={() => setActiveTab('transparent')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'transparent'
                      ? 'bg-slate-800 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Scissors className="w-4 h-4 text-pink-400" />
                  <span>2. BG Removal</span>
                </button>

                <button
                  onClick={() => setActiveTab('crop')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'crop'
                      ? 'bg-slate-800 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crop className="w-4 h-4 text-purple-400" />
                  <span>3. Smart Gravity Crop</span>
                </button>

                <button
                  onClick={() => setActiveTab('variation')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'variation'
                      ? 'bg-slate-800 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>4. AI Variations</span>
                </button>
              </div>

              {/* Demo preview box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-950 rounded-2xl p-6 border border-slate-800">
                {/* Image side */}
                <div className="relative flex justify-center items-center bg-slate-900/80 rounded-xl p-4 border border-slate-800 overflow-hidden min-h-[320px]">
                  {activeTab === 'transparent' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                  )}

                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeTab}
                      src={currentDemo.url}
                      alt={currentDemo.title}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-lg object-contain transition-all duration-300 max-h-[300px] ${
                        activeTab === 'crop' ? 'w-[200px] h-[200px] object-cover ring-2 ring-purple-500/50' : 'w-full'
                      } ${activeTab === 'variation' ? 'hue-rotate-30 contrast-125' : ''}`}
                    />
                  </AnimatePresence>

                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-cyan-400">
                    Cloudinary Transformation URL
                  </div>
                </div>

                {/* Details & URL parameters */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-xs text-cyan-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cloudinary Pipeline Active</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{currentDemo.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{currentDemo.desc}</p>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
                    <p className="text-slate-400 uppercase tracking-wider text-[10px] font-sans font-bold">Cloudinary Transformation Parameters:</p>
                    <p className="text-cyan-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      {currentDemo.params}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Delivered via Cloudinary CDN</span>
                    <Link
                      href="/generator"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Try on your prompt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* HackIndia Live Benchmark Tool */}
              <div className="mt-8">
                <HackIndiaBenchmarkPanel />
              </div>
            </motion.div>

          </div>
        </section>

        {/* 4-STEP WORKFLOW DIAGRAM WITH FRAMER MOTION */}
        <section className="py-24 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30">
                End-to-End Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
                From Prompt to Game Engine in Seconds
              </h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              
              <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glow-card relative">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Create & Prompt</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Enter detailed text prompts with style presets (3D Game Art, Pixel Art, Photorealistic) and game engine targets.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glow-card relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Cloudinary Pipeline</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Cloudinary automatically strips backgrounds, performs gravity smart-crops (512×512, 256×256), and auto-tags assets with AI Vision.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glow-card relative">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Generative Variations</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Generate armor variants, color shifts, and pose adjustments without wasting credits or re-prompting from scratch.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glow-card relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold mb-4">
                  04
                </div>
                <h3 className="text-lg font-bold text-white">Organize & Ship</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Export transparent PNGs, asset packs, and optimized CDN URLs directly into Unity, Unreal Engine, or Godot.
                </p>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* HACKATHON DEMO SHOWCASE HIGHLIGHT (21st.dev Style Card) */}
        <section className="py-24 bg-slate-950/80 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                    <PackageCheck className="w-4 h-4" />
                    <span>Judges Special • Generate Asset Pack</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                    Need an Entire Asset Pack for Your Game?
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Instead of generating individual images, GameForge AI generates complete asset packs — full character sprites, UI portraits (512×512), inventory icons (256×256), and avatars in a single click!
                  </p>
                  <div className="pt-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                      <Link
                        href="/generator"
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Test "Generate Asset Pack" Engine</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 font-mono text-xs text-slate-300 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-cyan-400">Cyberpunk Warrior Asset Pack</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Cloudinary Processed
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span>✓ Full Body Sprite</span>
                      <span className="text-cyan-400 font-bold">1024×1024 • Transparent</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span>✓ Dialogue Portrait</span>
                      <span className="text-purple-400 font-bold">512×512 • Smart Crop</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span>✓ Inventory Hotbar Icon</span>
                      <span className="text-pink-400 font-bold">256×256 • Smart Crop</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span>✓ Player HUD Avatar</span>
                      <span className="text-amber-400 font-bold">128×128 • Face Gravity</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
