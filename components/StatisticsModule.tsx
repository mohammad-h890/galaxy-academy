'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Clock, Zap } from 'lucide-react';

interface StatisticsModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

type StatSubTopic =
  | 'time_base_60'
  | 'number_patterns'
  | 'reverse_mean';

// Helper to format time strictly as H:MM (e.g. 7:34)
function formatTimeColon(h: number, m: number): string {
  const mStr = m < 10 ? `۰${toPersianDigits(m)}` : toPersianDigits(m);
  return `${toPersianDigits(h)}:${mStr}`;
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
  const [subTopic, setSubTopic] = useState<StatSubTopic>('time_base_60');

  // 1. Time base 60
  const [qTime, setQTime] = useState({
    h1: 7,
    m1: 15,
    h2: 3,
    m2: 45,
    borrowed: false,
  });
  const [ansHours, setAnsHours] = useState('');
  const [ansMins, setAnsMins] = useState('');

  // 2. Patterns
  const [patternStep, setPatternStep] = useState(3);
  const [patternStart, setPatternStart] = useState(2);
  const [targetFig, setTargetFig] = useState(10);
  const [targetAnsPattern, setTargetAnsPattern] = useState(29);
  const [ansPattern, setAnsPattern] = useState('');

  // 3. Reverse Mean
  const [qMean, setQMean] = useState({
    count: 4,
    mean: 18,
    total: 72,
  });
  const [ansTotal, setAnsTotal] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      title: '۱. محاسبات زمان و عددهای مرکب در مبنای ۶۰ (ص ۱۰ تا ۱۳)',
      text: 'در تفریق زمان، زمان بزرگتر در سمت چپ و زمان کوچکتر در سمت راست قرار دارد. نمایش زمان به صورت استاندارد ۷:۳۴ است. اگر دقایق زمان اول کمتر بود، ۱ ساعت از عدد صحیح ساعت سمت چپ خرد کرده و ۶۰ دقیقه به دقایق اضافه می‌کنیم.',
      tip: 'قرض گرفتن ۱ ساعت = اضافه شدن ۶۰ دقیقه به ستون دقایق.',
      mood: 'warning' as const,
    },
    {
      title: '۲. الگوهای عددی و کشف رابطه شماره شکل (ص ۱۴ تا ۱۷)',
      text: 'در الگوهای حسابی، فاصله بین اعداد کلید معماست. اگر اعداد ۳ تا ۳ تا زیاد می‌شوند، رابطه با (شماره شکل × ۳) آغاز می‌شود.',
      tip: 'فرمول الگو: (شماره شکل × مقدار افزایش) ± اختلاف عدد اول.',
      mood: 'happy' as const,
    },
    {
      title: '۳. میانگین و تحلیل معکوس داده‌ها (ص ۱۳۰ تا ۱۳۳)',
      text: 'فرمول میانگین = مجموع داده‌ها ÷ تعداد. برای یافتن مجموع کل از میانگین، کافیست میانگین را در تعداد داده‌ها ضرب کنید: (مجموع = میانگین × تعداد).',
      tip: 'اگر میانگین ۴ عدد برابر ۱۵ باشد، مجموع کل آن‌ها ۴ × ۱۵ = ۶۰ است.',
      mood: 'excited' as const,
    },
  ];

  // Dynamic question generation with random numbers
  const generateQuestionForStage = (currentStage: number) => {
    setFeedback(null);
    const topics: StatSubTopic[] = ['time_base_60', 'reverse_mean', 'number_patterns'];
    const chosenTopic = topics[currentStage % topics.length];
    setSubTopic(chosenTopic);

    if (chosenTopic === 'time_base_60') {
      const h1 = Math.floor(Math.random() * 5) + 5; // 5..9
      const h2 = Math.floor(Math.random() * 3) + 1; // 1..3 (h1 > h2)
      const m1 = Math.floor(Math.random() * 20) + 5; // 5..24
      const m2 = Math.floor(Math.random() * 25) + 32; // 32..56 (m2 > m1)

      setQTime({ h1, m1, h2, m2, borrowed: false });
      setAnsHours('');
      setAnsMins('');
    } else if (chosenTopic === 'number_patterns') {
      const step = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6
      const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const fig = [8, 10, 12, 15, 20][Math.floor(Math.random() * 5)];
      const targetAns = fig * step + offset;

      setPatternStep(step);
      setPatternStart(1 * step + offset);
      setTargetFig(fig);
      setTargetAnsPattern(targetAns);
      setAnsPattern('');
    } else {
      const count = Math.floor(Math.random() * 4) + 3; // 3..6
      const mean = (Math.floor(Math.random() * 6) + 3) * 5; // 15..40
      const total = count * mean;
      setQMean({ count, mean, total });
      setAnsTotal('');
    }
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestionForStage(0);
  };

  const advanceStage = () => {
    SoundFX.success();
    SoundFX.lifeEnergy();
    const nextScore = score + 1;
    setScore(nextScore);
    onCorrectAnswer(20);
    setShowCelebration(true);

    if (nextScore >= TOTAL_STAGES) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setTimeout(() => {
        generateQuestionForStage(nextScore);
      }, 1400);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            SoundFX.click();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm active:scale-95 transition-all"
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
            <div className="px-4 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score + 1)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-2 flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-400" />
          <span>اتاق فرمان: گلوگاه‌های زمان در مبنای ۶۰، الگوها و میانگین معکوس</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          قرض گرفتن ۶۰ دقیقه‌ای در تفریق زمان‌ها، نمایش ساعت به صورت H:MM، کشف فرمول شماره شکل و مجموع از میانگین
        </p>

        {!inGame ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 font-bold text-base">
              📖 {lessonSlides[slide].title}
            </div>

            <RobotGuide message={lessonSlides[slide].text} mood={lessonSlides[slide].mood} size="md" />

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-amber-300">
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
                      idx === slide ? 'bg-amber-400 w-6 shadow-sm shadow-amber-400' : 'bg-slate-700'
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all"
                >
                  اسلاید بعدی
                </button>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>آغاز عملیات ۱۵ مرحله‌ای اتاق فرمان</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SUB-TOPIC 1: TIME BASE 60 (Larger Time on Left, Smaller on Right, Formatted as H:MM) */}
            {subTopic === 'time_base_60' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">
                    محاسبه اختلاف زمان (زمان بزرگتر در سمت چپ و زمان کوچکتر در سمت راست قرار دارد):
                  </div>
                  <div className="flex items-center justify-center gap-6 text-2xl font-bold text-white" dir="ltr">
                    {/* Left: Larger time */}
                    <div className="p-3 px-6 rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-300">
                      <span className="font-mono text-3xl font-extrabold tracking-wider" dir="ltr">
                        {formatTimeColon(qTime.h1, qTime.m1)}
                      </span>
                      <div className="text-xs text-slate-400 mt-1 font-sans">
                        ({toPersianDigits(qTime.h1)} ساعت و {toPersianDigits(qTime.m1)} دقیقه)
                      </div>
                    </div>

                    <span className="text-rose-400 font-extrabold text-3xl">−</span>

                    {/* Right: Smaller time */}
                    <div className="p-3 px-6 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300">
                      <span className="font-mono text-3xl font-extrabold tracking-wider" dir="ltr">
                        {formatTimeColon(qTime.h2, qTime.m2)}
                      </span>
                      <div className="text-xs text-slate-400 mt-1 font-sans">
                        ({toPersianDigits(qTime.h2)} ساعت و {toPersianDigits(qTime.m2)} دقیقه)
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-amber-300">
                    💡 چون {toPersianDigits(qTime.m1)} کمتر از {toPersianDigits(qTime.m2)} است، دکمه قرض گرفتن را بزنید تا ۱ ساعت بشکند و ۶۰ دقیقه به دقایق اضافه شود.
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950/90 border border-amber-500/30 flex flex-col items-center gap-4">
                  <button
                    disabled={qTime.borrowed}
                    onClick={() => {
                      SoundFX.shatter();
                      setQTime((prev) => ({
                        ...prev,
                        h1: prev.h1 - 1,
                        m1: prev.m1 + 60,
                        borrowed: true,
                      }));
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-amber-500/40 text-xs md:text-sm font-semibold transition-all active:scale-95"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>⚙️ شکستن ۱ ساعت به ۶۰ دقیقه (قرض گرفتن در مبنای ۶۰)</span>
                  </button>

                  <div className="flex items-center justify-center gap-3" dir="ltr">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="ساعت"
                        value={ansHours}
                        onChange={(e) => setAnsHours(e.target.value)}
                        className="w-20 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <span className="text-xs text-slate-400 font-semibold">ساعت</span>
                    </div>

                    <span className="text-2xl font-bold text-slate-400">:</span>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="دقیقه"
                        value={ansMins}
                        onChange={(e) => setAnsMins(e.target.value)}
                        className="w-20 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <span className="text-xs text-slate-400 font-semibold">دقیقه</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const userH = parseInt(toEnglishNumber(ansHours), 10);
                      const userM = parseInt(toEnglishNumber(ansMins), 10);
                      const totalDiff = qTime.h1 * 60 + qTime.m1 - (qTime.h2 * 60 + qTime.m2);
                      const expH = Math.floor(totalDiff / 60);
                      const expM = totalDiff % 60;

                      if (userH === expH && userM === expM) {
                        setFeedback({
                          type: 'success',
                          message: 'محاسبه زمان در مبنای ۶۰ فوق‌العاده دقیق انجام گرفت!',
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: به یاد داشته باشید که با قرض گرفتن ۱ ساعت، ۶۰ دقیقه به بخش دقایق اضافه می‌شود نه ۱۰۰ دقیقه! دوباره تفریق را محاسبه کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    ثبت زمان در سامانه 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 2: NUMBER PATTERNS */}
            {subTopic === 'number_patterns' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">کشف رابطه جبری الگوهای عددی:</div>
                  <div className="text-base text-slate-200 font-semibold">
                    دنباله عددی زیر را در نظر بگیرید:
                  </div>
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-cyan-300">
                    <span>{toPersianDigits(patternStart)}</span>
                    <span className="text-slate-500">،</span>
                    <span>{toPersianDigits(patternStart + patternStep)}</span>
                    <span className="text-slate-500">،</span>
                    <span>{toPersianDigits(patternStart + patternStep * 2)}</span>
                    <span className="text-slate-500">،</span>
                    <span>{toPersianDigits(patternStart + patternStep * 3)}</span>
                    <span className="text-slate-500">، ...</span>
                  </div>
                  <div className="text-sm text-amber-300">
                    شماره شکل <strong className="text-white text-lg">{toPersianDigits(targetFig)}</strong> شامل چند واحد است؟
                  </div>
                  <div className="text-xs text-slate-400">
                    💡 اعداد {toPersianDigits(patternStep)} تا {toPersianDigits(patternStep)} تا افزایش می‌یابند.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300">مقدار شکل شماره {toPersianDigits(targetFig)}:</span>
                  <input
                    type="text"
                    placeholder="مقدار شکل..."
                    value={ansPattern}
                    onChange={(e) => setAnsPattern(e.target.value)}
                    className="w-32 h-12 text-center text-xl font-bold bg-slate-900 border border-amber-500/60 rounded-xl text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <button
                    onClick={() => {
                      const u = parseInt(toEnglishNumber(ansPattern), 10);
                      if (u === targetAnsPattern) {
                        setFeedback({
                          type: 'success',
                          message: 'کشف رابطه الگو بی‌نقص بود! مهارت تفکر جبری ششم تایید شد.',
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: شماره شکل (${toPersianDigits(targetFig)}) را در فاصله بین جملات (${toPersianDigits(patternStep)}) ضرب کنید و اختلاف جمله اول را تنظیم کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید الگو 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 3: REVERSE MEAN */}
            {subTopic === 'reverse_mean' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">تحلیل معکوس میانگین:</div>
                  <p className="text-base text-slate-200 font-semibold">
                    اگر میانگین تولید هر ژنراتور سفینه برابر <strong className="text-emerald-400">{toPersianDigits(qMean.mean)} مگاوات</strong> باشد، <strong className="text-cyan-400">{toPersianDigits(qMean.count)} ژنراتور</strong> مجموعاً چقدر انرژی تولید می‌کنند؟
                  </p>
                  <div className="text-xs text-amber-300">
                    💡 قاعده طلایی: مجموع کل = میانگین هر داده × تعداد کل داده‌ها.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300">مجموع کل انرژی (مگاوات):</span>
                  <input
                    type="text"
                    placeholder="مجموع..."
                    value={ansTotal}
                    onChange={(e) => setAnsTotal(e.target.value)}
                    className="w-32 h-12 text-center text-xl font-bold bg-slate-900 border border-amber-500/60 rounded-xl text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <button
                    onClick={() => {
                      const u = parseInt(toEnglishNumber(ansTotal), 10);
                      if (u === qMean.total) {
                        setFeedback({ type: 'success', message: 'محاسبه مجموع از میانگین کاملاً درست است!' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: برای به دست آوردن مجموع کل، عدد میانگین را در تعداد ژنراتورها ضرب کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید مجموع 🎯
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
        message="مرحله اتاق فرمان با موفقیت فتح شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
