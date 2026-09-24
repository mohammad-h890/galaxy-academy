'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Check, Clock, Calculator, Zap } from 'lucide-react';

interface StatisticsModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

interface StatQuestion {
  mode: 'time' | 'mean';
  h1: number;
  m1: number;
  h2: number;
  m2: number;
  borrowed: boolean;
  count: number;
  mean: number;
}

const TOTAL_STAGES = 15;

export function StatisticsModule({
  onBack,
  onComplete,
  onCorrectAnswer,
  onLogMistake,
}: StatisticsModuleProps) {
  const [slide, setSlide] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [score, setScore] = useState(0);

  const [q, setQ] = useState<StatQuestion>({
    mode: 'time',
    h1: 5,
    m1: 15,
    h2: 2,
    m2: 45,
    borrowed: false,
    count: 4,
    mean: 25,
  });

  const [ansHours, setAnsHours] = useState('');
  const [ansMins, setAnsMins] = useState('');
  const [ansTotal, setAnsTotal] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      text: 'در اتاق فرمان و سیستم زمان‌سنجی سفینه، ساعت در مبنای ۶۰ کار می‌کند: هر ۱ ساعت معادل ۶۰ دقیقه است، نه ۱۰۰ دقیقه!',
      tip: 'اشتباه رایج: هنگام قرض گرفتن از ساعت، به دقایق عدد ۶۰ اضافه می‌شود نه ۱۰۰!',
      mood: 'warning' as const,
    },
    {
      text: 'مفهوم میانگین یعنی سهم مساوی هر واحد. وقتی میانگین تولید هر ژنراتور مشخص است، برای یافتن مجموع کل انرژی تولیدی کافی است میانگین در تعداد ژنراتورها ضرب شود: (مجموع کل = میانگین هر واحد × تعداد).',
      tip: 'اگر میانگین انرژی تولید هر ژنراتور ۲۰ مگاوات باشد، ۴ ژنراتور مجموعاً ۸۰ مگاوات انرژی تولید می‌کنند.',
      mood: 'happy' as const,
    },
  ];

  const generateQuestion = () => {
    const mode = Math.random() > 0.5 ? 'time' : 'mean';

    if (mode === 'time') {
      const h1 = Math.floor(Math.random() * 4) + 4; // 4..7
      const h2 = Math.floor(Math.random() * 2) + 1; // 1..2
      const m1 = Math.floor(Math.random() * 20) + 5; // 5..24
      const m2 = Math.floor(Math.random() * 25) + 30; // 30..54 (m2 > m1)

      setQ({ mode: 'time', h1, m1, h2, m2, borrowed: false, count: 0, mean: 0 });
    } else {
      const count = Math.floor(Math.random() * 4) + 3; // 3..6
      const mean = (Math.floor(Math.random() * 6) + 3) * 5; // 15..45

      setQ({ mode: 'mean', h1: 0, m1: 0, h2: 0, m2: 0, borrowed: false, count, mean });
    }

    setAnsHours('');
    setAnsMins('');
    setAnsTotal('');
    setFeedback(null);
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestion();
  };

  const borrowHour = () => {
    if (!q.borrowed && q.h1 > 0) {
      SoundFX.shatter();
      setQ((prev) => ({
        ...prev,
        h1: prev.h1 - 1,
        m1: prev.m1 + 60,
        borrowed: true,
      }));
    }
  };

  const checkAnswer = () => {
    if (q.mode === 'time') {
      const userH = parseInt(toEnglishNumber(ansHours), 10);
      const userM = parseInt(toEnglishNumber(ansMins), 10);

      if (isNaN(userH) || isNaN(userM)) {
        SoundFX.error();
        setFeedback({ type: 'error', message: 'لطفاً هم ساعت و هم دقیقه را وارد کنید.' });
        return;
      }

      const totalDiffMinutes = q.h1 * 60 + q.m1 - (q.h2 * 60 + q.m2);
      const expectedH = Math.floor(totalDiffMinutes / 60);
      const expectedM = totalDiffMinutes % 60;

      if (userH === expectedH && userM === expectedM) {
        SoundFX.success();
        SoundFX.lifeEnergy();
        const newScore = score + 1;
        setScore(newScore);

        onCorrectAnswer(20);
        setShowCelebration(true);

        setFeedback({
          type: 'success',
          message: `اختلاف زمانی پرواز دقیق محاسبه شد! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت تایید شد.`,
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
          message: `محاسبه زمان اشتباه است! فراموش نکن که با شکستن ۱ ساعت، ۶۰ دقیقه به دقیقه اضافه می‌شود نه ۱۰۰ دقیقه. پاسخ درست: ${toPersianDigits(expectedH)} ساعت و ${toPersianDigits(expectedM)} دقیقه.`,
        });
      }
    } else {
      const userTot = parseInt(toEnglishNumber(ansTotal), 10);

      if (isNaN(userTot)) {
        SoundFX.error();
        setFeedback({ type: 'error', message: 'لطفاً مجموع کل را وارد کنید.' });
        return;
      }

      const expectedTot = q.count * q.mean;

      if (userTot === expectedTot) {
        SoundFX.success();
        SoundFX.lifeEnergy();
        const newScore = score + 1;
        setScore(newScore);

        onCorrectAnswer(20);
        setShowCelebration(true);

        setFeedback({
          type: 'success',
          message: `تحلیل معکوس میانگین تایید شد! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت ثبت شد.`,
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
          message: `مجموع نادرست است! رابطه میانگین: مجموع کل = میانگین هر ژنراتور (${toPersianDigits(q.mean)}) × تعداد (${toPersianDigits(q.count)}) = ${toPersianDigits(expectedTot)} مگاوات.`,
        });
      }
    }
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

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
          backgroundImage: 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.1), transparent 50%)',
        }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">
          اتاق فرمان: محاسبات زمان و میانگین (۱۵ مرحله)
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
                  <span>ورود به اتاق فرمان</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {q.mode === 'time' ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm md:text-base leading-relaxed">
                  مرحله {toPersianDigits(score + 1)}: اختلاف زمان پرواز مداری را محاسبه کنید (در صورت کمبود دقیقه، دکمه شکستن ساعت را بزنید):
                </div>

                <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center gap-6">
                  <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-mono text-cyan-200" dir="ltr">
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40">
                      {q.h1}:{padZero(q.m1)}
                    </div>
                    <span className="text-rose-400 font-bold">−</span>
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40">
                      {q.h2}:{padZero(q.m2)}
                    </div>
                  </div>

                  <button
                    disabled={q.borrowed}
                    onClick={borrowHour}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-amber-300 border border-amber-500/40 text-xs md:text-sm font-semibold transition-all active:scale-95"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>⚙️ شکستن ۱ ساعت به ۶۰ دقیقه (قرض گرفتن)</span>
                  </button>

                  <div className="flex items-center justify-center gap-3" dir="ltr">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="ساعت"
                      value={ansHours}
                      onChange={(e) => setAnsHours(e.target.value)}
                      className="w-20 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-xs placeholder:font-sans"
                    />
                    <span className="text-2xl font-bold text-slate-400">:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="دقیقه"
                      value={ansMins}
                      onChange={(e) => setAnsMins(e.target.value)}
                      className="w-20 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-xs placeholder:font-sans"
                    />
                  </div>

                  <button
                    onClick={checkAnswer}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>ثبت زمان در سامانه</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm md:text-base leading-relaxed">
                  مرحله {toPersianDigits(score + 1)}: اگر میانگین انرژی تولید هر ژنراتور{' '}
                  <strong className="text-emerald-400">{toPersianDigits(q.mean)} مگاوات</strong> باشد،{' '}
                  <strong className="text-cyan-400">{toPersianDigits(q.count)} ژنراتور</strong> مجموعاً چقدر انرژی تولید می‌کنند؟
                </div>

                <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-cyan-400" />
                    <span className="text-slate-300 text-sm">مجموع کل = میانگین × تعداد</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300">مجموع کل:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="مجموع مگاوات"
                      value={ansTotal}
                      onChange={(e) => setAnsTotal(e.target.value)}
                      className="w-36 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-xs"
                    />
                  </div>

                  <button
                    onClick={checkAnswer}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>محاسبه و تایید مجموع انرژی</span>
                  </button>
                </div>
              </div>
            )}

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
        message="فرمان پرواز به ثبت رسید!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
