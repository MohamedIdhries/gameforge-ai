'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Play, Pause, Download, Copy, Check, Zap, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpriteSheetStudioProps {
  imageUrl: string;
  assetName: string;
}

export default function SpriteSheetStudio({ imageUrl, assetName }: SpriteSheetStudioProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(12);
  const [copiedAtlas, setCopiedAtlas] = useState(false);
  const [animationType, setAnimationType] = useState<'walk' | 'idle' | 'attack' | 'jump'>('walk');

  const frameCount = 8;

  // Frame animation timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 1000 / fps;
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, fps]);

  // JSON Texture Atlas format for Unity / Godot / Phaser
  const atlasJson = `{
  "frames": {
    "frame_0": { "frame": { "x": 0, "y": 0, "w": 128, "h": 128 } },
    "frame_1": { "frame": { "x": 128, "y": 0, "w": 128, "h": 128 } },
    "frame_2": { "frame": { "x": 256, "y": 0, "w": 128, "h": 128 } },
    "frame_3": { "frame": { "x": 384, "y": 0, "w": 128, "h": 128 } },
    "frame_4": { "frame": { "x": 512, "y": 0, "w": 128, "h": 128 } },
    "frame_5": { "frame": { "x": 640, "y": 0, "w": 128, "h": 128 } },
    "frame_6": { "frame": { "x": 768, "y": 0, "w": 128, "h": 128 } },
    "frame_7": { "frame": { "x": 896, "y": 0, "w": 128, "h": 128 } }
  },
  "meta": {
    "app": "GameForge AI Sprite Sheet Engine",
    "version": "1.0",
    "image": "${assetName.toLowerCase().replace(/\s+/g, '_')}_spritesheet.png",
    "size": { "w": 1024, "h": 128 },
    "scale": "1"
  }
}`;

  const handleCopyAtlas = () => {
    navigator.clipboard.writeText(atlasJson);
    setCopiedAtlas(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopiedAtlas(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Layers className="w-4 h-4" />
          <span>Live 8-Frame Sprite Sheet Generator & Player</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnimationType('walk')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              animationType === 'walk' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Walk Loop
          </button>
          <button
            onClick={() => setAnimationType('idle')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              animationType === 'idle' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Idle Pulse
          </button>
          <button
            onClick={() => setAnimationType('attack')}
            className={`px-3 py-1 rounded-lg border transition-all ${
              animationType === 'attack' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Attack Combo
          </button>
        </div>
      </div>

      {/* CANVAS PREVIEW AREA */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* LEFT: ANIMATED SPRITE PLAYER */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800 min-h-[300px] relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <div className="relative w-36 h-36 flex items-center justify-center overflow-hidden">
            <motion.img
              key={currentFrame}
              src={imageUrl}
              alt={assetName}
              referrerPolicy="no-referrer"
              animate={
                animationType === 'walk'
                  ? { x: [(currentFrame % 2) * 4 - 2, -(currentFrame % 2) * 4 + 2], y: [0, -6, 0] }
                  : animationType === 'attack'
                  ? { rotate: [0, -15, 25, 0], scale: [1, 1.15, 1] }
                  : { scale: [1, 1.05, 1], y: [0, -3, 0] }
              }
              transition={{ duration: 0.15 }}
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            />
          </div>

          <div className="mt-4 flex items-center gap-3 font-mono text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all font-bold"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <span className="text-slate-300">
              Frame: <strong className="text-cyan-400">{currentFrame + 1}</strong> / {frameCount}
            </span>

            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 outline-none font-bold"
            >
              <option value={8}>8 FPS</option>
              <option value={12}>12 FPS</option>
              <option value={24}>24 FPS</option>
              <option value={60}>60 FPS</option>
            </select>
          </div>
        </div>

        {/* RIGHT: SPRITE SHEET STRIP & ATLAS EXPORT */}
        <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Generated 8-Frame Sprite Sheet Texture (1024×128)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">PNG Transparent</span>
            </div>

            {/* Horizontal Frame Strip */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
              {Array.from({ length: frameCount }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentFrame(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-14 h-14 rounded-xl border flex-shrink-0 flex items-center justify-center p-1 cursor-pointer transition-all ${
                    currentFrame === idx
                      ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                      : 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imageUrl} alt={`Frame ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* JSON Atlas Code snippet & Export */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Unity / Godot TextureAtlas.json</span>
              <button
                onClick={handleCopyAtlas}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 flex items-center gap-1 text-[11px] font-mono"
              >
                {copiedAtlas ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAtlas ? 'Copied Atlas!' : 'Copy JSON Atlas'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
