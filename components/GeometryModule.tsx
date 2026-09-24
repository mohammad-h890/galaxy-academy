'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Check, Scissors, Zap } from 'lucide-react';

interface GeometryModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

interface GeometryQuestion {
  type: 'rhombus' | 'trapezoid';
  d1: number;
  d2: number;
  b1: number;
  b2: number;
  h: number;
  area: number;
}

const TOTAL_STAGES = 15;

export function GeometryModule({
  onBack,
  onComplete,
  onCorrectAnswer,
  onLogMistake,
}: GeometryModuleProps) {
  const [slide, setSlide] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [score, setScore] = useState(0);

  const [q, setQ] = useState<GeometryQuestion>({
    type: 'rhombus',
    d1: 10,
    d2: 6,
    b1: 4,
    b2: 8,
    h: 4,
    area: 30,
  });

  const [isSimulated, setIsSimulated] = useState(false);
  const [in1, setIn1] = useState('');
  const [in2, setIn2] = useState('');
  const [in3, setIn3] = useState('');
  const [inAns, setInAns] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      text: 'بدنه و صفحات خورشیدی سفینه امید از دو ساختار هندسی مقاوم تشکیل شده‌اند: لوزی و ذوزنقه.',
      tip: 'لوزی = چهارضلعی با اضلاع برابر و قطرهای عمود برهم · ذوزنقه = چهارضلعی با دو قاعده موازی.',
      mood: 'happy' as const,
    },
    {
      text: 'چرا در مساحت ذوزنقه تقسیم بر ۲ داریم؟ اگر یک ذوزنقه هم‌اندازه را ۱۸۰ درجه بچرخانیم و در کنار آن قرار دهیم، یک متوازی‌الاضلاع کامل ساخته می‌شود که قاعده آن برابر با (مجموع دو قاعده) و ارتفاعش همان ارتفاع ذوزنقه است. بنابراین مساحت یک ذوزنقه نصف آن متوازی‌الاضلاع است!',
      tip: 'فرمول ذوزنقه: ((قاعده کوچک + قاعده بزرگ) × ارتفاع) ÷ ۲ · فرمول لوزی: (قطر بزرگ × قطر کوچک) ÷ ۲',
      mood: 'warning' as const,
    },
    {
      text: 'با فشردن دکمه «شبیه‌سازی لیزری»، جفت قرینه ذوزنقه چرخانده شده و متوازی‌الاضلاع کامل را تشکیل می‌دهد تا علت دقیق مجموع دو قاعده و تقسیم بر ۲ را به چشم ببینید.',
      tip: 'همیشه تقسیم بر ۲ را به یاد داشته باشید زیرا شکل حاصل از دو ذوزنقه هم‌اندازه ساخته شده است.',
      mood: 'excited' as const,
    },
  ];

  const generateQuestion = () => {
    const isRhombus = Math.random() > 0.5;

    if (isRhombus) {
      const d1 = (Math.floor(Math.random() * 5) + 3) * 2;
      const d2 = (Math.floor(Math.random() * 4) + 2) * 2;
      const area = (d1 * d2) / 2;
      setQ({ type: 'rhombus', d1, d2, b1: 0, b2: 0, h: 0, area });
    } else {
      const b1 = Math.floor(Math.random() * 4) + 3; // 3 to 6
      const b2 = Math.floor(Math.random() * 4) + 7; // 7 to 10
      const h = (Math.floor(Math.random() * 4) + 2) * 2; // 4, 6, 8, 10
      const area = ((b1 + b2) * h) / 2;
      setQ({ type: 'trapezoid', d1: 0, d2: 0, b1, b2, h, area });
    }

    setIsSimulated(false);
    setIn1('');
    setIn2('');
    setIn3('');
    setInAns('');
    setFeedback(null);
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestion();
  };

  const simulateCut = () => {
    SoundFX.click();
    setIsSimulated(true);
  };

  const checkAnswer = () => {
    const val1 = parseFloat(toEnglishNumber(in1));
    const val2 = parseFloat(toEnglishNumber(in2));
    const val3 = parseFloat(toEnglishNumber(in3));
    const valAns = parseFloat(toEnglishNumber(inAns));

    if (isNaN(val1) || isNaN(val2) || isNaN(valAns)) {
      SoundFX.error();
      setFeedback({ type: 'error', message: 'لطفاً تمام ورودی‌های فرمول را با دقت پر کنید.' });
      return;
    }

    let valuesValid = false;
    if (q.type === 'rhombus') {
      valuesValid =
        (val1 === q.d1 && val2 === q.d2) ||
        (val1 === q.d2 && val2 === q.d1);
    } else {
      if (isNaN(val3)) {
        SoundFX.error();
        setFeedback({ type: 'error', message: 'ارتفاع ذوزنقه را وارد نکرده‌اید.' });
        return;
      }
      valuesValid =
        ((val1 === q.b1 && val2 === q.b2) || (val1 === q.b2 && val2 === q.b1)) &&
        val3 === q.h;
    }

    if (!valuesValid) {
      SoundFX.error();
      onLogMistake();
      setFeedback({
        type: 'error',
        message: 'اعداد برداشته شده از شکل در جایگاه درستی در فرمول قرار نگرفته‌اند. اندازه اضلاع و قطرها را بررسی کنید.',
      });
      return;
    }

    if (valAns === q.area) {
      SoundFX.success();
      SoundFX.lifeEnergy();
      const newScore = score + 1;
      setScore(newScore);

      onCorrectAnswer(20);
      setShowCelebration(true);

      setFeedback({
        type: 'success',
        message: `پنل سازه برش خورد و نصب شد! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت تایید گردید.`,
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
        message: `مساحت اشتباه محاسبه شد! آیا تقسیم بر ۲ را فراموش کرده‌اید؟ مساحت صحیح: ${toPersianDigits(q.area)} متر مربع.`,
      });
    }
  };

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
          backgroundImage: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.12), transparent 50%)',
        }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">
          کارگاه سازه‌ها: مساحت اشکال هندسی (۱۵ مرحله)
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
                  <span>ورود به کارگاه برش سازه</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm md:text-base leading-relaxed">
              {q.type === 'rhombus' ? (
                <span>
                  سازه مورد نیاز: <strong className="text-pink-400">لوزی</strong> با قطر بزرگ{' '}
                  <strong className="text-cyan-300">{toPersianDigits(q.d1)} متر</strong> و قطر کوچک{' '}
                  <strong className="text-cyan-300">{toPersianDigits(q.d2)} متر</strong>. ابتدا روی دکمه شبیه‌سازی لیزری بزنید تا ارتباط با مستطیل محیطی را ببینید.
                </span>
              ) : (
                <span>
                  سازه مورد نیاز: <strong className="text-amber-400">ذوزنقه</strong> با قاعده کوچک{' '}
                  <strong className="text-cyan-300">{toPersianDigits(q.b1)} متر</strong>، قاعده بزرگ{' '}
                  <strong className="text-cyan-300">{toPersianDigits(q.b2)} متر</strong> و ارتفاع{' '}
                  <strong className="text-cyan-300">{toPersianDigits(q.h)} متر</strong>. دکمه شبیه‌سازی را بزنید تا چرخش ۱۸۰ درجه ذوزنقه دوم و ساخت متوازی‌الاضلاع کامل را ببینید.
                </span>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/90 border border-pink-500/30 flex flex-col items-center gap-6">
              <button
                disabled={isSimulated}
                onClick={simulateCut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
              >
                <Scissors className="w-4 h-4" />
                <span>۱. شبیه‌سازی بُرش و اتصال لیزری ✂️</span>
              </button>

              <div className="w-full max-w-2xl h-64 rounded-2xl bg-slate-900/60 border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 540 240" className="w-full h-full">
                  {q.type === 'rhombus' ? (
                    <g>
                      {/* Enclosing rectangle when simulated */}
                      {isSimulated && (
                        <>
                          <rect
                            x="120"
                            y="40"
                            width="280"
                            height="140"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                          />
                          {/* 4 outer corner triangles demonstrating equal cut areas */}
                          <polygon points="120,40 260,40 120,110" fill="rgba(244, 114, 182, 0.25)" />
                          <polygon points="260,40 400,40 400,110" fill="rgba(244, 114, 182, 0.25)" />
                          <polygon points="120,110 120,180 260,180" fill="rgba(244, 114, 182, 0.25)" />
                          <polygon points="400,110 260,180 400,180" fill="rgba(244, 114, 182, 0.25)" />
                        </>
                      )}

                      {/* Main Rhombus */}
                      <polygon
                        points="260,40 400,110 260,180 120,110"
                        fill="rgba(236, 72, 153, 0.45)"
                        stroke="#f472b6"
                        strokeWidth="3"
                      />

                      {/* Diagonals */}
                      <line x1="120" y1="110" x2="400" y2="110" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="260" y1="40" x2="260" y2="180" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 4" />

                      <text x="260" y="202" fill="#38bdf8" fontSize="13" textAnchor="middle" fontWeight="bold">
                        قطر بزرگ = {toPersianDigits(q.d1)} متر
                      </text>
                      <text x="450" y="115" fill="#38bdf8" fontSize="13" textAnchor="middle" fontWeight="bold">
                        قطر کوچک = {toPersianDigits(q.d2)} متر
                      </text>
                    </g>
                  ) : (
                    /* GEOMETRICALLY CORRECT TRAPEZOID DUPLICATION & ROTATION (PARALLELOGRAM) */
                    <g>
                      {/* Geometric coordinates:
                          Original Trapezoid:
                          A (top left) = (110, 50)
                          B (top right) = (210, 50)  -> top base = 100 px (b1)
                          C (bottom right) = (290, 170) -> bottom base = 240 px (b2)
                          D (bottom left) = (50, 170)
                          Height = 120 px (h)

                          Second identical trapezoid inverted & rotated 180 degrees:
                          Placed adjacent along the shared slant edge BC (from B to C):
                          Top edge expands from B (210, 50) to (210 + 240 = 450, 50) -> length = b2!
                          Bottom edge expands from C (290, 170) to (290 + 100 = 390, 170) -> length = b1!
                          Opposite right slant edge connects (450, 50) to (390, 170) which is parallel to AD (50,170 -> 110,50)!
                          Total top width = b1 + b2 = 100 + 240 = 340 px!
                          Total bottom width = b2 + b1 = 240 + 100 = 340 px!
                          Together they form a PERFECT PARALLELOGRAM with base = (b1 + b2) and height = h!
                      */}

                      {/* Parallelogram outer boundary highlight when simulated */}
                      {isSimulated && (
                        <polygon
                          points="110,50 450,50 390,170 50,170"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="6 6"
                        />
                      )}

                      {/* Original Trapezoid 1 */}
                      <polygon
                        points="110,50 210,50 290,170 50,170"
                        fill="rgba(245, 158, 11, 0.45)"
                        stroke="#f59e0b"
                        strokeWidth="3"
                      />

                      {/* Height guide line with right-angle indicator */}
                      <line x1="110" y1="50" x2="110" y2="170" stroke="#00f0ff" strokeWidth="2" strokeDasharray="3 3" />
                      <rect x="110" y="160" width="10" height="10" fill="none" stroke="#00f0ff" strokeWidth="1.5" />

                      {/* Inverted Cloned Trapezoid 2 (Appears seamlessly attached to create a parallelogram) */}
                      {isSimulated && (
                        <g className="transition-all duration-1000 animate-fadeIn">
                          <polygon
                            points="210,50 450,50 390,170 290,170"
                            fill="rgba(56, 189, 248, 0.35)"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                          />
                          {/* Inner shared dividing line */}
                          <line x1="210" y1="50" x2="290" y2="170" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" />

                          {/* Labels for the cloned inverted parts showing b2 on top and b1 on bottom */}
                          <text x="330" y="42" fill="#38bdf8" fontSize="12" textAnchor="middle" fontWeight="bold">
                            قاعده بزرگ ({toPersianDigits(q.b2)})
                          </text>
                          <text x="340" y="190" fill="#38bdf8" fontSize="12" textAnchor="middle" fontWeight="bold">
                            قاعده کوچک ({toPersianDigits(q.b1)})
                          </text>

                          {/* Top unified parallelogram dimension banner */}
                          <text x="280" y="24" fill="#34d399" fontSize="13" textAnchor="middle" fontWeight="bold">
                            قاعده کل متوازی‌الاضلاع = ({toPersianDigits(q.b1)} + {toPersianDigits(q.b2)} = {toPersianDigits(q.b1 + q.b2)}) متر
                          </text>
                        </g>
                      )}

                      {/* Original labels */}
                      <text x="160" y="42" fill="#fde68a" fontSize="13" textAnchor="middle" fontWeight="bold">
                        قاعده کوچک = {toPersianDigits(q.b1)}
                      </text>
                      <text x="170" y="190" fill="#fde68a" fontSize="13" textAnchor="middle" fontWeight="bold">
                        قاعده بزرگ = {toPersianDigits(q.b2)}
                      </text>
                      <text x="80" y="115" fill="#00f0ff" fontSize="13" textAnchor="middle" fontWeight="bold">
                        ارتفاع = {toPersianDigits(q.h)}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Informative explanation banner during simulation */}
              {isSimulated && q.type === 'trapezoid' && (
                <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs text-center max-w-lg animate-fadeIn">
                  ✨ <strong>مشاهده کردید؟</strong> ذوزنقه دوم (آبی‌رنگ) با چرخش ۱۸۰ درجه دقیقا در کنار ذوزنقه اول قرار گرفت و یک <strong>متوازی‌الاضلاع</strong> ساخت که قاعده‌اش برابر با <span className="text-amber-300 font-bold">({toPersianDigits(q.b1)} + {toPersianDigits(q.b2)})</span> است. چون مساحت متوازی‌الاضلاع برابر با (قاعده × ارتفاع) است، مساحت یک ذوزنقه دقیقاً <strong>نصف</strong> آن می‌شود: <span className="text-emerald-300 font-bold">((قاعده کوچک + قاعده بزرگ) × ارتفاع) ÷ ۲</span>.
                </div>
              )}

              {/* Step 2: Interactive Formula Insertion */}
              {isSimulated && (
                <div className="w-full space-y-4 pt-4 border-t border-slate-800 animate-fadeIn text-center">
                  <div className="text-xs md:text-sm text-cyan-300 font-medium">
                    مقادیر را در فرمول قرار داده و مساحت نهایی را محاسبه کنید:
                  </div>

                  <div className="flex items-center justify-center flex-wrap gap-2 text-lg md:text-xl font-mono text-white" dir="ltr">
                    {q.type === 'rhombus' ? (
                      <>
                        <span>(</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="قطر"
                          value={in1}
                          onChange={(e) => setIn1(e.target.value)}
                          className="w-16 h-10 text-center font-bold bg-slate-900 border border-pink-500 rounded-lg text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-xs"
                        />
                        <span>×</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="قطر"
                          value={in2}
                          onChange={(e) => setIn2(e.target.value)}
                          className="w-16 h-10 text-center font-bold bg-slate-900 border border-pink-500 rounded-lg text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-xs"
                        />
                        <span>) ÷ ۲ =</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="مساحت؟"
                          value={inAns}
                          onChange={(e) => setInAns(e.target.value)}
                          className="w-24 h-11 text-center font-bold bg-slate-900 border-2 border-cyan-400 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 placeholder:text-xs"
                        />
                      </>
                    ) : (
                      <>
                        <span>( (</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="قاعده"
                          value={in1}
                          onChange={(e) => setIn1(e.target.value)}
                          className="w-16 h-10 text-center font-bold bg-slate-900 border border-amber-500 rounded-lg text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-xs"
                        />
                        <span>+</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="قاعده"
                          value={in2}
                          onChange={(e) => setIn2(e.target.value)}
                          className="w-16 h-10 text-center font-bold bg-slate-900 border border-amber-500 rounded-lg text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-xs"
                        />
                        <span>) ×</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="ارتفاع"
                          value={in3}
                          onChange={(e) => setIn3(e.target.value)}
                          className="w-16 h-10 text-center font-bold bg-slate-900 border border-cyan-500 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-xs"
                        />
                        <span>) ÷ ۲ =</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="مساحت؟"
                          value={inAns}
                          onChange={(e) => setInAns(e.target.value)}
                          className="w-24 h-11 text-center font-bold bg-slate-900 border-2 border-cyan-400 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 placeholder:text-xs"
                        />
                      </>
                    )}
                  </div>

                  <button
                    onClick={checkAnswer}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all mx-auto mt-4"
                  >
                    <Check className="w-4 h-4" />
                    <span>تایید مساحت و برش سازه</span>
                  </button>
                </div>
              )}
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
        message="سازه سفینه دقیقاً برش خورد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
