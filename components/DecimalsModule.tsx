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

type DecimalSubTopic =
  | 'place_value'
  | 'addition_subtraction'
  | 'multiplication_ten';

// Function to format decimals using Persian slash separator "/"
function formatPersianDecimal(val: string | number): string {
  if (val === undefined || val === null) return '';
  const s = val.toString();
  const parts = s.split('.');
  if (parts.length === 2) {
    return `${toPersianDigits(parts[0])}/${toPersianDigits(parts[1])}`;
  }
  return toPersianDigits(s);
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
  const [subTopic, setSubTopic] = useState<DecimalSubTopic>('addition_subtraction');

  // Place Value state
  const [pvNum1, setPvNum1] = useState('0.3');
  const [pvNum2, setPvNum2] = useState('0.099');

  // Addition & Subtraction state (defaults to larger on top: 30.8 - 7.22)
  const [num1, setNum1] = useState('30.8');
  const [num2, setNum2] = useState('7.22');
  const [op, setOp] = useState<'+' | '-'>('-');
  const [isAligned, setIsAligned] = useState(false);
  const [zeroPadded, setZeroPadded] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  // Powers of 10 state
  const [powNum, setPowNum] = useState('2.45');
  const [powerOf10, setPowerOf10] = useState<10 | 100 | 1000>(100);
  const [powAns, setPowAns] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      title: '۱. جدول ارزش مکانی و درک مرتبه‌های اعشاری (ص ۸۸ تا ۹۲)',
      text: 'علامت ممیز به صورت خط مورب (/) نمایش داده می‌شود. اولین رقم بعد از ممیز دهم، دومی صدم و سومی هزارم است. هشدار مقایسه: ۰/۳ بسیار بزرگتر از ۰/۰۹۹ است زیرا با افزودن صفر کمکی ۰/۳ به ۰/۳۰۰ تبدیل می‌شود.',
      tip: 'همیشه تعداد رقم‌های اعشار را با صفر کمکی برابر کنید تا ارزش مکانی واقعی آشکار شود.',
      mood: 'warning' as const,
    },
    {
      title: '۲. تراز لیزری ممیزها و سپرهای صفر (ص ۹۳ تا ۹۷)',
      text: 'در جمع و تفریق اعشار، خط لیزر ممیزها باید کاملاً در یک ستون عمودی قرار گیرد. ابتدا تراز ستونی را فعال کرده و سپس با افزودن صفر کمکی، رقم‌های اعشاری را هم‌مرتبه کنید.',
      tip: 'تراز ممیزها مانع از جمع شدن رقم دهم با صدم می‌شود.',
      mood: 'happy' as const,
    },
    {
      title: '۳. ضرب در توان‌های ۱۰ و پرش ممیز (ص ۹۸ تا ۱۰۱)',
      text: 'ضرب در ۱۰، ۱۰۰ یا ۱۰۰۰ باعث می‌شود ممیز به ترتیب ۱، ۲ یا ۳ رقم به سمت راست بپرد بدون آنکه نیاز به ضرب طولانی باشد.',
      tip: 'به ازای هر صفر در عدد ۱۰، ۱۰۰ یا ۱۰۰۰، ممیز یک پله به جلو جهش می‌کند.',
      mood: 'excited' as const,
    },
  ];

  // Dynamic question generator with random numbers each time
  const generateQuestionForStage = (currentStage: number) => {
    setFeedback(null);
    const topics: DecimalSubTopic[] = ['addition_subtraction', 'place_value', 'multiplication_ten'];
    const chosenTopic = topics[currentStage % topics.length];
    setSubTopic(chosenTopic);

    if (chosenTopic === 'place_value') {
      const b1 = Math.floor(Math.random() * 5) + 3; // 3 to 7
      const b2 = b1 - 1;
      const n1 = `0.${b1}`;
      const n2 = `0.${b2}${Math.floor(Math.random() * 8) + 1}${Math.floor(Math.random() * 9) + 1}`;
      setPvNum1(n1);
      setPvNum2(n2);
    } else if (chosenTopic === 'addition_subtraction') {
      const nextOp: '+' | '-' = Math.random() > 0.5 ? '+' : '-';
      setOp(nextOp);

      // Generate numbers with tenths vs hundredths to train zero padding
      const tenthsVal = Math.floor(Math.random() * 8) + 1; // 1 decimal (e.g. .4)
      const hundredthsVal = Math.floor(Math.random() * 80) + 12; // 2 decimals (e.g. .75)

      const wBig = Math.floor(Math.random() * 20) + 15; // 15 to 34
      const wSmall = Math.floor(Math.random() * 8) + 2; // 2 to 9

      let cand1 = `${wBig}.${tenthsVal}`;
      let cand2 = `${wSmall}.${hundredthsVal}`;
      if (Math.random() > 0.5) {
        cand1 = `${wBig}.${hundredthsVal}`;
        cand2 = `${wSmall}.${tenthsVal}`;
      }

      // Guarantee Top is strictly larger than Bottom
      const v1 = parseFloat(cand1);
      const v2 = parseFloat(cand2);
      const sTop = v1 >= v2 ? cand1 : cand2;
      const sBottom = v1 >= v2 ? cand2 : cand1;

      setNum1(sTop);
      setNum2(sBottom);
      setIsAligned(false);
      setZeroPadded(false);
      setUserAnswer('');
    } else {
      const powers: (10 | 100 | 1000)[] = [10, 100, 1000];
      const p = powers[Math.floor(Math.random() * powers.length)];
      setPowerOf10(p);
      const w = Math.floor(Math.random() * 8) + 1;
      const d1 = Math.floor(Math.random() * 7) + 2;
      const d2 = Math.floor(Math.random() * 7) + 1;
      setPowNum(`${w}.${d1}${d2}`);
      setPowAns('');
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
            <div className="px-4 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score + 1)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
          <Crosshair className="w-6 h-6 text-teal-400" />
          <span>سیستم ناوبری: گلوگاه‌های اعشار و تراز ستونی ممیزها</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          نمایش ممیز با علامت /، تراز دقیق لیزری ستونی، سپر صفر کمکی و شتاب‌دهنده پرش ممیز در ضرب توان‌های ۱۰
        </p>

        {!inGame ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-teal-200 font-bold text-base">
              📖 {lessonSlides[slide].title}
            </div>

            <RobotGuide message={lessonSlides[slide].text} mood={lessonSlides[slide].mood} size="md" />

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-cyan-300">
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ورود به سیستم ناوبری ۱۵ مرحله‌ای</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SUB-TOPIC 1: PLACE VALUE & COMPARISON (Slash Separator) */}
            {subTopic === 'place_value' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">تحلیل مرتبه و ارزش مکانی اعشار:</div>
                  <div className="text-lg md:text-xl font-bold text-white">
                    کدام عدد اعشاری بزرگتر است؟ (فریب تعداد رقم‌ها را نخورید!)
                  </div>
                  <div className="flex items-center justify-center gap-6 text-2xl font-bold py-2">
                    <div className="p-3 px-6 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300">
                      {formatPersianDecimal(pvNum1)}
                    </div>
                    <span className="text-slate-500 text-lg">یا</span>
                    <div className="p-3 px-6 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-300">
                      {formatPersianDecimal(pvNum2)}
                    </div>
                  </div>
                  <div className="text-xs text-amber-300">
                    💡 راهنمایی: با اضافه کردن صفر به انتهای بخش اعشاری عدد {formatPersianDecimal(pvNum1)}، تعداد ارقام هر دو عدد برابر می‌شود.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <button
                    onClick={() => {
                      const v1 = parseFloat(pvNum1);
                      const v2 = parseFloat(pvNum2);
                      if (v1 > v2) {
                        setFeedback({
                          type: 'success',
                          message: 'بسیار دقیق! ارزش مرتبه دهم بیشتر از مرتبه صدم و هزارم است.',
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: عدد ${formatPersianDecimal(pvNum1)} را با افزودن صفرهای کمکی به صورت ${formatPersianDecimal(pvNum1 + '00')} تصور کنید؛ اکنون مقایسه کنید!`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    عدد {formatPersianDecimal(pvNum1)} بزرگتر است
                  </button>

                  <button
                    onClick={() => {
                      const v1 = parseFloat(pvNum1);
                      const v2 = parseFloat(pvNum2);
                      if (v2 > v1) {
                        setFeedback({ type: 'success', message: 'کاملاً صحیح است!' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: ارزش اولین رقم بعد از ممیز (مرتبه دهم) را در هر دو عدد مقایسه کنید؛ عدد سمت راست دهم کمتری دارد.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    عدد {formatPersianDecimal(pvNum2)} بزرگتر است
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 2: ADDITION/SUBTRACTION WITH VERIFIABLE LASER ALIGNMENT */}
            {subTopic === 'addition_subtraction' && (
              <div className="space-y-6">
                <div className="text-center text-sm text-slate-300">
                  {isAligned ? (
                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                      <Crosshair className="w-4 h-4" />
                      لیزر روی ممیزها قفل شد! حالا حاصل {op === '+' ? 'جمع' : 'تفریق'} را با دقت محاسبه کنید.
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">
                      ⚠️ با زدن دکمه «تراز لیزری ممیزها»، ستون ممیزها و صفرهای کمکی را فعال کنید.
                    </span>
                  )}
                </div>

                <div className="relative max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col items-center gap-5 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        SoundFX.laser();
                        setIsAligned(true);
                        setZeroPadded(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all"
                    >
                      🎯 ۱. تراز ستونی ممیزها و سپر صفر (+۰)
                    </button>
                  </div>

                  {/* Laser Column Layout (Strict Visual Grid with / Separator) */}
                  <div className="relative p-6 px-10 rounded-2xl bg-slate-900 border border-teal-500/40 text-2xl md:text-3xl font-mono text-center space-y-3" dir="ltr">
                    {/* Laser Vertical Beam right over the slash position */}
                    {isAligned && (
                      <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-400 shadow-[0_0_14px_#34d399] z-10 animate-pulse" />
                    )}

                    {/* Row 1 (Top: Larger Number) */}
                    <div className="flex items-center justify-center gap-1 text-cyan-300 font-bold">
                      <span className="w-20 text-right">{toPersianDigits(num1.split('.')[0])}</span>
                      <span className="text-emerald-400 font-extrabold px-1">/</span>
                      <span className="w-20 text-left flex items-center">
                        {toPersianDigits(num1.split('.')[1])}
                        {zeroPadded && num1.split('.')[1].length === 1 && num2.split('.')[1].length === 2 && (
                          <span className="text-amber-400 font-extrabold">{toPersianDigits('0')}</span>
                        )}
                      </span>
                    </div>

                    {/* Row 2 (Bottom: Smaller Number) */}
                    <div className="flex items-center justify-center gap-1 text-teal-300 font-bold border-b-2 border-slate-700 pb-2">
                      <span className="w-20 text-right flex items-center justify-end gap-2">
                        <span className="text-rose-400 text-2xl font-bold">{op}</span>
                        <span>{toPersianDigits(num2.split('.')[0])}</span>
                      </span>
                      <span className="text-emerald-400 font-extrabold px-1">/</span>
                      <span className="w-20 text-left flex items-center">
                        {toPersianDigits(num2.split('.')[1])}
                        {zeroPadded && num2.split('.')[1].length === 1 && num1.split('.')[1].length === 2 && (
                          <span className="text-amber-400 font-extrabold">{toPersianDigits('0')}</span>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 pt-1" dir="rtl">
                      {isAligned ? '✅ ممیزها و مرتبه‌ها هم‌راستا شدند' : '💡 می‌توانید مستقیم پاسخ دهید یا دکمه تراز لیزری را بزنید'}
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center gap-3">
                    <input
                      type="text"
                      placeholder="پاسخ را با ممیز وارد کنید (مثلاً: ۱۶/۲۵)..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-72 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />

                    <button
                      onClick={() => {
                        const val1 = parseFloat(num1);
                        const val2 = parseFloat(num2);
                        const expected = op === '+' ? (val1 + val2).toFixed(2) : (val1 - val2).toFixed(2);
                        const cleanUser = toEnglishNumber(userAnswer).replace('/', '.');
                        const userVal = parseFloat(cleanUser);
                        if (!isNaN(userVal) && Math.abs(userVal - parseFloat(expected)) < 0.015) {
                          setFeedback({
                            type: 'success',
                            message: 'محاسبه اعشار کاملاً دقیق و صحیح است! تایید شد.',
                          });
                          advanceStage();
                        } else {
                          onLogMistake();
                          SoundFX.error();
                          setFeedback({
                            type: 'error',
                            message: `راهنمایی: ارقام اعشاری را ستون به ستون از سمت راست ${op === '+' ? 'جمع' : 'کم'} کنید. در صورت نیاز از دکمه تراز لیزری برای تراز ستونی استفاده کنید.`,
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>ثبت مختصات در ناوبری</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 3: POWERS OF 10 MULTIPLICATION */}
            {subTopic === 'multiplication_ten' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">پرش سریع ممیز در ضرب توان‌های ۱۰:</div>
                  <div className="text-2xl font-bold text-cyan-300">
                    {formatPersianDecimal(powNum)} × {toPersianDigits(powerOf10)} = ؟
                  </div>
                  <div className="text-xs text-teal-300">
                    💡 قاعده: ممیز به اندازه تعداد صفرهای عدد ({toPersianDigits(powerOf10 === 10 ? 1 : powerOf10 === 100 ? 2 : 3)} صفر) به سمت راست جهش می‌کند.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <input
                    type="text"
                    placeholder="پاسخ پس از پرش ممیز..."
                    value={powAns}
                    onChange={(e) => setPowAns(e.target.value)}
                    className="w-48 h-12 text-center text-xl font-bold bg-slate-900 border border-teal-500/60 rounded-xl text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />

                  <button
                    onClick={() => {
                      const expected = (parseFloat(powNum) * powerOf10).toString();
                      const uAns = toEnglishNumber(powAns);
                      if (Math.abs(parseFloat(uAns) - parseFloat(expected)) < 0.01) {
                        setFeedback({
                          type: 'success',
                          message: 'پرش ممیز فوق‌العاده بود! محاسبه ذهنی سریع تایید شد.',
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: عدد ${toPersianDigits(powerOf10)} دارای ${toPersianDigits(powerOf10 === 10 ? 1 : powerOf10 === 100 ? 2 : 3)} صفر است؛ ممیز را دقیقاً به همین تعداد رقم به سمت راست منتقل کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید شتاب ممیز 🎯
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
        message="مسیر ناوبری اعشار با موفقیت تراز شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
