'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { Volume2, VolumeX, ShieldCheck, UserCheck, Sparkles, Zap, Heart } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface HeaderProps {
  playerName: string;
  planetProgress: number;
  totalEnergyEarned: number;
  lifeEnergy: number;
  onOpenTeacher: () => void;
  onOpenDashboard?: () => void;
  currentView: string;
}

export function Header({
  playerName,
  planetProgress,
  totalEnergyEarned,
  lifeEnergy,
  onOpenTeacher,
  onOpenDashboard,
  currentView,
}: HeaderProps) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleAudio = () => {
    const nextState = SoundFX.toggleSound();
    setIsMuted(!nextState);
    if (nextState) {
      SoundFX.click();
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto mb-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl shadow-black/50">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              SoundFX.click();
              if (onOpenDashboard) onOpenDashboard();
            }}
            className="flex items-center gap-2.5 text-right group transition-transform active:scale-95"
            title="بازگشت به عرشه فرماندهی"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 via-sky-200 to-white">
                سفینه امید · آکادمی کهکشان
              </h1>
              <p className="text-xs text-slate-400">سامانه یادگیری تعاملی چالش‌های ریاضی</p>
            </div>
          </button>
        </div>

        {/* Center / User info + Energy Metrics */}
        {playerName && (
          <div className="flex flex-wrap items-center gap-2.5 text-xs md:text-sm">
            {/* Player badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>مهندس:</span>
              <strong className="text-white font-medium">{playerName}</strong>
            </div>

            {/* Total Energy Earned (Top requirement) */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-sm"
              title="مجموع کل انرژی حیات کسب‌شده از زمان شروع"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>انرژی کل:</span>
              <strong className="text-amber-200 font-mono font-bold tabular-nums">
                {toPersianDigits(totalEnergyEarned)}
              </strong>
            </div>

            {/* Current Spendable Life Energy */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-sm"
              title="انرژی حیات در دسترس برای سرسبز کردن سیاره"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>انرژی حیات:</span>
              <strong className="text-emerald-300 font-mono font-bold tabular-nums">
                {toPersianDigits(lifeEnergy)}
              </strong>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            title={isMuted ? 'فعال‌سازی صدا' : 'قطع صدا'}
            aria-label="کنترل صدا"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Teacher Dashboard Direct Button (Password removed as requested) */}
          <button
            onClick={() => {
              SoundFX.click();
              onOpenTeacher();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 hover:text-white transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>داشبورد معلم</span>
          </button>
        </div>
      </div>
    </header>
  );
}
