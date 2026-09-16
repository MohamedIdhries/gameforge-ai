'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AssetType, AssetStyle, AspectRatio, Project } from '@/types/gameforge';
import { getStoredProjects, createNewAsset, createAssetPack } from '@/lib/store';
import { enhanceGamePrompt } from '@/lib/prompt-enhancer';
import { Wand2, Sparkles, Layers, PackageCheck, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Zap, RefreshCw, Cpu, AlertTriangle, CloudUpload, Info } from 'lucide-react';

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Dual mode: 'single' vs 'pack'
  const [generationMode, setGenerationMode] = useState<'single' | 'pack'>('single');

  // Form State
  const [prompt, setPrompt] = useState('Cyberpunk warrior with futuristic glowing cyan armor');
  const [packName, setPackName] = useState('Cyberpunk Warrior Pack');
  const [assetType, setAssetType] = useState<AssetType>('Character');
  const [style, setStyle] = useState<AssetStyle>('3D Game Art');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Generation status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Check Cloudinary configuration status (non-blocking)
    fetch('/api/cloudinary-status')
      .then((r) => r.json())
      .then((d: { configured: boolean }) => setCloudinaryConfigured(d.configured))
      .catch(() => setCloudinaryConfigured(false));
  }, []);

  useEffect(() => {
    const projs = getStoredProjects();
    setProjects(projs);
    if (projs.length > 0) {
      setSelectedProjectId(initialProjectId && projs.some(p => p.id === initialProjectId) ? initialProjectId : projs[0].id);
    }
  }, [initialProjectId]);

  const presetPrompts = [
    'Master Kung Fu Panda warrior in golden martial arts armor',
    'Cyberpunk warrior with futuristic glowing cyan armor',
    'Mythic dark dragon lord with volcanic obsidian scales',
    'Futuristic sci-fi energy blaster gun with glowing blue cartridge',
    'Rain-soaked cyberpunk alleyway, towering neon skyscrapers'
  ];

  const generationSteps = [
    'Sending prompt to Pollinations AI image model...',
    'Waiting for AI image synthesis (may take 15–40 s)...',
    'Image received — uploading to Cloudinary (if configured)...',
    'Applying f_auto & q_auto optimisation...',
    'Building smart crops & AI Vision tags...'
  ];

  interface GenerateResult {
    imageUrl: string;
    cloudinaryPublicId: string | null;
    cloudinaryUploaded: boolean;
    optimizedUrl: string | null;
    bgRemovedUrl: string | null;
    tags: string[];
    provider: 'pollinations+cloudinary' | 'pollinations';
  }

  /**
   * Calls the real /api/generate-image route which uses Pollinations.AI.
   * Returns full generation result including Cloudinary metadata when available.
   */
  async function generateImage(singlePrompt: string, singleAspectRatio: AspectRatio): Promise<GenerateResult> {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: singlePrompt,
        assetType,
        style,
        aspectRatio: singleAspectRatio,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    const data = await res.json() as {
      imageUrl: string;
      cloudinaryPublicId: string | null;
      cloudinaryConfigured: boolean;
      optimizedUrl: string | null;
      bgRemovedUrl: string | null;
      tags: string[];
      provider: 'pollinations+cloudinary' | 'pollinations';
    };
    return {
      imageUrl:           data.imageUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      cloudinaryUploaded: data.provider === 'pollinations+cloudinary',
      optimizedUrl:       data.optimizedUrl,
      bgRemovedUrl:       data.bgRemovedUrl,
      tags:               data.tags ?? [],
      provider:           data.provider,
    };
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedProjectId) return;

    setIsGenerating(true);
    setProgressStep(0);
    setGenerationError(null);

    // Advance progress indicator while the real fetch is in flight
    const stepInterval = setInterval(() => {
      setProgressStep(prev => Math.min(prev + 1, generationSteps.length - 2));
    }, 4000);

    try {
      if (generationMode === 'single') {
        const result = await generateImage(prompt, aspectRatio);
        clearInterval(stepInterval);
        setProgressStep(generationSteps.length - 1);

        const newAsset = createNewAsset({
          projectId: selectedProjectId,
          name: `${style} ${assetType}`,
          prompt,
          assetType,
          style,
          aspectRatio,
          imageUrl:           result.imageUrl,
          cloudinaryPublicId: result.cloudinaryPublicId ?? undefined,
          optimizedUrl:       result.optimizedUrl,
          bgRemovedUrl:       result.bgRemovedUrl,
          tags:               result.tags,
          cloudinaryUploaded: result.cloudinaryUploaded,
          provider:           result.provider,
        });
        setIsGenerating(false);
        router.push(`/asset/${newAsset.id}`);
      } else {
        // Asset Pack Mode — generate 3 images in sequence
        const packPrompts = [
          { suffix: 'full body standing stance, game character model', ratio: '1:1' as AspectRatio },
          { suffix: 'headshot hero portrait, character icon', ratio: '1:1' as AspectRatio },
          { suffix: 'character inventory gear icon, small icon', ratio: '1:1' as AspectRatio },
        ];

        const results: GenerateResult[] = [];
        for (const item of packPrompts) {
          const r = await generateImage(`${prompt}, ${item.suffix}`, item.ratio);
          results.push(r);
        }

        clearInterval(stepInterval);
        setProgressStep(generationSteps.length - 1);

        const packAssets = createAssetPack({
          projectId: selectedProjectId,
          packName: packName || 'Game Asset Pack',
          prompt,
          assetType,
          style,
          imageUrls:           results.map((r) => r.imageUrl),
          cloudinaryPublicIds: results.map((r) => r.cloudinaryPublicId ?? undefined),
          optimizedUrls:       results.map((r) => r.optimizedUrl),
          bgRemovedUrls:       results.map((r) => r.bgRemovedUrl),
          tagSets:             results.map((r) => r.tags),
          cloudinaryUploaded:  results[0]?.cloudinaryUploaded ?? false,
          provider:            results[0]?.provider ?? 'pollinations',
        });
        setIsGenerating(false);
        router.push(`/asset/${packAssets[0].id}?pack=true`);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setGenerationError(msg);
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-400 mb-4 backdrop-blur-md">
          <Wand2 className="w-4 h-4" />
          <span>Cloudinary AI Media Pipeline Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Create Game Asset
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Enter your prompt to generate optimized, background-removed, game-ready assets.
        </p>
      </motion.div>

      {/* CLOUDINARY STATUS BANNER */}
      {cloudinaryConfigured === false && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200"
        >
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Cloudinary not configured — images served directly from Pollinations.AI</p>
            <p className="text-[11px] mt-0.5 text-amber-400">
              Set <code className="bg-amber-950 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-amber-950 px-1 rounded">CLOUDINARY_API_KEY</code>, and <code className="bg-amber-950 px-1 rounded">CLOUDINARY_API_SECRET</code> in <code className="bg-amber-950 px-1 rounded">.env.local</code> to enable real Cloudinary transformations (bg removal, smart crop, f_auto/q_auto, AI Vision tags).
            </p>
          </div>
        </motion.div>
      )}
      {cloudinaryConfigured === true && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300"
        >
          <CloudUpload className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">Cloudinary pipeline active</span>
          <span className="text-emerald-500">— generated images will be uploaded with f_auto, q_auto, bg removal, and AI Vision tags</span>
        </motion.div>
      )}

      {/* MODE TOGGLE (SINGLE VS ASSET PACK) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 inline-flex gap-2 backdrop-blur-xl">
          <button
            onClick={() => setGenerationMode('single')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              generationMode === 'single'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Single Asset</span>
          </button>

          <button
            onClick={() => setGenerationMode('pack')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              generationMode === 'pack'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/50 shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-purple-300" />
            <span>Generate Asset Pack (Hackathon Winner ✨)</span>
          </button>
        </div>
      </motion.div>

      {/* GENERATOR CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        
        {/* Error state */}
        <AnimatePresence>
          {generationError && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-sm text-red-300"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-200">Generation failed</p>
                <p className="text-xs mt-0.5 font-mono">{generationError}</p>
                <p className="text-xs mt-1 text-red-400">
                  Pollinations.AI is free and requires no key. If this persists, check your network or try a shorter prompt.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay loading state during generation */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin flex items-center justify-center" />
                <Wand2 className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {generationMode === 'pack' ? 'Generating Asset Pack (3 images)...' : 'Generating AI Image...'}
                </h3>
                <motion.p
                  key={progressStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-cyan-400 font-mono mt-2 font-medium"
                >
                  {generationSteps[progressStep]}
                </motion.p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Real AI generation via Pollinations.AI — typically 15–40 s per image
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full"
                  animate={{ width: `${((progressStep + 1) / generationSteps.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono pt-4 border-t border-slate-800/80">
                <span>✓ Pollinations AI (flux model)</span>
                <span>✓ Cloudinary pipeline (if configured)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleGenerate} className="space-y-8">
          
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Target Game Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium outline-none focus:border-cyan-500 transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.gameEngine}) — {p.assetCount} Assets
                </option>
              ))}
            </select>
          </div>

          {/* Pack Name input (Only in Pack Mode) */}
          <AnimatePresence>
            {generationMode === 'pack' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 overflow-hidden"
              >
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Asset Pack Title
                </label>
                <input
                  type="text"
                  required
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="e.g. Cyberpunk Warrior Asset Pack"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-500/40 text-white font-bold outline-none focus:border-purple-400"
                />
                <p className="text-[11px] text-purple-300">
                  ⚡ Generates 3 synchronized deliverables: Full Character, 512×512 Portrait, and 256×256 Inventory Icon!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PROMPT INPUT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                AI Visual Prompt
              </label>
              <button
                type="button"
                onClick={() => setPrompt(enhanceGamePrompt(prompt, assetType, style))}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>✨ Auto-Enhance Prompt for Game Engine</span>
              </button>
            </div>
            
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe character armor, lighting, pose, style, level background..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />

            {/* Preset Chips */}
            <div className="mt-3">
              <span className="text-[11px] text-slate-400 font-semibold block mb-2">Try sample prompts:</span>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all text-left"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OPTIONS GRID (TYPE, STYLE, ASPECT RATIO) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            
            {/* Asset Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Asset Category
              </label>
              <select
                value={assetType}
                onChange={(e: any) => setAssetType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium outline-none focus:border-cyan-500"
              >
                <option value="Character">Character / Sprite</option>
                <option value="Environment">Environment / Scene</option>
                <option value="Item/Prop">Item / Weapon / Prop</option>
                <option value="UI/Icon">UI / Icon / HUD</option>
                <option value="Texture">Texture / Material</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Art Style
              </label>
              <select
                value={style}
                onChange={(e: any) => setStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium outline-none focus:border-cyan-500"
              >
                <option value="3D Game Art">3D Game Art (Unreal/Unity)</option>
                <option value="Pixel Art">Pixel Art (16-bit Retro)</option>
                <option value="Vector">Vector Clean (UI/Mobile)</option>
                <option value="Anime">Anime Cell Shaded</option>
                <option value="Photorealistic">Photorealistic 8K</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e: any) => setAspectRatio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium outline-none focus:border-cyan-500"
              >
                <option value="1:1">1:1 Square (1024 × 1024)</option>
                <option value="16:9">16:9 Landscape (1920 × 1080)</option>
                <option value="9:16">9:16 Portrait (1080 × 1920)</option>
                <option value="4:3">4:3 Standard (1024 × 768)</option>
              </select>
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-4 rounded-xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all ${
                generationMode === 'pack'
                  ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              <Wand2 className="w-5 h-5" />
              <span>
                {generationMode === 'pack' ? '✨ Generate Full Asset Pack' : '✨ Generate Single Asset'}
              </span>
            </motion.button>
          </div>

        </form>
      </motion.div>

    </main>
  );
}

export default function GeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading AI Generator...
        </div>
      }>
        <GeneratorContent />
      </Suspense>
      <Footer />
    </div>
  );
}
