'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, RefreshCw, Zap, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayableGameSandboxProps {
  imageUrl: string;
  assetName: string;
}

export default function PlayableGameSandbox({ imageUrl, assetName }: PlayableGameSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Game state
    const player = {
      x: 80,
      y: 180,
      width: 48,
      height: 48,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 'right'
    };

    const gravity = 0.6;
    const speed = 4.5;
    const jumpPower = -12;

    const keys: Record<string, boolean> = {};

    // Platforms
    const platforms = [
      { x: 0, y: 260, w: 600, h: 40 },
      { x: 180, y: 190, w: 120, h: 16 },
      { x: 360, y: 130, w: 140, h: 16 }
    ];

    // Collectible Coins
    let coins = [
      { x: 220, y: 155, radius: 8, collected: false },
      { x: 400, y: 95, radius: 8, collected: false },
      { x: 450, y: 95, radius: 8, collected: false }
    ];

    // Projectile Lasers
    let lasers: { x: number; y: number; vx: number }[] = [];

    // Load character image
    const charImg = new Image();
    charImg.crossOrigin = 'anonymous';
    charImg.src = imageUrl;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (['w', 'arrowup', ' '].includes(e.key.toLowerCase()) && player.isGrounded) {
        player.vy = jumpPower;
        player.isGrounded = false;
      }
      if (['f', 'z', 'control'].includes(e.key.toLowerCase())) {
        lasers.push({
          x: player.x + (player.facing === 'right' ? player.width : 0),
          y: player.y + player.height / 2,
          vx: player.facing === 'right' ? 10 : -10
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main Game Loop
    const gameLoop = () => {
      // Input processing
      player.vx = 0;
      if (keys['a'] || keys['arrowleft']) {
        player.vx = -speed;
        player.facing = 'left';
      }
      if (keys['d'] || keys['arrowright']) {
        player.vx = speed;
        player.facing = 'right';
      }

      // Gravity & Velocity
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // Boundaries
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

      // Platform collisions
      player.isGrounded = false;
      for (const plat of platforms) {
        if (
          player.x < plat.x + plat.w &&
          player.x + player.width > plat.x &&
          player.y + player.height >= plat.y &&
          player.y + player.height - player.vy <= plat.y
        ) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.isGrounded = true;
        }
      }

      // Coin collection check
      for (const coin of coins) {
        if (!coin.collected) {
          const dx = player.x + player.width / 2 - coin.x;
          const dy = player.y + player.height / 2 - coin.y;
          if (Math.sqrt(dx * dx + dy * dy) < player.width / 2 + coin.radius) {
            coin.collected = true;
            setScore((s) => s + 100);
            setCoinsCollected((c) => c + 1);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
          }
        }
      }

      // Update Lasers
      lasers = lasers.filter((l) => {
        l.x += l.vx;
        return l.x >= 0 && l.x <= canvas.width;
      });

      // Clear Canvas
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Platforms
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      for (const plat of platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      }

      // Draw Coins
      for (const coin of coins) {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Lasers
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      for (const l of lasers) {
        ctx.fillRect(l.x, l.y, 14, 4);
      }
      ctx.shadowBlur = 0;

      // Draw Player Asset
      ctx.save();
      if (player.facing === 'left') {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(charImg, 0, 0, player.width, player.height);
      } else {
        ctx.drawImage(charImg, player.x, player.y, player.width, player.height);
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  return (
    <div className="w-full space-y-4">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Gamepad2 className="w-4 h-4" />
          <span>Interactive Playable Mini-Game Sandbox (Play as Your AI Asset!)</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Score: {score}
          </span>
          <span className="text-cyan-400 font-bold">Coins: {coinsCollected}</span>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="relative w-full h-[340px] rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/20">
              <Gamepad2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Playable 2D Game Sandbox</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Control <strong className="text-cyan-400">{assetName}</strong> directly inside a live WebGL 2D physics game!
              </p>
            </div>

            <button
              onClick={() => setGameStarted(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>🎮 Start Game (Use WASD / Arrow Keys)</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <canvas ref={canvasRef} width={600} height={300} className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-slate-400 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <span>Controls: [A/D] Move • [W/Space] Jump • [F] Shoot Laser</span>
              <button
                onClick={() => setGameStarted(false)}
                className="text-cyan-400 font-bold hover:underline"
              >
                Reset Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
