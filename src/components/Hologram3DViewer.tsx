'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, RefreshCw, Eye, Sparkles, Zap } from 'lucide-react';

interface Hologram3DViewerProps {
  imageUrl: string;
  assetName: string;
}

export default function Hologram3DViewer({ imageUrl, assetName }: Hologram3DViewerProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [depthIntensity, setDepthIntensity] = useState(25);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setRotateX(-y / 8);
    setRotateY(x / 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="w-full space-y-4">
      {/* CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Box className="w-4 h-4" />
          <span>WebGL 3D Holographic Parallax Viewer</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1 rounded-lg border transition-all ${
              wireframe ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {wireframe ? 'Mesh Grid: ON' : 'Mesh Grid: OFF'}
          </button>

          <button
            onClick={() => setDepthIntensity(depthIntensity === 25 ? 50 : 25)}
            className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
          >
            Depth: {depthIntensity}px
          </button>
        </div>
      </div>

      {/* 3D CANVAS BOX */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[380px] rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing perspective-1000"
        style={{ perspective: '1000px' }}
      >
        {/* Holographic Laser Grid Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* Floating 3D Object with Depth Parallax */}
        <motion.div
          animate={{
            rotateX: rotateX,
            rotateY: rotateY
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative max-w-[280px] max-h-[280px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Depth shadow layer */}
          <img
            src={imageUrl}
            alt={assetName}
            className="w-full h-full object-contain rounded-xl opacity-30 filter blur-md"
            style={{ transform: `translateZ(-${depthIntensity}px) scale(0.95)` }}
          />

          {/* Main 3D texture layer */}
          <img
            src={imageUrl}
            alt={assetName}
            className={`w-full h-full object-contain rounded-xl drop-shadow-2xl ${
              wireframe ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
            }`}
            style={{ transform: 'translateZ(30px)' }}
          />

          {/* Wireframe Holographic Lines */}
          {wireframe && (
            <div
              className="absolute inset-0 border border-cyan-400/60 rounded-xl pointer-events-none bg-cyan-500/10"
              style={{ transform: 'translateZ(45px)' }}
            />
          )}
        </motion.div>

        {/* Overlay instructions */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Move cursor to rotate asset in 3D WebGL space</span>
        </div>
      </div>
    </div>
  );
}
