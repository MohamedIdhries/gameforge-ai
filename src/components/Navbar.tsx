'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Wand2, LayoutDashboard, FolderKanban, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { getStoredProjects } from '@/lib/store';
import { Project } from '@/types/gameforge';

export default function Navbar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const projs = getStoredProjects();
    setProjects(projs);
    if (projs.length > 0) {
      setSelectedProjectId(projs[0].id);
    }
  }, []);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/generator', label: 'AI Generator', icon: Wand2, badge: 'Pack AI' },
    { href: '/library', label: 'Asset Library', icon: Layers },
    { href: '/pricing', label: 'Pricing', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  GAMEFORGE <span className="text-cyan-400 text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 font-semibold">AI</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
                  Powered by Cloudinary
                </p>
              </div>
            </Link>

            {/* Active Project Switcher */}
            {projects.length > 0 && pathname !== '/' && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-500">Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent font-medium text-slate-200 outline-none cursor-pointer focus:text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.name} ({p.gameEngine})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Cloudinary Pipeline: <strong className="text-emerald-400">Active</strong></span>
            </div>

            <Link
              href="/generator"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Wand2 className="w-4 h-4" />
              <span>+ Generate</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
