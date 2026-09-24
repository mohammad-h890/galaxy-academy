'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Check, Crosshair, Zap } from 'lucide-react';

interface DecimalsModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

const TOTAL_STAGES = 15;

export function DecimalsModule({
  onBack,
  onComplete,
  onCorrectAnswer,
  onLogMistake,
}: DecimalsModuleProps) {
  const [slide, setSlide] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [score, setScore] = useState(0);

  const [num1, setNum1] = useState('12.5');
  const [num2, setNum2] = useState('3.75');
  const [op, setOp] = useState<'+' | '-'>('+');
  const [isAligned, setIsAligned] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      text: 'در سیستم ناوبری سفینه امید، ممیز (نقطه اعشار) مرز بین اعداد کامل و قطعات اعشاری است و موقعیت آن ارزش هر رقم را تعیین می‌کند.',
      tip: 'ممیز = تراز مرکزی که ارزش دهم، صدم و هزارم را تعیین می‌کند.',
      mood: 'happy' as const,
    },
    {
      text: 'بزرگ‌ترین خطای دانش‌آموزان: تراز کردن اعداد از سمت راست، درست مانند اعداد طبیعی! در اعداد اعشاری، ممیزها باید دقیقاً زیر یکدیگر قرار گیرند نه ارقام آخر.',
      tip: 'اشتباه شایع: ۳.۲ + ۱.۴۵ را طوری ننویس که ۲ زیر ۵ بیفتد!',
      mood: 'warning' as const,
    },
    {
      text: 'برای جلوگیری از خطا، با فشردن دکمه «سپر صفر (+۰)»، در سمت راست عددی که رقم اعشار کمتری دارد صفر قرار دهید تا تعداد ارقام اعشار برابر شده و لیزر سبز فعال شود.',
      tip: 'افزودن صفر در انتهای بخش اعشاری، ارزش عدد را تغییر نمی‌دهد (۳.۲ = ۳.۲۰).',
      mood: 'excited' as const,
    },
  ];

  const generateQuestion = () => {
    const nextOp: '+' | '-' = Math.random() > 0.5 ? '+' : '-';
    setOp(nextOp);

    const f1 = Math.floor(Math.random() * 9) + 1; // single decimal
    const f2 = Math.floor(Math.random() * 89) + 10; // two decimals

    let n1 = (Math.floor(Math.random() * 15) + 5) + (Math.random() > 0.5 ? f1 / 10 : f2 / 100);
    let n2 = (Math.floor(Math.random() * 8) + 1) + (n1.toString().split('.')[1]?.length === 1 ? f2 / 100 : f1 / 10);

    if (nextOp === '-' && n1 < n2) {
      const temp = n1;
      n1 = n2;
      n2 = temp;
    }

    setNum1(n1.toString());
    setNum2(n2.toString());
    setIsAligned(false);
    setUserAnswer('');
    setFeedback(null);
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestion();
  };

  const addZero = (target: 1 | 2) => {
    SoundFX.click();
    let updated1 = num1;
    let updated2 = num2;

    if (target === 1) {
      updated1 = num1 + '0';
      setNum1(updated1);
    } else {
      updated2 = num2 + '0';
      setNum2(updated2);
    }

    const dec1 = updated1.split('.')[1]?.length || 0;
    const dec2 = updated2.split('.')[1]?.length || 0;

    if (dec1 === dec2) {
      SoundFX.laserAlign();
      setIsAligned(true);
    }
  };

  const checkAnswer = () => {
    const parsed = parseFloat(toEnglishNumber(userAnswer));
    if (isNaN(parsed)) {
      SoundFX.error();
      setFeedback({ type: 'error', message: 'لطفاً یک عدد اعشاری معتبر وارد کنید.' });
      return;
    }

    const val1 = parseFloat(num1);
    const val2 = parseFloat(num2);
    const correct = op === '+' ? val1 + val2 : val1 - val2;
    const roundedCorrect = Math.round(correct * 1000) / 1000;
    const roundedUser = Math.round(parsed * 1000) / 1000;

    if (Math.abs(roundedUser - roundedCorrect) < 0.001) {
      SoundFX.success();
      SoundFX.lifeEnergy();
      const newScore = score + 1;
      setScore(newScore);

      onCorrectAnswer(20);
      setShowCelebration(true);

      setFeedback({
        type: 'success',
        message: `مختصات کاملاً دقیق تنظیم شد! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت پشت سر گذاشته شد.`,
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
    } else {
      SoundFX.error();
      onLogMistake();
      setFeedback({
        type: 'error',
        message: `محاسبه نادرست است! حاصل درست ${toPersianDigits(roundedCorrect)} بود. دقت کن که دهم‌ها را با دهم‌ها و صدم‌ها را با صدم‌ها محاسبه کنی.`,
      });
    }
  };

  const decLen1 = num1.split('.')[1]?.length || 0;
  const decLen2 = num2.split('.')[1]?.length || 0;

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
          backgroundImage: 'radial-gradient(circle at top center, rgba(14, 165, 233, 0.1), transparent 50%)',
        }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">
          سیستم ناوبری: تراز لیزری ممیزها (اعشار - ۱۵ مرحله)
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
                  <span>ورود به سیستم ناوبری</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center text-sm text-slate-300">
              {isAligned ? (
                <span className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                  <Crosshair className="w-4 h-4" />
                  لیزر روی ممیزها قفل شد! حالا حاصل {op === '+' ? 'جمع' : 'تفریق'} را ثبت کنید.
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  ⚠️ هشدار تراز: تعداد ارقام اعشار برابر نیست. با دکمه «+۰» تعداد ارقام را تراز کنید تا لیزر قفل شود!
                </span>
              )}
            </div>

            {/* Laser Board */}
            <div className="relative max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col items-center gap-6 overflow-hidden">
              <div
                className={`absolute top-0 bottom-0 w-1 transition-all duration-500 ${
                  isAligned
                    ? 'bg-emerald-400 shadow-[0_0_20px_#34d399] z-10 left-1/2 -translate-x-1/2'
                    : 'bg-rose-500 shadow-[0_0_12px_#f43f5e] z-10 left-[48%]'
                }`}
              />

              {/* Row 1 */}
              <div className="flex items-center justify-center gap-3 w-full z-20" dir="ltr">
                <span className="w-6 text-2xl font-bold font-mono text-cyan-400 text-center">
                  {op}
                </span>

                <div className="px-5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-2xl md:text-3xl font-mono text-white tracking-widest min-w-[150px] text-right shadow-inner">
                  {num1}
                </div>

                <button
                  disabled={decLen1 >= decLen2}
                  onClick={() => addZero(1)}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  +۰
                </button>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-center gap-3 w-full z-20" dir="ltr">
                <span className="w-6 text-2xl font-bold font-mono text-transparent text-center">
                  {op}
                </span>

                <div className="px-5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-2xl md:text-3xl font-mono text-white tracking-widest min-w-[150px] text-right shadow-inner">
                  {num2}
                </div>

                <button
                  disabled={decLen2 >= decLen1}
                  onClick={() => addZero(2)}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  +۰
                </button>
              </div>

              <div className="w-48 h-0.5 bg-slate-700 z-20" />

              {/* Input for calculated coordinates */}
              <div className="z-20 w-full flex flex-col items-center gap-3" dir="ltr">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={isAligned ? 'پاسخ اعشاری' : 'ابتدا تراز کنید'}
                  disabled={!isAligned}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-48 h-12 text-center text-xl font-mono font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed placeholder:font-sans placeholder:text-xs"
                />

                <button
                  disabled={!isAligned}
                  onClick={checkAnswer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span className="font-sans">ثبت مختصات در ناوبری</span>
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
        message="مسیر ناوبری تراز شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
