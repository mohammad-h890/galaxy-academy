'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Check, Cog, Zap } from 'lucide-react';

interface RatiosModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

interface RatioQuestion {
  r: number;
  b: number;
  t: number;
  multiplier: number;
  type: 1 | 2;
}

const TOTAL_STAGES = 15;

export function RatiosModule({
  onBack,
  onComplete,
  onCorrectAnswer,
  onLogMistake,
}: RatiosModuleProps) {
  const [slide, setSlide] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [score, setScore] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const [q, setQ] = useState<RatioQuestion>({ r: 2, b: 3, t: 5, multiplier: 4, type: 1 });
  const [ansR, setAnsR] = useState('');
  const [ansB, setAnsB] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      text: 'در آزمایشگاه سوخت سفینه امید، واکنش‌های مولکولی دقیقاً بر اساس نسبت اجزا به یکدیگر تنظیم می‌شوند.',
      tip: 'نسبت یعنی میزان هر ماده نسبت به ماده دیگر یا نسبت به کل ترکیب.',
      mood: 'happy' as const,
    },
    {
      text: 'هشدار حیاتی: بزرگ‌ترین اشتباه، جمع کردن است! اگر ماده آبی ۵ واحد زیاد شود، نباید به ماده قرمز هم ۵ واحد اضافه کنی! رابطه در تناسب همواره «ضربی» (چند برابر شدن) است نه جمعی.',
      tip: 'رابطه جدول تناسب همواره ضربی است: ضریب چند برابری را بیاب!',
      mood: 'warning' as const,
    },
    {
      text: 'ابتدا بررسی کن کدام عدد چند برابر شده است. سپس همان ضریب ضرب را برای سایر ستون‌ها و سطرها اعمال کن تا چرخ‌دنده‌ها با سرعت یکسان بچرخند.',
      tip: 'اگر یک جز ۳ برابر شود، تمام اجزا و کل ترکیب نیز ۳ برابر می‌شوند.',
      mood: 'excited' as const,
    },
  ];

  const generateQuestion = () => {
    let r = Math.floor(Math.random() * 4) + 2;
    let b = Math.floor(Math.random() * 4) + 3;
    if (r === b) b++;
    const t = r + b;
    const multiplier = Math.floor(Math.random() * 5) + 3;
    const type = Math.random() > 0.5 ? 1 : 2;

    setQ({ r, b, t, multiplier, type });
    setAnsR('');
    setAnsB('');
    setFeedback(null);
    setIsSpinning(false);
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestion();
  };

  const checkAnswer = () => {
    const rawR = parseInt(toEnglishNumber(ansR), 10);
    const rawB = parseInt(toEnglishNumber(ansB), 10);

    const userR = isNaN(rawR) ? 0 : rawR;
    const userB = isNaN(rawB) ? 0 : rawB;

    const expectedR = q.r * q.multiplier;
    const expectedB = q.b * q.multiplier;

    let isCorrect = false;
    if (q.type === 1) {
      isCorrect = userR === expectedR;
    } else {
      isCorrect = userR === expectedR && userB === expectedB;
    }

    if (isCorrect) {
      SoundFX.gearSpin();
      setIsSpinning(true);

      setTimeout(() => {
        SoundFX.success();
        SoundFX.lifeEnergy();
        const newScore = score + 1;
        setScore(newScore);

        onCorrectAnswer(20);
        setShowCelebration(true);

        setFeedback({
          type: 'success',
          message: `چرخ‌دنده‌ها متوازن شدند! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت ثبت شد.`,
        });

        if (newScore >= TOTAL_STAGES) {
          setTimeout(() => {
            onComplete();
          }, 1500);
        } else {
          setTimeout(() => {
            generateQuestion();
          }, 1600);
        }
      }, 1100);
    } else {
      SoundFX.error();
      onLogMistake();
      setFeedback({
        type: 'error',
        message: `نسبت نامتعادل است! بررسی کن عدد پایه چند برابر شده است (${toPersianDigits(q.multiplier)} برابر)، سپس همان ضرب را انجام بده (از جمع کردن دوری کن).`,
      });
    }
  };

  const targetB = q.b * q.multiplier;
  const targetT = q.t * q.multiplier;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            SoundFX.click();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به عرشه</span>
        </button>

        {inGame && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>پاداش: +۲۰ انرژی</span>
            </div>

            <div className="px-4 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      <div
        className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at top left, rgba(168, 85, 247, 0.12), transparent 50%)',
        }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">
          آزمایشگاه: رآکتور تناسب سوخت (جداول تناسب - ۱۵ مرحله)
        </h2>

        {!inGame ? (
          <div className="space-y-6">
            <RobotGuide
              message={lessonSlides[slide].text}
              mood={lessonSlides[slide].mood}
              size="md"
            />

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-sm text-cyan-300">
              💡 {lessonSlides[slide].tip}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={slide === 0}
                onClick={() => {
                  SoundFX.click();
                  setSlide((s) => Math.max(0, s - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                اسلاید قبلی
              </button>

              <div className="flex gap-2">
                {lessonSlides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === slide ? 'bg-cyan-400 w-6 shadow-sm shadow-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {slide < lessonSlides.length - 1 ? (
                <button
                  onClick={() => {
                    SoundFX.click();
                    setSlide((s) => s + 1);
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all"
                >
                  اسلاید بعدی
                </button>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ورود به آزمایشگاه تناسب</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 leading-relaxed text-sm md:text-base">
              {q.type === 1 ? (
                <span>
                  نسبت استاندارد سوخت سفینه: به ازای هر{' '}
                  <strong className="text-cyan-400">{toPersianDigits(q.b)} واحد ماده آبی</strong>، باید{' '}
                  <strong className="text-rose-400">{toPersianDigits(q.r)} واحد ماده قرمز</strong> ترکیب شود.
                  اگر اکنون <strong className="text-amber-300 font-bold">{toPersianDigits(targetB)} واحد ماده آبی</strong> داشته باشیم، به چند واحد ماده قرمز نیاز داریم؟
                </span>
              ) : (
                <span>
                  نسبت ترکیب: <strong className="text-rose-400">{toPersianDigits(q.r)} واحد ماده قرمز</strong> و{' '}
                  <strong className="text-cyan-400">{toPersianDigits(q.b)} واحد ماده آبی</strong> تولید{' '}
                  <strong className="text-emerald-400">{toPersianDigits(q.t)} واحد سوخت کل</strong> می‌کند.
                  برای تولید <strong className="text-amber-300 font-bold">{toPersianDigits(targetT)} واحد سوخت کل</strong>، از هر ماده چقدر نیاز داریم؟
                </span>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/90 border border-purple-500/40 space-y-6">
              <div className="flex items-center justify-around flex-wrap gap-4 py-2">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-rose-300 font-medium">ماده قرمز</span>
                  <div
                    className={`relative w-20 h-20 rounded-full border-4 border-dashed border-rose-500 bg-rose-950/60 flex items-center justify-center text-rose-200 font-mono font-bold text-xl transition-transform duration-700 ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                  >
                    <Cog className="w-10 h-10 text-rose-400/40 absolute" />
                    <span className="z-10">{toPersianDigits(isSpinning ? q.r * q.multiplier : q.r)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-cyan-300 font-medium">ماده آبی</span>
                  <div
                    className={`relative w-20 h-20 rounded-full border-4 border-dashed border-cyan-500 bg-cyan-950/60 flex items-center justify-center text-cyan-200 font-mono font-bold text-xl transition-transform duration-700 ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                  >
                    <Cog className="w-10 h-10 text-cyan-400/40 absolute" />
                    <span className="z-10">{toPersianDigits(isSpinning ? targetB : q.b)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-purple-300 font-medium">سوخت کل</span>
                  <div
                    className={`relative w-24 h-24 rounded-full border-4 border-dashed border-purple-500 bg-purple-950/60 flex items-center justify-center text-purple-200 font-mono font-bold text-2xl transition-transform duration-700 ${
                      isSpinning ? 'animate-spin' : ''
                    }`}
                  >
                    <Cog className="w-12 h-12 text-purple-400/40 absolute" />
                    <span className="z-10">{toPersianDigits(isSpinning ? targetT : q.t)}</span>
                  </div>
                </div>
              </div>

              {/* Ratio Table */}
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-center border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 border border-slate-700 text-slate-300">
                      <th className="p-3 border border-slate-700">ماده قرمز</th>
                      <th className="p-3 border border-slate-700">ماده آبی</th>
                      <th className="p-3 border border-slate-700">سوخت کل (مجموع)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-900/60 border border-slate-800 text-slate-300 font-mono">
                      <td className="p-3 border border-slate-800">{toPersianDigits(q.r)}</td>
                      <td className="p-3 border border-slate-800">{toPersianDigits(q.b)}</td>
                      <td className="p-3 border border-slate-800 text-purple-300 font-bold">{toPersianDigits(q.t)}</td>
                    </tr>
                    <tr className="bg-slate-950 border border-slate-800">
                      <td className="p-3 border border-slate-800">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="قرمز؟"
                          value={ansR}
                          onChange={(e) => setAnsR(e.target.value)}
                          className="w-24 h-10 text-center font-bold text-base bg-slate-900 border border-rose-500/60 rounded-lg text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </td>

                      <td className="p-3 border border-slate-800">
                        {q.type === 1 ? (
                          <span className="text-amber-400 font-mono text-xl font-bold">
                            {toPersianDigits(targetB)}
                          </span>
                        ) : (
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="آبی؟"
                            value={ansB}
                            onChange={(e) => setAnsB(e.target.value)}
                            className="w-24 h-10 text-center font-bold text-base bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        )}
                      </td>

                      <td className="p-3 border border-slate-800">
                        {q.type === 1 ? (
                          <span className="text-slate-500">-</span>
                        ) : (
                          <span className="text-amber-400 font-mono text-xl font-bold">
                            {toPersianDigits(targetT)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={checkAnswer}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>تولید سوخت متوازن</span>
                </button>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-2xl text-center text-sm font-semibold border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
        )}
      </div>

      <CelebrationOverlay
        show={showCelebration}
        message="فرمول سوخت متوازن شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
