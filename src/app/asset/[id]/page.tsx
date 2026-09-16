'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hologram3DViewer from '@/components/Hologram3DViewer';
import GameHudSimulator from '@/components/GameHudSimulator';
import HiggsfieldMotionStudio from '@/components/HiggsfieldMotionStudio';
import MultiEngineExportStudio from '@/components/MultiEngineExportStudio';
import { GameAsset } from '@/types/gameforge';
import { getStoredAssets, saveAssets } from '@/lib/store';
import { INITIAL_ASSETS } from '@/lib/mock-data';
import { getOptimizedCloudinaryUrl, getGenerativeVariations, getSmartCropVariants, getBackgroundRemovedUrl } from '@/lib/cloudinary';
import { ArrowLeft, Wand2, Scissors, Crop, Sparkles, Tag, Check, Copy, Download, Share2, Layers, ShieldCheck, Code, Eye, RefreshCcw, PackageCheck, Box, Gamepad2, Film, Cpu } from 'lucide-react';

function AssetDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const assetId = decodeURIComponent((params?.id as string) || '');
  const isPackFlow = searchParams.get('pack') === 'true';

  const [asset, setAsset] = useState<GameAsset | null>(() => {
    if (!assetId) return null;
    const assets = getStoredAssets();
    let found = assets.find((a) => a.id === assetId || a.id.toLowerCase() === assetId.toLowerCase());
    if (!found) {
      found = INITIAL_ASSETS.find((a) => a.id === assetId || a.id.toLowerCase() === assetId.toLowerCase());
    }
    if (!found) {
      const fallbackUrl = 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?w=1024&q=80&auto=format&fit=crop';
      return {
        id: assetId,
        projectId: 'proj-cyberpunk-rpg',
        projectName: 'Cyberpunk RPG 2099',
        cloudinaryPublicId: `gameforge/${assetId}`,
        name: 'Master Game Character Asset',
        assetType: 'Character',
        style: '3D Game Art',
        prompt: 'Kung fu panda warrior hero in golden martial arts armor',
        aspectRatio: '1:1',
        thumbnailUrl: fallbackUrl,
        originalUrl: fallbackUrl,
        bgRemovedUrl: getBackgroundRemovedUrl(fallbackUrl),
        tags: ['character', '3d-game-art', 'panda', 'warrior', 'game-ready', 'cloudinary-ai'],
        width: 1024,
        height: 1024,
        format: 'png',
        createdAt: new Date().toISOString(),
        smartCrops: getSmartCropVariants(fallbackUrl),
        variations: getGenerativeVariations(fallbackUrl, 'Kung fu panda warrior hero')
      };
    }
    return found;
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'bg_removal' | 'smart_crop' | 'variations' | 'higgsfield' | 'depth_3d' | 'game_hud' | 'engine_code'>('preview');

  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    const assets = getStoredAssets();
    let found = assets.find((a) => a.id === assetId || a.id.toLowerCase() === assetId.toLowerCase());
    if (!found) {
      found = INITIAL_ASSETS.find((a) => a.id === assetId || a.id.toLowerCase() === assetId.toLowerCase());
    }
    if (found) {
      setAsset(found);
    }
  }, [assetId]);

  if (!asset) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Asset Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested game asset could not be located in your studio.</p>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm">
          Return to Dashboard
        </Link>
      </main>
    );
  }

  // Trigger celebration confetti for hackathon demo!
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    triggerConfetti();
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const currentCrop = asset.smartCrops[selectedCropIndex] || asset.smartCrops[0];
  const currentVariation = asset.variations[selectedVariationIndex] || asset.variations[0];

  const getDisplayedImageUrl = () => {
    switch (activeTab) {
      case 'bg_removal':
        return asset.bgRemovedUrl;
      case 'smart_crop':
        return currentCrop.url;
      case 'variations':
        return currentVariation.url;
      default:
        return asset.originalUrl;
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* BACK BAR & TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {asset.assetType}
              </span>
              <span className="text-xs text-slate-400 font-mono">Project: {asset.projectName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {asset.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleCopyUrl(getDisplayedImageUrl())}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copiedUrl ? 'Copied URL!' : 'Copy Cloudinary URL'}</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={getDisplayedImageUrl()}
            target="_blank"
            download={`${asset.name.toLowerCase().replace(/\s+/g, '_')}.png`}
            onClick={triggerConfetti}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </motion.a>
        </div>
      </motion.div>

      {/* HACKATHON ASSET PACK BANNER (IF PACK FLOW) */}
      <AnimatePresence>
        {isPackFlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border border-purple-500/40 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Asset Pack Generated Successfully!</h3>
                <p className="text-xs text-purple-200">
                  Cloudinary processed synchronized transparent sprites, 512×512 dialogue cards, and 256×256 inventory icons.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold whitespace-nowrap">
              3 Assets Ready
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: IMAGE DISPLAY STUDIO */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TRANSFORM TABS */}
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1.5 text-xs font-bold backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Original AI</span>
            </button>

            <button
              onClick={() => setActiveTab('bg_removal')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'bg_removal'
                  ? 'bg-slate-800 text-pink-400 border border-pink-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>BG Removal</span>
            </button>

            <button
              onClick={() => setActiveTab('smart_crop')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'smart_crop'
                  ? 'bg-slate-800 text-purple-400 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Smart Crop</span>
            </button>

            <button
              onClick={() => setActiveTab('variations')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'variations'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Variations</span>
            </button>

            <button
              onClick={() => setActiveTab('higgsfield')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'higgsfield'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/50 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Higgsfield AI Motion 🔥</span>
            </button>

            <button
              onClick={() => setActiveTab('depth_3d')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'depth_3d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Hologram ✨</span>
            </button>

            <button
              onClick={() => setActiveTab('game_hud')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'game_hud'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
              <span>HUD Sandbox ✨</span>
            </button>

            <button
              onClick={() => setActiveTab('engine_code')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'engine_code'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Engine Export 📦</span>
            </button>
          </div>

          {/* MAIN CANVAS BOX */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center justify-center min-h-[420px] shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {activeTab === 'higgsfield' ? (
              <HiggsfieldMotionStudio assetName={asset.name} originalImageUrl={asset.originalUrl} />
            ) : activeTab === 'depth_3d' ? (
              <Hologram3DViewer imageUrl={getDisplayedImageUrl()} assetName={asset.name} />
            ) : activeTab === 'game_hud' ? (
              <GameHudSimulator imageUrl={getDisplayedImageUrl()} assetName={asset.name} assetType={asset.assetType} />
            ) : activeTab === 'engine_code' ? (
              <MultiEngineExportStudio asset={asset} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${selectedCropIndex}-${selectedVariationIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative group max-w-full flex flex-col items-center"
                >
                  {/* Background grid pattern if BG removal tab */}
                  {activeTab === 'bg_removal' && (
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none rounded-xl" />
                  )}

                  <img
                    src={getDisplayedImageUrl()}
                    alt={asset.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1024&q=80&auto=format&fit=crop';
                    }}
                    className={`rounded-2xl object-contain max-h-[380px] shadow-2xl transition-all duration-300 ${
                      activeTab === 'smart_crop' && selectedCropIndex > 0 ? 'w-[240px] h-[240px] object-cover ring-2 ring-purple-500/50' : 'w-full'
                    }`}
                  />
                  <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-400">
                    Cloudinary: f_auto,q_auto
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

          </div>

          {/* TAB SPECIFIC SUB-CONTROLS */}
          {activeTab === 'smart_crop' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Select Smart Gravity Crop Resolution:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {asset.smartCrops.map((crop, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedCropIndex === idx
                        ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-white font-extrabold">{crop.label}</p>
                    <p className="text-[11px] text-purple-400 font-mono mt-0.5">{crop.dimensions}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{crop.useCase}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'variations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Select Generative AI Variation:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {asset.variations.map((varItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedVariationIndex === idx
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-white font-extrabold">{varItem.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">{varItem.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* RIGHT: METADATA, CLOUDINARY AI TAGS & ACTIONS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ASSET SPECS CARD */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 backdrop-blur-xl"
          >
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Asset Metadata & Pipeline
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Cloudinary Public ID</span>
                <span className="font-mono text-cyan-300">{asset.cloudinaryPublicId}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Master Dimensions</span>
                <span className="font-mono text-white">{asset.width} × {asset.height} px</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Format & Quality</span>
                <span className="font-mono text-emerald-400 font-bold">PNG / f_auto,q_auto</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Art Style Preset</span>
                <span className="font-bold text-purple-300">{asset.style}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Higgsfield AI Engine</span>
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" /> 60 FPS Video Motion Ready
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-400">Target Engine</span>
                <span className="font-bold text-cyan-400">Unity / Unreal / Godot</span>
              </div>
            </div>

            {/* PROMPT BOX */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Visual Prompt
              </span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                "{asset.prompt}"
              </div>
            </div>
          </motion.div>

          {/* CLOUDINARY AI VISION TAGS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                Cloudinary AI Vision Tags ({asset.tags.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 backdrop-blur-xl"
          >
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Actions</h3>
            
            <Link
              href={`/generator?project=${asset.projectId}`}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Generate Asset Variation</span>
            </Link>

            <Link
              href="/library"
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Browse All Project Assets</span>
            </Link>
          </motion.div>

        </div>

      </div>

    </main>
  );
}

export default function AssetDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading Asset Studio...
        </div>
      }>
        <AssetDetailContent />
      </Suspense>
      <Footer />
    </div>
  );
}
