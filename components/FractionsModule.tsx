'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Hammer, X, Check, Sparkles, Zap } from 'lucide-react';

interface FractionsModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

interface Question {
  w1: number;
  n1: number;
  d1: number;
  w2: number;
  n2: number;
  d2: number;
}

const TOTAL_STAGES = 15;

export function FractionsModule({
  onBack,
  onComplete,
  onCorrectAnswer,
  onLogMistake,
}: FractionsModuleProps) {
  const [slide, setSlide] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [score, setScore] = useState(0);
  const [tool, setTool] = useState<'break' | 'cross'>('break');

  const [question, setQuestion] = useState<Question>({ w1: 4, n1: 1, d1: 5, w2: 1, n2: 3, d2: 5 });
  const [wholes, setWholes] = useState<{ crossed: boolean }[]>([]);
  const [parts, setParts] = useState<{ crossed: boolean }[]>([]);

  const [ansWhole, setAnsWhole] = useState('');
  const [ansNum, setAnsNum] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      text: 'در رآکتور سفینه امید، کپسول‌های بزرگ، واحد کامل (۱) هستند و کپسول‌های باریک، قطعات کسری را تشکیل می‌دهند.',
      tip: 'کپسول بزرگ = ۱ واحد کامل · قطعات باریک = کسرها',
      mood: 'happy' as const,
    },
    {
      text: 'یکی از شایع‌ترین اشتباهات ریاضی: اگر قطعات کسری برای کم کردن کافی نباشد، هرگز نباید ارقام را برعکس از هم کم کرد!',
      tip: 'اشتباه رایج: تفریق صورت کوچک‌تر از بزرگ‌تر بدون شکستن واحد!',
      mood: 'warning' as const,
    },
    {
      text: 'با ابزار «🔨 خرد کردن واحد»، روی یکی از کپسول‌های کامل کلیک کنید تا به قطعات مساوی بشکند. سپس با ابزار «❌ خط زدن»، مقادیر لازم را کم کنید.',
      tip: 'یک واحد کامل به تعداد مخرج خرد می‌شود و به قطعات قبلی اضافه می‌گردد.',
      mood: 'excited' as const,
    },
  ];

  const generateQuestion = () => {
    const denominators = [3, 4, 5, 6, 8, 10];
    const den = denominators[Math.floor(Math.random() * denominators.length)];
    const w1 = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const w2 = Math.floor(Math.random() * 2) + 1; // 1 to 2
    const n1 = Math.floor(Math.random() * (den - 2)) + 1;
    const n2 = Math.floor(Math.random() * (den - n1 - 1)) + n1 + 1; // n2 > n1

    const q: Question = { w1, n1, d1: den, w2, n2, d2: den };
    setQuestion(q);
    setWholes(Array(w1).fill(0).map(() => ({ crossed: false })));
    setParts(Array(n1).fill(0).map(() => ({ crossed: false })));
    setTool('break');
    setAnsWhole('');
    setAnsNum('');
    setFeedback(null);
  };

  const handleStartGame = () => {
    SoundFX.success();
    setInGame(true);
    setScore(0);
    generateQuestion();
  };

  const handleWholeClick = (index: number) => {
    if (tool === 'break') {
      if (wholes[index].crossed) return;
      SoundFX.shatter();
      const nextWholes = [...wholes];
      nextWholes.splice(index, 1);
      setWholes(nextWholes);

      const addedParts = Array(question.d1).fill(0).map(() => ({ crossed: false }));
      setParts((prev) => [...prev, ...addedParts]);
    } else {
      SoundFX.click();
      setWholes((prev) =>
        prev.map((w, i) => (i === index ? { ...w, crossed: !w.crossed } : w))
      );
    }
  };

  const handlePartClick = (index: number) => {
    if (tool === 'cross') {
      SoundFX.click();
      setParts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, crossed: !p.crossed } : p))
      );
    }
  };

  const checkAnswer = () => {
    const rawW = parseInt(toEnglishNumber(ansWhole), 10);
    const rawN = parseInt(toEnglishNumber(ansNum), 10);

    const userW = isNaN(rawW) ? 0 : rawW;
    const userN = isNaN(rawN) ? 0 : rawN;

    const totalParts1 = question.w1 * question.d1 + question.n1;
    const totalParts2 = question.w2 * question.d2 + question.n2;
    const diff = totalParts1 - totalParts2;

    const correctW = Math.floor(diff / question.d1);
    const correctN = diff % question.d1;

    if (userW === correctW && userN === correctN) {
      SoundFX.success();
      SoundFX.lifeEnergy();
      const newScore = score + 1;
      setScore(newScore);

      // Trigger reward
      onCorrectAnswer(20);
      setShowCelebration(true);

      setFeedback({
        type: 'success',
        message: `آفرین مهندس! مرحله ${toPersianDigits(newScore)} از ${toPersianDigits(TOTAL_STAGES)} با موفقیت حل شد و ۲۰ انرژی حیات به دست آمد.`,
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
        message: `پاسخ نادرست است. باید ابتدا ۱ واحد را به ${toPersianDigits(question.d1)} قطعه خرد کنی تا قطعاتت به ${toPersianDigits(question.n1 + question.d1)} برسد و بتوانی تفریق کنی!`,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
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
              <span>پاداش هر پاسخ: +۲۰ انرژی</span>
            </div>

            <div className="px-4 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      {/* Main card with reactor thematic background */}
      <div
        className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.12), transparent 50%)',
        }}
      >
        <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <span>موتورخانه: کیمیاگر رآکتور سوخت (کسرها - ۱۵ مرحله)</span>
        </h2>

        {!inGame ? (
          /* Lesson slides */
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
                  <span>آغاز عملیات ۱۵ مرحله‌ای</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Interactive Game Arena */
          <div className="space-y-6">
            {/* Mathematical Problem Display */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-2">
                مرحله {toPersianDigits(score + 1)} از {toPersianDigits(TOTAL_STAGES)}: حاصل تفریق زیر را بیابید:
              </div>
              <div className="inline-flex items-center gap-4 text-2xl md:text-3xl font-mono text-cyan-200" dir="ltr">
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-bold text-3xl text-white">{question.w1}</span>
                  <div className="inline-flex flex-col items-center text-lg leading-none">
                    <span className="border-b-2 border-cyan-400 px-1">{question.n1}</span>
                    <span className="px-1">{question.d1}</span>
                  </div>
                </div>

                <span className="text-rose-400 text-3xl font-bold">−</span>

                <div className="inline-flex items-center gap-1.5">
                  <span className="font-bold text-3xl text-white">{question.w2}</span>
                  <div className="inline-flex flex-col items-center text-lg leading-none">
                    <span className="border-b-2 border-rose-400 px-1">{question.n2}</span>
                    <span className="px-1">{question.d2}</span>
                  </div>
                </div>

                <span className="text-slate-400 font-sans">=</span>
                <span className="text-amber-400 font-sans">؟</span>
              </div>
            </div>

            {/* Interactive Reactor Sandbox */}
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-dashed border-cyan-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400">ابزار فعال مهندسی:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      SoundFX.click();
                      setTool('break');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tool === 'break'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>🔨 خرد کردن واحد</span>
                  </button>

                  <button
                    onClick={() => {
                      SoundFX.click();
                      setTool('cross');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tool === 'cross'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>❌ خط زدن (کم کردن)</span>
                  </button>
                </div>
              </div>

              {/* Reactor Inventory */}
              <div className="min-h-[120px] flex flex-wrap items-end justify-center gap-4 py-4 px-2">
                {wholes.map((w, idx) => (
                  <button
                    key={`whole-${idx}`}
                    onClick={() => handleWholeClick(idx)}
                    className={`relative w-12 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer select-none group ${
                      w.crossed
                        ? 'opacity-40 border-slate-600 bg-slate-800'
                        : 'border-cyan-400 bg-gradient-to-t from-blue-900/90 to-cyan-500/80 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">۱ واحد</span>
                    {w.crossed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-10 h-10 text-rose-500 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}

                {parts.length > 0 && (
                  <div className="flex flex-col-reverse gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-700 min-h-[96px] justify-start">
                    <span className="text-[10px] text-cyan-300 text-center font-mono">
                      {parts.length} قطعه (هر قطعه ۱/{question.d1})
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[200px] justify-center">
                      {parts.map((p, idx) => (
                        <button
                          key={`part-${idx}`}
                          onClick={() => handlePartClick(idx)}
                          className={`relative w-8 h-4 rounded-md border transition-all ${
                            p.crossed
                              ? 'opacity-30 border-slate-700 bg-slate-800'
                              : 'border-cyan-300 bg-cyan-400 shadow-sm shadow-cyan-400 hover:scale-110 active:scale-95'
                          }`}
                        >
                          {p.crossed && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <X className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-slate-400">
                💡 راهنمایی: با چکش روی یک واحد کلیک کن تا خرد شود؛ سپس با ضربدر،{' '}
                <span className="text-white font-bold">{toPersianDigits(question.w2)}</span> واحد کامل و{' '}
                <span className="text-white font-bold">{toPersianDigits(question.n2)}</span> قطعه را خط بزن.
              </div>
            </div>

            {/* Answer Input Area */}
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-sm text-slate-300">مقدار باقی‌مانده نهایی:</span>

              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="صحیح"
                  value={ansWhole}
                  onChange={(e) => setAnsWhole(e.target.value)}
                  className="w-16 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />

                <div className="flex flex-col items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="صورت"
                    value={ansNum}
                    onChange={(e) => setAnsNum(e.target.value)}
                    className="w-16 h-7 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <div className="w-16 h-0.5 bg-cyan-400" />
                  <input
                    type="text"
                    disabled
                    value={question.d1}
                    className="w-16 h-7 text-center text-base font-bold bg-slate-900/60 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={checkAnswer}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>تزریق سوخت و دریافت انرژی</span>
              </button>
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

      {/* Encouraging Celebration Animation */}
      <CelebrationOverlay
        show={showCelebration}
        message="رآکتور سوخت تقویت شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
