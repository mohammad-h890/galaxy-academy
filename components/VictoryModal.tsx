'use client';

import React, { useEffect } from 'react';
import { SoundFX } from '@/lib/sound';
import { Award, Sparkles, X, Check } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export function VictoryModal({ isOpen, onClose, playerName }: VictoryModalProps) {
  useEffect(() => {
    if (isOpen) {
      SoundFX.victory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-400 p-8 text-center text-slate-100 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
        {/* Close Button */}
        <button
          onClick={() => {
            SoundFX.click();
            onClose();
          }}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Golden Trophy Crest SVG */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative drop-shadow-xl animate-bounce-subtle">
            {/* Sunburst rays */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="50" cy="50" r="38" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="2.5" />

            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>

            {/* Inner Star */}
            <polygon
              points="50,22 56,36 71,37 59,47 63,62 50,53 37,62 41,47 29,37 44,36"
              fill="#ffffff"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
            />
            {/* Ring details */}
            <circle cx="50" cy="50" r="28" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Victory Headline */}
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 mb-2">
          سیاره امید کاملاً احیا شد!
        </h2>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>نشان عالی «مهندس ارشد کهکشان»</span>
        </div>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
          تبریک ویژه به مهندس <strong className="text-white font-bold">{playerName}</strong>!
          شما با تسلط بر ۵ گلوگاه مفهومی ریاضی (کسرها، اعشار، تناسب، هندسه و زمان)، تمام بخش‌های سفینه امید را بازسازی کرده و حیات را به سیاره کهکشانی بازگرداندید.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => {
              SoundFX.click();
              onClose();
            }}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>مشاهده وضعیت کامل عرشه</span>
          </button>
        </div>
      </div>
    </div>
  );
}
