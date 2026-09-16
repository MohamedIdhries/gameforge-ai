'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Check, Wand2, ShieldCheck, Zap, HelpCircle, ArrowRight, Presentation } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      description: 'Ideal for indie developers building their first prototype or game jam submission.',
      features: [
        '1 Active Game Project',
        '25 AI Asset Generations / month',
        'Basic Cloudinary Optimization (f_auto)',
        'PNG Export',
        'Community Support'
      ],
      cta: 'Start Free Jam',
      highlighted: false
    },
    {
      name: 'Pro Developer',
      price: '$29',
      period: 'per month',
      description: 'Everything indie studios need to produce commercial games with full Cloudinary pipeline.',
      features: [
        'Unlimited Game Projects',
        '500 AI Asset Generations / month',
        'Cloudinary Background Removal (e_background_removal)',
        'Smart Gravity Cropping (512×512, 256×256, 128×128)',
        '✨ 1-Click Asset Pack Generator',
        'Generative AI Armor & Color Variations',
        'Unity & Unreal Code Snippets'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true
    },
    {
      name: 'Studio Team',
      price: '$99',
      period: 'per month',
      description: 'Built for mid-sized game studios requiring shared asset libraries and high volume.',
      features: [
        'Everything in Pro',
        'Shared Team Workspace (Up to 10 members)',
        '2,500 AI Asset Generations / month',
        'Priority Cloudinary CDN Queue',
        'Custom AI Fine-Tuning on Studio Art Style',
        'Dedicated Support & SLA'
      ],
      cta: 'Contact Studio Sales',
      highlighted: false
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>SaaS Business Model • Pay As You Grow</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base text-slate-300">
            Priced directly on AI compute & Cloudinary media transformation volume.
          </p>
        </motion.div>

        {/* PRICING CARDS GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all backdrop-blur-xl ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/60 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20 relative md:-translate-y-2'
                  : 'bg-slate-900/80 border border-slate-800'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md">
                  Most Popular for Studios
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ {tier.period}</span>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-6 text-xs text-slate-300">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/generator"
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    tier.highlighted
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* HACKATHON DEMO CHEAT SHEET FOR JUDGES */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">🏆 Hackathon Presentation Structure</h2>
              <p className="text-xs text-slate-400">Suggested 3-minute pitch structure for judges demo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-mono font-bold">1. Problem (20s)</span>
              <p className="text-slate-300 leading-relaxed">Indie developers spend hours editing, cropping, and background-removing AI assets manually.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-mono font-bold">2. Solution (20s)</span>
              <p className="text-slate-300 leading-relaxed">GameForge AI turns generation, transformation, and game engine delivery into a single automated pipeline.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-purple-400 font-mono font-bold">3. Live Demo (90s)</span>
              <p className="text-slate-300 leading-relaxed">Generate character -&gt; Click "Generate Asset Pack" -&gt; Instant transparent PNG + 512×512 cards.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-pink-400 font-mono font-bold">4. Cloudinary (30s)</span>
              <p className="text-slate-300 leading-relaxed">Show Cloudinary f_auto, q_auto, e_background_removal, and gravity crop parameters live.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-mono font-bold">5. Business (20s)</span>
              <p className="text-slate-300 leading-relaxed">SaaS subscription model covering AI compute + Cloudinary transformation tier margins.</p>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}
