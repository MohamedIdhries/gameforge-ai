'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiggsfieldMotionType,
  HiggsfieldMotionResult,
  HIGGSFIELD_MOTION_PRESETS,
} from '@/lib/higgsfield';
import { Play, Film, Sparkles, Camera, Copy, Check, Zap, Cpu, AlertTriangle, ExternalLink } from 'lucide-react';

interface HiggsfieldMotionStudioProps {
  assetName: string;
  originalImageUrl: string;
}

export default function HiggsfieldMotionStudio({ assetName, originalImageUrl }: HiggsfieldMotionStudioProps) {
  const [selectedMotion, setSelectedMotion] = useState<HiggsfieldMotionType>('idle_anim');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HiggsfieldMotionResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const selectedPreset = HIGGSFIELD_MOTION_PRESETS.find(p => p.id === selectedMotion)!;

  const handleGenerate = useCallback(async (motionType: HiggsfieldMotionType) => {
    setSelectedMotion(motionType);
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/higgsfield-motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: originalImageUrl, motionType, assetName }),
      });
      const data = await res.json() as HiggsfieldMotionResult;
      setResult(data);
    } catch {
      setResult({ configured: false, videoUrl: null, error: 'Network error reaching /api/higgsfield-motion' });
    } finally {
      setIsGenerating(false);
    }
  }, [originalImageUrl, assetName]);

  const handleCopyVideoUrl = () => {
    if (!result?.videoUrl) return;
    navigator.clipboard.writeText(result.videoUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const presetIcons: Record<HiggsfieldMotionType, React.ElementType> = {
    idle_anim: Film,
    attack_slash: Zap,
    walk_cycle: Play,
    camera_orbit: Camera,
    hero_cinematic: Sparkles,
  };

  return (
    <div className="w-full space-y-4">
      {/* TOP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Cpu className="w-4 h-4" />
          <span>Higgsfield AI Motion Studio</span>
        </div>
        <a
          href="https://higgsfield.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          higgsfield.ai
        </a>
      </div>

      {/* PRESET BUTTONS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {HIGGSFIELD_MOTION_PRESETS.map((preset) => {
          const Icon = presetIcons[preset.id];
          const isSelected = selectedMotion === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleGenerate(preset.id)}
              disabled={isGenerating}
              className={`p-3 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-white line-clamp-1">{preset.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
            </button>
          );
        })}
      </div>

      {/* VIDEO PREVIEW BOX */}
      <div className="relative w-full min-h-[380px] rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-3 text-center p-8"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-400 font-mono">Requesting Higgsfield AI motion synthesis…</p>
              <p className="text-[11px] text-slate-500">This may take up to 60 s if the API is configured.</p>
            </motion.div>
          ) : result && !result.configured ? (
            /* API not configured — honest notice */
            <motion.div
              key="not-configured"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 text-center max-w-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Higgsfield API not configured</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {result.message ?? 'Set HIGGSFIELD_API_KEY in your environment to enable real video generation.'}
                </p>
              </div>
              <div className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-[11px] font-mono text-slate-300 space-y-1">
                <p className="text-slate-500"># .env.local</p>
                <p className="text-cyan-300">HIGGSFIELD_API_KEY=your_key_here</p>
              </div>
              <a
                href="https://higgsfield.ai/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Request Higgsfield API access
              </a>
              {/* Show the source image so the tab isn't empty */}
              <div className="mt-2 opacity-40">
                <img src={originalImageUrl} alt={assetName} className="max-h-[160px] object-contain rounded-xl" />
              </div>
            </motion.div>
          ) : result?.videoUrl ? (
            /* Real video returned */
            <motion.div
              key={`video-${selectedMotion}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full flex flex-col items-center justify-center p-4"
            >
              <video
                key={result.videoUrl}
                src={result.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="max-h-[300px] rounded-2xl shadow-2xl object-contain"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{selectedPreset.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    Camera: {selectedPreset.cameraPreset}
                  </span>
                </div>
                <button
                  onClick={handleCopyVideoUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] flex items-center gap-1 border border-slate-700"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy MP4 URL'}</span>
                </button>
              </div>
            </motion.div>
          ) : result?.error ? (
            /* API error */
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 p-8 text-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-sm font-bold text-white">Higgsfield request failed</p>
              <p className="text-xs text-red-300 font-mono">{result.error}</p>
            </motion.div>
          ) : (
            /* Initial idle state — prompt user to click a preset */
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <img
                src={originalImageUrl}
                alt={assetName}
                className="max-h-[260px] object-contain rounded-2xl shadow-2xl opacity-70"
              />
              <p className="text-xs text-slate-400">
                Select a motion preset above to request Higgsfield AI video generation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
