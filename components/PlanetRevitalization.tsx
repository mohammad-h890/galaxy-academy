'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { toPersianDigits } from '@/lib/utils';
import {
  Sparkles,
  Zap,
  Sprout,
  TreePine,
  Waves,
  CloudRain,
  Flame,
  Check,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface PlanetRevitalizationProps {
  lifeEnergy: number;
  totalEnergyEarned: number;
  planetGreenery: number;
  onInjectEnergy: (amount: number) => void;
}

export function PlanetRevitalization({
  lifeEnergy,
  totalEnergyEarned,
  planetGreenery,
  onInjectEnergy,
}: PlanetRevitalizationProps) {
  const [animatingGrowth, setAnimatingGrowth] = useState(false);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  const handleInfuse = (amount: number, label: string) => {
    if (lifeEnergy < amount) {
      SoundFX.error();
      return;
    }
    SoundFX.terraforming();
    setAnimatingGrowth(true);
    setRecentAction(label);
    onInjectEnergy(amount);

    setTimeout(() => {
      setAnimatingGrowth(false);
    }, 1400);
  };

  // Determine planet visual stage based on greenery
  // 0-25%: Barren cratered rock
  // 26-50%: Water rivers forming, moss patches
  // 51-75%: Growing emerald forests, atmosphere shields
  // 76-100%: Vibrant lush green paradise world with glowing bio-dome
  const stage =
    planetGreenery >= 100
      ? 'بهشت کهکشانی کامل (سرسبز و زنده)'
      : planetGreenery >= 75
      ? 'جنگل‌های بارانی و دشت‌های حاصلخیز'
      : planetGreenery >= 50
      ? 'شکل‌گیری اقیانوس‌ها و پوشش گیاهی'
      : planetGreenery >= 25
      ? 'جوانه‌زنی نخستین گیاهان مقاوم فضایی'
      : 'سیاره خشک و لم‌یزرع (نیازمند انرژی حیات)';

  return (
    <div className="w-full rounded-3xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow matching greenery level */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          backgroundColor:
            planetGreenery > 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.08)',
        }}
      />

      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <span>سامانه انتقال انرژی حیات و سرسبزی سیاره</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              با پاسخ‌های صحیح انرژی حیات کسب کنید و آن را برای احیای اکوسیستم سیاره تزریق نمایید.
            </p>
          </div>
        </div>

        {/* Current spendable balance */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 shadow-inner">
          <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[11px] text-emerald-300/80 block">انرژی حیات در دسترس:</span>
            <strong className="text-emerald-300 font-mono text-lg font-bold tabular-nums">
              {toPersianDigits(lifeEnergy)} واحد
            </strong>
          </div>
        </div>
      </div>

      {/* Grid: Planet Visual Hologram + Restoration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Planet Graphic & Visual Transformation (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
          <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
            {/* Atmosphere Aura Glow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${
                planetGreenery >= 75
                  ? 'bg-emerald-400/30'
                  : planetGreenery >= 40
                  ? 'bg-cyan-400/20'
                  : 'bg-amber-600/15'
              }`}
            />

            {/* Orbit Ring */}
            <div className="absolute inset-[-14px] rounded-full border border-cyan-500/30 border-dashed animate-spin [animation-duration:40s] pointer-events-none" />

            {/* Planet Sphere Graphic (SVG) */}
            <svg
              viewBox="0 0 100 100"
              className={`w-full h-full relative drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] transition-transform duration-700 ${
                animatingGrowth ? 'scale-105' : 'scale-100'
              }`}
            >
              <defs>
                {/* Dynamic Base Planet Gradient */}
                <radialGradient id="planetGlow" cx="40%" cy="35%" r="65%">
                  <stop
                    offset="0%"
                    stopColor={
                      planetGreenery >= 70
                        ? '#34d399'
                        : planetGreenery >= 40
                        ? '#38bdf8'
                        : '#fbbf24'
                    }
                  />
                  <stop
                    offset="45%"
                    stopColor={
                      planetGreenery >= 70
                        ? '#059669'
                        : planetGreenery >= 40
                        ? '#0284c7'
                        : '#b45309'
                    }
                  />
                  <stop
                    offset="85%"
                    stopColor={
                      planetGreenery >= 70
                        ? '#064e3b'
                        : planetGreenery >= 40
                        ? '#0c4a6e'
                        : '#451a03'
                    }
                  />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                <clipPath id="planetClip">
                  <circle cx="50" cy="50" r="46" />
                </clipPath>
              </defs>

              {/* Main Planet Body */}
              <circle cx="50" cy="50" r="46" fill="url(#planetGlow)" />

              {/* Continents / Vegetation Layers with Greenery Expansion */}
              <g clipPath="url(#planetClip)">
                {/* Dry Craters (Fade out as greenery increases) */}
                <g
                  style={{
                    opacity: Math.max(0.1, (100 - planetGreenery) / 100),
                    transition: 'opacity 1s',
                  }}
                >
                  <circle cx="35" cy="40" r="8" fill="#78350f" opacity="0.4" />
                  <circle cx="68" cy="30" r="11" fill="#78350f" opacity="0.4" />
                  <circle cx="45" cy="70" r="14" fill="#78350f" opacity="0.3" />
                  <circle cx="70" cy="65" r="7" fill="#78350f" opacity="0.4" />
                </g>

                {/* Ocean and Water Rivers Layer */}
                <path
                  d="M 10 40 Q 30 25 50 45 T 90 40 L 95 65 Q 60 85 30 65 Z"
                  fill="#0284c7"
                  style={{
                    opacity: Math.min(1, Math.max(0.1, planetGreenery / 40)),
                    transition: 'opacity 1s',
                  }}
                />

                {/* Lush Emerald Forests and Vegetation Overlay */}
                <g
                  style={{
                    opacity: Math.min(1, planetGreenery / 70),
                    transition: 'opacity 1.2s',
                  }}
                >
                  {/* Continent 1 */}
                  <path
                    d="M 20 30 Q 35 15 55 25 Q 65 40 45 50 Q 25 45 20 30 Z"
                    fill="#10b981"
                    opacity="0.85"
                  />
                  {/* Continent 2 */}
                  <path
                    d="M 40 60 Q 60 50 78 65 Q 70 85 50 82 Q 35 75 40 60 Z"
                    fill="#059669"
                    opacity="0.9"
                  />
                  {/* Island Groves */}
                  <circle cx="75" cy="35" r="6" fill="#34d399" opacity="0.8" />
                  <circle cx="28" cy="65" r="5" fill="#34d399" opacity="0.8" />
                </g>

                {/* Atmospheric Cloud Swirls */}
                <path
                  d="M 5 35 Q 25 30 45 38 T 85 35 Q 95 40 85 45 T 45 42 Q 15 45 5 35 Z"
                  fill="#ffffff"
                  opacity={planetGreenery > 30 ? 0.35 : 0.15}
                  className="animate-pulse"
                />
                <path
                  d="M 15 70 Q 35 60 65 72 T 95 68 Q 80 78 50 75 Z"
                  fill="#ffffff"
                  opacity={planetGreenery > 50 ? 0.3 : 0.1}
                />
              </g>

              {/* Specular Highlight Arc */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Glowing Terraforming Ring Animation */}
            {animatingGrowth && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Greenery Status Label */}
          <div className="mt-4">
            <span className="text-xs text-slate-400 block mb-1">وضعیت بیولوژیکی سیاره:</span>
            <span className="text-sm md:text-base font-bold text-emerald-400">
              {stage}
            </span>
          </div>
        </div>

        {/* Right / Controls & Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Greenery Percentage Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span>شاخص سرسبزی و حیات بیولوژیک:</span>
              </span>
              <strong className="text-emerald-400 font-mono text-base font-bold tabular-nums">
                ٪{toPersianDigits(planetGreenery)}
              </strong>
            </div>

            <div className="w-full h-5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-md shadow-emerald-500/30"
                style={{ width: `${planetGreenery}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>۰٪ کویر بی‌آب</span>
              <span>۵۰٪ جوانه‌زنی مراتع</span>
              <span>۱۰۰٪ پوشش سبز کامل</span>
            </div>
          </div>

          {/* Life Energy Injection Actions */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-cyan-300">
              عملیات‌های قابل اجرا با مصرف انرژی حیات:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: 20 energy */}
              <button
                disabled={lifeEnergy < 20 || planetGreenery >= 100}
                onClick={() => handleInfuse(20, 'کاشت بذرها و مراتع سبز')}
                className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-right transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    ۲۰ انرژی ⚡
                  </span>
                </div>
                <div className="text-xs font-bold text-white mb-0.5">کاشت مراتع سبز</div>
                <div className="text-[10px] text-slate-400">+۵٪ سرسبزی سیاره</div>
              </button>

              {/* Option 2: 50 energy */}
              <button
                disabled={lifeEnergy < 50 || planetGreenery >= 100}
                onClick={() => handleInfuse(50, 'باران مصنوعی و احیای رودها')}
                className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-400 text-right transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CloudRain className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-bold text-teal-300">
                    ۵۰ انرژی ⚡
                  </span>
                </div>
                <div className="text-xs font-bold text-white mb-0.5">باران و احیای رودها</div>
                <div className="text-[10px] text-slate-400">+۱۵٪ سرسبزی سیاره</div>
              </button>

              {/* Option 3: 100 energy */}
              <button
                disabled={lifeEnergy < 100 || planetGreenery >= 100}
                onClick={() => handleInfuse(100, 'پرورش جنگل‌های کهکشانی و جو اکسیژن')}
                className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-right transition-all disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <TreePine className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    ۱۰۰ انرژی ⚡
                  </span>
                </div>
                <div className="text-xs font-bold text-white mb-0.5">جنگل‌های کهکشانی</div>
                <div className="text-[10px] text-slate-400">+۳۵٪ سرسبزی سیاره</div>
              </button>
            </div>
          </div>

          {/* Feedback & Recent Action Message */}
          {recentAction && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>عملیات انجام شد: {recentAction}. سیاره زنده‌تر و شاداب‌تر شد!</span>
            </div>
          )}

          {/* Instructional note */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>چگونه انرژی حیات بیشتری بگیرم؟</strong> به بخش‌های عملیاتی سفینه بروید و به سوالات ریاضی پاسخ دهید. با هر پاسخ صحیح، انرژی حیات جدید تولید می‌شود که می‌توانید آن را در این پنل به سرسبزی سیاره تبدیل کنید!
          </div>
        </div>
      </div>
    </div>
  );
}
