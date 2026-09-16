import React from 'react';
import Link from 'next/link';
import { Gamepad2, Sparkles, Shield, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">GAMEFORGE AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate, transform, organize, and ship game-ready AI assets in seconds. Cloudinary-powered media pipeline for indie studios.
            </p>
            <div className="flex items-center space-x-2 text-xs text-cyan-400 pt-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Built for Hackathons & Production</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Product</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/generator" className="hover:text-cyan-400 transition-colors">AI Generator</Link></li>
              <li><Link href="/generator" className="hover:text-cyan-400 transition-colors">Asset Pack Engine</Link></li>
              <li><Link href="/library" className="hover:text-cyan-400 transition-colors">Asset Library</Link></li>
              <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">SaaS Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Cloudinary AI Pipeline</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Auto Background Removal
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Smart Crop (Gravity AI)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                Generative Variations
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                AI Vision Auto-Tagging
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                f_auto & q_auto Delivery
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">Next.js 16</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">React 19</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">Cloudinary SDK</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">Supabase DB</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">Tailwind CSS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              © 2026 GameForge AI. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
