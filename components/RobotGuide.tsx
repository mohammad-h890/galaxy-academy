'use client';

import React from 'react';

interface RobotGuideProps {
  message: string;
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'thinking' | 'excited' | 'warning';
}

export function RobotGuide({ message, size = 'md', mood = 'happy' }: RobotGuideProps) {
  const eyeColor =
    mood === 'warning'
      ? '#ff3366'
      : mood === 'thinking'
      ? '#ffd700'
      : mood === 'excited'
      ? '#39ff14'
      : '#00f0ff';

  const avatarDimensions =
    size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/40">
      {/* Animated Robot SVG */}
      <div className={`relative shrink-0 ${avatarDimensions} animate-bounce-subtle`}>
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative drop-shadow-md">
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="8" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="7" r="5" fill={eyeColor} className="animate-pulse" />

          {/* Ears / Side Thrusters */}
          <rect x="15" y="42" width="7" height="18" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.5" />
          <rect x="78" y="42" width="7" height="18" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.5" />

          {/* Robot Head Body */}
          <rect
            x="20"
            y="22"
            width="60"
            height="56"
            rx="16"
            fill="#0f172a"
            stroke="#00f0ff"
            strokeWidth="2.5"
          />

          {/* Visor Screen */}
          <rect
            x="27"
            y="32"
            width="46"
            height="26"
            rx="10"
            fill="#050a14"
            stroke="#38bdf8"
            strokeWidth="1"
          />

          {/* Expressive Glowing Eyes */}
          {mood === 'happy' && (
            <>
              {/* Curved smiling eye arcs */}
              <path
                d="M 35 46 Q 40 40 45 46"
                stroke={eyeColor}
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 55 46 Q 60 40 65 46"
                stroke={eyeColor}
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}

          {mood === 'excited' && (
            <>
              {/* Star-like or wide round eyes */}
              <circle cx="40" cy="45" r="4.5" fill={eyeColor} />
              <circle cx="60" cy="45" r="4.5" fill={eyeColor} />
              <circle cx="42" cy="43" r="1.5" fill="#fff" />
              <circle cx="62" cy="43" r="1.5" fill="#fff" />
            </>
          )}

          {mood === 'thinking' && (
            <>
              <line x1="34" y1="45" x2="45" y2="45" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="44" r="4" fill={eyeColor} />
            </>
          )}

          {mood === 'warning' && (
            <>
              <line x1="35" y1="42" x2="45" y2="47" stroke={eyeColor} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="65" y1="42" x2="55" y2="47" stroke={eyeColor} strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* Smile / status light */}
          <path
            d="M 44 65 Q 50 69 56 65"
            stroke="#00f0ff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cheeks blush */}
          <circle cx="31" cy="51" r="2.5" fill="#00f0ff" opacity="0.4" />
          <circle cx="69" cy="51" r="2.5" fill="#00f0ff" opacity="0.4" />
        </svg>
      </div>

      {/* Guide Speech */}
      <div className="flex-1 text-sm md:text-base leading-relaxed text-slate-200">
        <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          راهنمای هوشمند سفینه (ربات چیستا):
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
}
