'use client';

import React, { useState } from 'react';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';
import { Sliders, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CloudinaryMaterialStudioProps {
  originalImageUrl: string;
  assetName: string;
}

export default function CloudinaryMaterialStudio({ originalImageUrl, assetName }: CloudinaryMaterialStudioProps) {
  const [hue, setHue] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [materialPreset, setMaterialPreset] = useState<'none' | 'gold' | 'neon' | 'fire' | 'pixel'>('none');
  const [copied, setCopied] = useState(false);

  const getTransformedUrl = () => {
    const params: string[] = [];
    if (hue !== 0) params.push(`e_hue:${hue}`);
    if (contrast !== 0) params.push(`e_contrast:${contrast}`);
    if (materialPreset === 'gold') params.push('e_gen_replace:from_armor;to_gold_plating');
    if (materialPreset === 'neon') params.push('e_art:incognito');
    if (materialPreset === 'fire') params.push('e_tint:100:red:0:yellow');
    if (materialPreset === 'pixel') params.push('e_pixelate:12');

    const trans = params.length > 0 ? params.join(',') : '';
    return getOptimizedCloudinaryUrl(originalImageUrl, trans);
  };

  const currentTransformedUrl = getTransformedUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTransformedUrl);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Sliders className="w-4 h-4" />
          <span>Cloudinary Real-Time PBR Material & Color Shift Studio</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold border border-slate-800 flex items-center gap-1.5 text-[11px]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied URL!' : 'Copy Cloudinary Transformed URL'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        {/* CONTROLS */}
        <div className="md:col-span-5 space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Hue Color Shift</span>
              <span className="text-cyan-400">{hue}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Dynamic Contrast</span>
              <span className="text-purple-400">{contrast}%</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* MATERIAL PRESETS */}
          <div>
            <span className="text-slate-300 font-bold block mb-2">Generative Material Presets:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMaterialPreset('none')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                  materialPreset === 'none' ? 'bg-slate-800 text-cyan-400 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Default Renders
              </button>
              <button
                onClick={() => setMaterialPreset('gold')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                  materialPreset === 'gold' ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Gold Plating
              </button>
              <button
                onClick={() => setMaterialPreset('fire')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                  materialPreset === 'fire' ? 'bg-rose-950 text-rose-300 border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Volcanic Fire
              </button>
              <button
                onClick={() => setMaterialPreset('pixel')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-bold ${
                  materialPreset === 'pixel' ? 'bg-purple-950 text-purple-300 border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                16-Bit Pixelate
              </button>
            </div>
          </div>
        </div>

        {/* IMAGE PREVIEW */}
        <div className="md:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 min-h-[300px]">
          <img
            src={currentTransformedUrl}
            alt={assetName}
            referrerPolicy="no-referrer"
            className="max-h-[280px] object-contain rounded-2xl shadow-2xl"
          />
          <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-400">
            Cloudinary Real-Time Parameters
          </div>
        </div>
      </div>
    </div>
  );
}
