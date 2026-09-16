'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiggsfieldMotionType, generateHiggsfieldMotion } from '@/lib/higgsfield';
import { Video, Play, Film, Sparkles, Camera, Download, Copy, Check, Zap, Cpu } from 'lucide-react';

interface HiggsfieldMotionStudioProps {
  assetName: string;
  originalImageUrl: string;
}

export default function HiggsfieldMotionStudio({ assetName, originalImageUrl }: HiggsfieldMotionStudioProps) {
  const [selectedMotion, setSelectedMotion] = useState<HiggsfieldMotionType>('idle_anim');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentMotion = generateHiggsfieldMotion({
    assetName,
    originalImageUrl,
    motionType: selectedMotion
  });

  const handleMotionChange = (motionType: HiggsfieldMotionType) => {
    setIsGenerating(true);
    setSelectedMotion(motionType);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyVideoUrl = () => {
    navigator.clipboard.writeText(currentMotion.videoUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const motionPresets: { id: HiggsfieldMotionType; label: string; icon: any; desc: string }[] = [
    { id: 'idle_anim', label: 'Idle Stance', icon: Film, desc: '60 FPS breathing & stance loop' },
    { id: 'attack_slash', label: 'Attack Slash', icon: Zap, desc: 'Dynamic plasma sword combo' },
    { id: 'walk_cycle', label: '3D Walk Cycle', icon: Play, desc: 'Seamless forward movement loop' },
    { id: 'camera_orbit', label: '360° Camera Orbit', icon: Camera, desc: 'Orbital showcase video render' },
    { id: 'hero_cinematic', label: 'Cinematic Move', icon: Sparkles, desc: 'Unreal 5 trailer angle' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* TOP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Cpu className="w-4 h-4" />
          <span>Higgsfield AI Motion & Video Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
            60 FPS Render
          </span>
          <span className="px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
            Camera Control Active
          </span>
        </div>
      </div>

      {/* PRESET BUTTONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {motionPresets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedMotion === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleMotionChange(preset.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-white line-clamp-1">{preset.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</p>
            </button>
          );
        })}
      </div>

      {/* VIDEO PREVIEW BOX */}
      <div className="relative w-full h-[380px] rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-3 text-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin flex items-center justify-center" />
              <p className="text-xs text-cyan-400 font-mono">Higgsfield AI Motion Synthesis in progress...</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedMotion}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full flex flex-col items-center justify-center p-4"
            >
              {/* Image with animated motion pulse effect */}
              <div className="relative group max-h-[300px] flex items-center justify-center">
                <img
                  src={originalImageUrl}
                  alt={assetName}
                  referrerPolicy="no-referrer"
                  className="max-h-[300px] object-contain rounded-2xl shadow-2xl filter drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse"
                />
                
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/40 pointer-events-none" />
              </div>

              {/* Controls bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{currentMotion.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Camera: {currentMotion.cameraPreset}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyVideoUrl}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] flex items-center gap-1 border border-slate-700"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied MP4 URL!' : 'Copy MP4 URL'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
