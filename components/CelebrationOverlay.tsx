'use client';

import React, { useEffect } from 'react';
import { Zap, Heart, CheckCircle2, Star } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface CelebrationOverlayProps {
  show: boolean;
  message?: string;
  energyGained?: number;
  onDone?: () => void;
}

// Static deterministic particle coordinates to maintain pure rendering
const PARTICLE_PRESETS = [
  { x: 15, y: 22, size: 18, color: '#00f0ff', delay: 0.05 },
  { x: 25, y: 48, size: 22, color: '#39ff14', delay: 0.1 },
  { x: 38, y: 15, size: 14, color: '#ffd700', delay: 0.15 },
  { x: 50, y: 28, size: 24, color: '#ff00ff', delay: 0.02 },
  { x: 62, y: 18, size: 16, color: '#38bdf8', delay: 0.2 },
  { x: 75, y: 35, size: 20, color: '#a855f7', delay: 0.08 },
  { x: 85, y: 20, size: 14, color: '#39ff14', delay: 0.18 },
  { x: 18, y: 70, size: 20, color: '#ffd700', delay: 0.12 },
  { x: 30, y: 82, size: 16, color: '#00f0ff', delay: 0.22 },
  { x: 45, y: 72, size: 26, color: '#39ff14', delay: 0.04 },
  { x: 60, y: 80, size: 18, color: '#ff00ff', delay: 0.16 },
  { x: 72, y: 68, size: 22, color: '#38bdf8', delay: 0.14 },
  { x: 84, y: 78, size: 15, color: '#ffd700', delay: 0.25 },
  { x: 12, y: 45, size: 19, color: '#a855f7', delay: 0.06 },
  { x: 88, y: 52, size: 21, color: '#00f0ff', delay: 0.11 },
];

export function CelebrationOverlay({
  show,
  message = 'پاسخ کاملاً درسته مهندس!',
  energyGained = 20,
  onDone,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onDone) onDone();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Soft animated backdrop flash */}
      <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[2px] animate-fadeIn transition-opacity duration-300" />

      {/* Floating Sparkle Particles */}
      {PARTICLE_PRESETS.map((p, idx) => (
        <div
          key={idx}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: '1.2s',
            animationDelay: `${p.delay}s`,
          }}
        >
          <Star
            style={{ width: `${p.size}px`, height: `${p.size}px`, color: p.color, fill: p.color }}
            className="filter drop-shadow-[0_0_8px_currentColor]"
          />
        </div>
      ))}

      {/* Center Celebration Banner Card */}
      <div className="relative px-8 py-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)] text-center animate-bounce-subtle max-w-sm mx-4">
        {/* Glowing badge */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/40">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
          {message}
        </h3>

        {/* Life Energy Rewarded */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-sm font-bold shadow-inner">
          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>+{toPersianDigits(energyGained)} انرژی حیات سیاره دریافت شد!</span>
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
