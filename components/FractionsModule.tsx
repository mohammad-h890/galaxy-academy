'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Flame, Zap } from 'lucide-react';

interface FractionsModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

type FractionSubTopic =
  | 'subtraction'
  | 'mixed_improper'
  | 'multiplication'
  | 'division'
  | 'simplification';

// Helper component for standard Persian visual fraction (Whole on the left, Fraction on the right)
export function FractionDisplay({
  whole,
  num,
  den,
  color = 'text-cyan-300',
}: {
  whole?: number;
  num: number;
  den: number;
  color?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${color}`} dir="ltr">
      {whole !== undefined && whole > 0 && (
        <span className="text-3xl text-white font-extrabold">{toPersianDigits(whole)}</span>
      )}
      <span className="inline-flex flex-col items-center leading-none text-xl">
        <span className="border-b-2 border-current px-2 pb-0.5">{toPersianDigits(num)}</span>
        <span className="px-2 pt-0.5">{toPersianDigits(den)}</span>
      </span>
    </span>
  );
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
  const [subTopic, setSubTopic] = useState<FractionSubTopic>('subtraction');

  // 1. Subtraction
  const [subQ, setSubQ] = useState({ w1: 4, n1: 1, d1: 5, w2: 1, n2: 3, d2: 5 });
  const [wholes, setWholes] = useState<{ crossed: boolean }[]>([]);
  const [parts, setParts] = useState<{ crossed: boolean }[]>([]);
  const [ansSubWhole, setAnsSubWhole] = useState('');
  const [ansSubNum, setAnsSubNum] = useState('');

  // 2. Mixed <-> Improper
  const [mixedQ, setMixedQ] = useState({ w: 3, n: 2, d: 5, improperN: 17 });
  const [mixedMode, setMixedMode] = useState<'to_improper' | 'to_mixed'>('to_improper');
  const [ansImproper, setAnsImproper] = useState('');
  const [ansMixedW, setAnsMixedW] = useState('');
  const [ansMixedN, setAnsMixedN] = useState('');

  // 3. Multiplication Area Model (3-step laser animation)
  const [mulQ, setMulQ] = useState({ n1: 2, d1: 3, n2: 3, d2: 4, resN: 6, resD: 12 });
  const [laserStep, setLaserStep] = useState<0 | 1 | 2 | 3>(0);
  const [ansMulN, setAnsMulN] = useState('');
  const [ansMulD, setAnsMulD] = useState('');

  // 4. Division
  const [divQ, setDivQ] = useState({
    n1: 1,
    d1: 2,
    n2: 3,
    d2: 1,
    resN: 1,
    resD: 6,
    story: 'نصف کپسول سوخت بین ۳ رآکتور به طور مساوی تقسیم می‌شود. سهم هر رآکتور چیست؟',
  });
  const [ansDivN, setAnsDivN] = useState('');
  const [ansDivD, setAnsDivD] = useState('');

  // 5. Simplification with larger non-trivial numbers and factors
  const [simQ, setSimQ] = useState({
    n1: 24,
    d1: 35,
    n2: 21,
    d2: 60,
    f1: 12,
    f2: 7,
    sn1: 2,
    sd1: 5,
    sn2: 3,
    sd2: 5,
    resN: 6,
    resD: 25,
    hint1: 'هر دو عدد ۲۴ و ۶۰ بر ۱۲ بخش‌پذیرند (۲۴ = ۲×۱۲ و ۶۰ = ۵×۱۲).',
    hint2: 'هر دو عدد ۲۱ و ۳۵ بر ۷ بخش‌پذیرند (۲۱ = ۳×۷ و ۳۵ = ۵×۷).',
  });
  const [simplifiedDone, setSimplifiedDone] = useState(false);
  const [diag1Done, setDiag1Done] = useState(false);
  const [diag2Done, setDiag2Done] = useState(false);
  const [diag1Input, setDiag1Input] = useState('');
  const [diag2Input, setDiag2Input] = useState('');
  const [ansSimN, setAnsSimN] = useState('');
  const [ansSimD, setAnsSimD] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      title: '۱. کسر بزرگتر از واحد و عددهای مخلوط (ص ۲۲ تا ۲۶)',
      text: 'در ریاضی فارسی، عدد صحیح در سمت چپ کسر قرار می‌گیرد. در تبدیل عدد مخلوط به کسر، مخرج ضرب در عدد صحیح شده و با صورت جمع می‌شود. روی محور اعداد نیز مبدا صفر در سمت چپ قرار دارد و هر چه به راست می‌رویم اعداد بزرگتر می‌شوند.',
      tip: 'فرمول: صورت کسر جدید = (عدد صحیح × مخرج) + صورت کسر قبلی',
      mood: 'happy' as const,
    },
    {
      title: '۲. شکستن واحد در تفریق عددهای مخلوط (ص ۲۷ تا ۳۱)',
      text: 'در تفریق، کسر بزرگتر در سمت چپ و کسر کوچکتر در سمت راست علامت تفریق قرار دارد. اگر صورت کسر اول کمتر بود، ۱ واحد کامل از عدد صحیح سمت چپ خرد کنید تا به کسر اضافه شود.',
      tip: 'هرگز صورت‌ها را برعکس کم نکنید؛ ابتدا ۱ واحد کامل خرد کنید!',
      mood: 'warning' as const,
    },
    {
      title: '۳. شبیه‌سازی ۳ مرحله‌ای ضرب کسر در کسر (ص ۳۲ تا ۳۵)',
      text: 'ابتدا کسر اول به صورت ردیف‌های افقی رسم می‌شود. سپس کسر دوم به صورت ستون‌های عمودی رسم می‌شود. در مرحله سوم، هر دو کسر با هم ادغام می‌شوند و خانه‌های مشترک دو بار رنگ‌آمیزی می‌شوند.',
      tip: 'تعداد کل خانه‌ها = حاصلضرب مخرج‌ها · تعداد خانه‌های مشترک = حاصلضرب صورت‌ها',
      mood: 'excited' as const,
    },
    {
      title: '۴. تقسیم کسرها و معکوس کردن (ص ۳۶ تا ۳۹)',
      text: 'برای تقسیم، کسر اول در سمت چپ باقی می‌ماند، علامت تقسیم به ضرب تبدیل شده و کسر دوم معکوس (وارونه) می‌شود.',
      tip: 'قانون طلایی: کسر اول × معکوس کسر دوم',
      mood: 'happy' as const,
    },
    {
      title: '۵. ساده‌کردن ضربدری پیش از ضرب (ص ۴۱ تا ۴۳)',
      text: 'پیش از ضرب، عامل‌های مشترک بین صورت یک کسر و مخرج کسر دیگر را ساده کنید تا به اعداد کوچک و روان برسید.',
      tip: 'تقسیم صورت و مخرج بر ب.م.م مشترک قبل از ضرب مانع اعداد بزرگ می‌شود.',
      mood: 'excited' as const,
    },
  ];

  // Dynamic question generator with randomized non-repeating numbers
  const generateQuestionForStage = (currentStage: number) => {
    setFeedback(null);
    const topics: FractionSubTopic[] = [
      'subtraction',
      'mixed_improper',
      'multiplication',
      'division',
      'simplification',
    ];
    const chosenTopic = topics[currentStage % topics.length];
    setSubTopic(chosenTopic);

    // Dynamic denominators pool
    const denPool = [3, 4, 5, 6, 7, 8, 9, 10];
    const randD = denPool[Math.floor(Math.random() * denPool.length)];

    if (chosenTopic === 'subtraction') {
      const w1 = Math.floor(Math.random() * 3) + 3; // 3 to 5
      const w2 = Math.floor(Math.random() * 2) + 1; // 1 to 2
      const n1 = Math.floor(Math.random() * 2) + 1; // small: 1 or 2
      const n2 = Math.min(randD - 1, n1 + Math.floor(Math.random() * 3) + 2); // n2 > n1 guaranteed
      setSubQ({ w1, n1, d1: randD, w2, n2, d2: randD });
      setWholes(Array(w1).fill(0).map(() => ({ crossed: false })));
      setParts(Array(n1).fill(0).map(() => ({ crossed: false })));
      setAnsSubWhole('');
      setAnsSubNum('');
    } else if (chosenTopic === 'mixed_improper') {
      const d = [3, 4, 5, 6, 7, 8][Math.floor(Math.random() * 6)];
      const w = Math.floor(Math.random() * 4) + 2; // 2 to 5
      const n = Math.floor(Math.random() * (d - 1)) + 1;
      const improperN = w * d + n;
      const mode = Math.random() > 0.5 ? 'to_improper' : 'to_mixed';
      setMixedQ({ w, n, d, improperN });
      setMixedMode(mode);
      setAnsImproper('');
      setAnsMixedW('');
      setAnsMixedN('');
    } else if (chosenTopic === 'multiplication') {
      const d1 = [3, 4, 5][Math.floor(Math.random() * 3)];
      const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
      const d2 = [3, 4, 5][Math.floor(Math.random() * 3)];
      const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
      setMulQ({ n1, d1, n2, d2, resN: n1 * n2, resD: d1 * d2 });
      setLaserStep(0);
      setAnsMulN('');
      setAnsMulD('');
    } else if (chosenTopic === 'division') {
      const d = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
      const count = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      setDivQ({
        n1: 1,
        d1: d,
        n2: count,
        d2: 1,
        resN: 1,
        resD: d * count,
        story: `یک بسته سوخت کپسولی باید به طور کاملاً مساوی بین ${toPersianDigits(count)} بخش سفینه سهم‌بندی شود:`,
      });
      setAnsDivN('');
      setAnsDivD('');
    } else {
      // Simplification with larger non-trivial numbers and factors (7, 8, 9, 11, 12, 14, 15, 16, 18, 20, 25)
      const largeDiagonalPairs = [
        { f: 7, sn: 2, sd: 5, num: 14, den: 35, hint: 'هر دو عدد در جدول ضرب ۷ هستند (۱۴ = ۲×۷ و ۳۵ = ۵×۷).' },
        { f: 7, sn: 3, sd: 4, num: 21, den: 28, hint: 'هر دو عدد در جدول ضرب ۷ هستند (۲۱ = ۳×۷ و ۲۸ = ۴×۷).' },
        { f: 7, sn: 4, sd: 7, num: 28, den: 49, hint: 'هر دو عدد بر ۷ بخش‌پذیرند (۲۸ = ۴×۷ و ۴۹ = ۷×۷).' },
        { f: 8, sn: 3, sd: 5, num: 24, den: 40, hint: 'هر دو عدد در جدول ضرب ۸ قرار دارند (۲۴ = ۳×۸ و ۴۰ = ۵×۸).' },
        { f: 8, sn: 4, sd: 7, num: 32, den: 56, hint: 'بزرگ‌ترین شمارنده مشترک هر دو عدد ۸ است (۳۲ = ۴×۸ و ۵۶ = ۷×۸).' },
        { f: 9, sn: 3, sd: 5, num: 27, den: 45, hint: 'مجموع ارقام هر دو عدد ۹ است و بر ۹ بخش‌پذیرند (۲۷ = ۳×۹ و ۴۵ = ۵×۹).' },
        { f: 9, sn: 4, sd: 7, num: 36, den: 63, hint: 'هر دو عدد در جدول ضرب ۹ هستند (۳۶ = ۴×۹ و ۶۳ = ۷×۹).' },
        { f: 11, sn: 2, sd: 5, num: 22, den: 55, hint: 'هر دو عدد تکرار ارقام دارند و بر ۱۱ بخش‌پذیرند (۲۲ = ۲×۱۱ و ۵۵ = ۵×۱۱).' },
        { f: 11, sn: 3, sd: 7, num: 33, den: 77, hint: 'هر دو عدد بر شمارنده ۱۱ بخش‌پذیرند (۳۳ = ۳×۱۱ و ۷۷ = ۷×۱۱).' },
        { f: 12, sn: 2, sd: 5, num: 24, den: 60, hint: 'بزرگ‌ترین شمارنده مشترک عدد ۱۲ است (۲۴ = ۲×۱۲ و ۶۰ = ۵×۱۲).' },
        { f: 12, sn: 3, sd: 4, num: 36, den: 48, hint: 'بزرگ‌ترین مقسوم‌علیه مشترک عدد ۱۲ است (۳۶ = ۳×۱۲ و ۴۸ = ۴×۱۲).' },
        { f: 14, sn: 2, sd: 3, num: 28, den: 42, hint: 'هر دو عدد بر ۱۴ بخش‌پذیرند (۲۸ = ۲×۱۴ و ۴۲ = ۳×۱۴).' },
        { f: 15, sn: 2, sd: 3, num: 30, den: 45, hint: 'بزرگ‌ترین شمارنده مشترک عدد ۱۵ است (۳۰ = ۲×۱۵ و ۴۵ = ۳×۱۵).' },
        { f: 15, sn: 3, sd: 5, num: 45, den: 75, hint: 'هر دو عدد بر ۱۵ بخش‌پذیرند (۴۵ = ۳×۱۵ و ۷۵ = ۵×۱۵).' },
        { f: 16, sn: 2, sd: 5, num: 32, den: 80, hint: 'بزرگ‌ترین مقسوم‌علیه مشترک ۱۶ است (۳۲ = ۲×۱۶ و ۸۰ = ۵×۱۶).' },
        { f: 18, sn: 2, sd: 3, num: 36, den: 54, hint: 'هر دو عدد بر ۱۸ بخش‌پذیرند (۳۶ = ۲×۱۸ و ۵۴ = ۳×۱۸).' },
        { f: 20, sn: 2, sd: 3, num: 40, den: 60, hint: 'بزرگ‌ترین شمارنده مشترک ۲۰ است (۴۰ = ۲×۲۰ و ۶۰ = ۳×۲۰).' },
        { f: 25, sn: 2, sd: 3, num: 50, den: 75, hint: 'هر دو عدد مضرب ۲۵ هستند (۵۰ = ۲×۲۵ و ۷۵ = ۳×۲۵).' },
      ];

      // Select two distinct pairs
      const idx1 = Math.floor(Math.random() * largeDiagonalPairs.length);
      let idx2 = Math.floor(Math.random() * (largeDiagonalPairs.length - 1));
      if (idx2 >= idx1) idx2++;

      const p1 = largeDiagonalPairs[idx1];
      const p2 = largeDiagonalPairs[idx2];

      // Diagonal 1: n1 and d2
      const n1 = p1.num;
      const d2 = p1.den;
      const f1 = p1.f;
      const sn1 = p1.sn;
      const sd2 = p1.sd;

      // Diagonal 2: n2 and d1
      const n2 = p2.num;
      const d1 = p2.den;
      const f2 = p2.f;
      const sn2 = p2.sn;
      const sd1 = p2.sd;

      setSimQ({
        n1,
        d1,
        n2,
        d2,
        f1,
        f2,
        sn1,
        sd1,
        sn2,
        sd2,
        resN: sn1 * sn2,
        resD: sd1 * sd2,
        hint1: p1.hint,
        hint2: p2.hint,
      });
      setSimplifiedDone(false);
      setDiag1Done(false);
      setDiag2Done(false);
      setDiag1Input('');
      setDiag2Input('');
      setAnsSimN('');
      setAnsSimD('');
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
      {/* Header */}
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
          <Flame className="w-6 h-6 text-cyan-400" />
          <span>موتورخانه سفینه: ۵ گلوگاه مفهومی کسرها</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          تبدیل عدد مخلوط، شکستن واحد در تفریق، شبیه‌سازی ۳ مرحله‌ای ضرب مساحتی، سهم‌بندی تقسیم و ساده‌سازی
        </p>

        {!inGame ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 font-bold text-base">
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
                  <span>آغاز عملیات ۱۵ مرحله‌ای موتورخانه</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SUB-TOPIC 1: SUBTRACTION (Larger fraction on Left, Smaller on Right) */}
            {subTopic === 'subtraction' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 mb-3">
                    تفریق عددهای مخلوط (کسر بزرگتر در سمت چپ و کسر کوچکتر در سمت راست قرار دارد):
                  </div>
                  {/* Math equation: Larger on Left, Minus, Smaller on Right (dir="ltr") */}
                  <div className="inline-flex items-center justify-center gap-5 text-2xl md:text-3xl text-white" dir="ltr">
                    {/* Left: Larger Mixed Fraction */}
                    <div className="p-3 px-5 rounded-2xl bg-slate-900 border border-cyan-500/40">
                      <FractionDisplay
                        whole={subQ.w1}
                        num={subQ.n1}
                        den={subQ.d1}
                        color="text-cyan-300"
                      />
                    </div>

                    <span className="text-rose-400 font-extrabold text-3xl">−</span>

                    {/* Right: Smaller Mixed Fraction */}
                    <div className="p-3 px-5 rounded-2xl bg-slate-900 border border-rose-500/40">
                      <FractionDisplay
                        whole={subQ.w2}
                        num={subQ.n2}
                        den={subQ.d2}
                        color="text-rose-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950/90 border border-dashed border-cyan-500/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">کپسول‌های سوخت کسر:</span>
                    <button
                      onClick={() => {
                        SoundFX.shatter();
                        const nextWholes = [...wholes];
                        nextWholes.pop();
                        setWholes(nextWholes);
                        const addedParts = Array(subQ.d1).fill(0).map(() => ({ crossed: false }));
                        setParts((prev) => [...prev, ...addedParts]);
                      }}
                      disabled={wholes.length <= subQ.w1 - 1}
                      className="px-4 py-2 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-xs text-slate-950 font-bold shadow-md active:scale-95 transition-all"
                    >
                      🔨 خرد کردن ۱ واحد کامل به {toPersianDigits(subQ.d1)} قطعه
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 py-2">
                    {wholes.map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-14 rounded-xl bg-cyan-600/30 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300 text-sm"
                      >
                        ۱ کامل
                      </div>
                    ))}
                    {parts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-blue-950/60 border border-blue-500/40">
                        {parts.map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-13 rounded-lg bg-emerald-500/40 border border-emerald-400 flex flex-col items-center justify-center text-[10px] text-emerald-200 font-bold leading-none p-1"
                          >
                            <span className="border-b border-emerald-300 pb-0.5">{toPersianDigits(1)}</span>
                            <span className="pt-0.5">{toPersianDigits(subQ.d1)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer form: Whole on the Left, Fraction on the Right (dir="ltr") */}
                <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">پاسخ نهایی تفریق:</span>
                  <div className="flex items-center gap-4" dir="ltr">
                    {/* Left: Whole input */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-400">عدد صحیح</span>
                      <input
                        type="text"
                        placeholder="صحیح"
                        value={ansSubWhole}
                        onChange={(e) => setAnsSubWhole(e.target.value)}
                        className="w-16 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                    {/* Right: Fraction input */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-400">کسر حاصل</span>
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="text"
                          placeholder="صورت"
                          value={ansSubNum}
                          onChange={(e) => setAnsSubNum(e.target.value)}
                          className="w-16 h-7 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <div className="w-16 h-0.5 bg-cyan-400" />
                        <div className="text-slate-400 font-bold text-sm">
                          {toPersianDigits(subQ.d1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const uW = parseInt(toEnglishNumber(ansSubWhole), 10);
                      const uN = parseInt(toEnglishNumber(ansSubNum), 10);
                      const expW = subQ.w1 - 1 - subQ.w2;
                      const expN = subQ.n1 + subQ.d1 - subQ.n2;
                      if (uW === expW && uN === expN) {
                        setFeedback({
                          type: 'success',
                          message: 'آفرین! یک واحد خرد شد و تفریق با موفقیت انجام گرفت.',
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        // Guiding hint without directly revealing answer
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: دقت کنید! با خرد شدن ۱ واحد، عدد صحیح از ${toPersianDigits(subQ.w1)} به ${toPersianDigits(subQ.w1 - 1)} کاهش یافته و به صورت کسر مقدار ${toPersianDigits(subQ.d1)} واحد اضافه می‌شود. دوباره تفریق را محاسبه کنید!`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید تفریق 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 2: MIXED <-> IMPROPER (Real Vertical Fraction + Left-to-Right Axis) */}
            {subTopic === 'mixed_improper' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 mb-3">تبدیل مفهومی عدد مخلوط و کسر بزرگتر از واحد:</div>
                  {mixedMode === 'to_improper' ? (
                    <div className="flex items-center justify-center gap-3 text-xl font-bold text-white">
                      <span>عدد مخلوط</span>
                      <FractionDisplay whole={mixedQ.w} num={mixedQ.n} den={mixedQ.d} color="text-cyan-300" />
                      <span>معادل چه کسری بزرگتر از واحد با مخرج {toPersianDigits(mixedQ.d)} است؟</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 text-xl font-bold text-white">
                      <span>کسر بزرگتر از واحد</span>
                      <FractionDisplay num={mixedQ.improperN} den={mixedQ.d} color="text-amber-300" />
                      <span>معادل چه عدد مخلوطی است؟</span>
                    </div>
                  )}
                </div>

                {/* Number line: Zero on Left, Growing towards Right */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-center space-y-2">
                  <div className="text-xs text-slate-400">
                    محور اعداد (شروع از صفر در سمت چپ و افزایش به سمت راست):
                  </div>
                  <div className="relative w-full h-14 bg-slate-900 rounded-xl flex items-center px-6 overflow-hidden border border-slate-800" dir="ltr">
                    <div className="absolute left-6 right-6 h-1 bg-slate-700" />
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${(i / 6) * 88 + 6}%` }}
                      >
                        <div className="w-0.5 h-3 bg-cyan-400" />
                        <span className="text-[11px] text-cyan-300 mt-1 font-bold">
                          {toPersianDigits(i)}
                        </span>
                      </div>
                    ))}
                    {/* Position Marker */}
                    <div
                      className="absolute w-5 h-5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/60 -translate-x-1/2 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{
                        left: `${((mixedQ.w + mixedQ.n / mixedQ.d) / 6) * 88 + 6}%`,
                      }}
                    >
                      ★
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  {mixedMode === 'to_improper' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 font-semibold">صورت کسر بزرگتر از واحد:</span>
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="text"
                          placeholder="صورت"
                          value={ansImproper}
                          onChange={(e) => setAnsImproper(e.target.value)}
                          className="w-20 h-10 text-center text-lg font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <div className="w-20 h-0.5 bg-cyan-400" />
                        <span className="text-slate-400 font-bold">{toPersianDigits(mixedQ.d)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3" dir="ltr">
                      {/* Left: Whole input */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] text-slate-400">عدد صحیح</span>
                        <input
                          type="text"
                          placeholder="صحیح"
                          value={ansMixedW}
                          onChange={(e) => setAnsMixedW(e.target.value)}
                          className="w-16 h-12 text-center text-xl font-bold bg-slate-900 border border-cyan-500/60 rounded-xl text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                      {/* Right: Fraction input */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] text-slate-400">کسر</span>
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="text"
                            placeholder="صورت"
                            value={ansMixedN}
                            onChange={(e) => setAnsMixedN(e.target.value)}
                            className="w-16 h-7 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                          <div className="w-16 h-0.5 bg-cyan-400" />
                          <span className="text-xs text-slate-400 font-bold">{toPersianDigits(mixedQ.d)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (mixedMode === 'to_improper') {
                        const uN = parseInt(toEnglishNumber(ansImproper), 10);
                        if (uN === mixedQ.improperN) {
                          setFeedback({
                            type: 'success',
                            message: 'بسیار عالی! تبدیل به درستی و بر مبنای فرمول انجام شد.',
                          });
                          advanceStage();
                        } else {
                          onLogMistake();
                          SoundFX.error();
                          setFeedback({
                            type: 'error',
                            message: `راهنمایی: عدد صحیح (${toPersianDigits(mixedQ.w)}) را در مخرج (${toPersianDigits(mixedQ.d)}) ضرب کنید و با صورت قبلی جمع کنید. یک بار دیگر محاسبه کنید!`,
                          });
                        }
                      } else {
                        const uW = parseInt(toEnglishNumber(ansMixedW), 10);
                        const uN = parseInt(toEnglishNumber(ansMixedN), 10);
                        if (uW === mixedQ.w && uN === mixedQ.n) {
                          setFeedback({
                            type: 'success',
                            message: 'احسنت! عدد مخلوط دقیقاً استخراج شد.',
                          });
                          advanceStage();
                        } else {
                          onLogMistake();
                          SoundFX.error();
                          setFeedback({
                            type: 'error',
                            message: `راهنمایی: صورت (${toPersianDigits(mixedQ.improperN)}) را بر مخرج (${toPersianDigits(mixedQ.d)}) تقسیم کنید. خارج‌قسمت عدد صحیح و باقیمانده صورت کسر خواهد شد.`,
                          });
                        }
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید تبدیل 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 3: MULTIPLICATION AREA MODEL (3-STEP LASER) */}
            {subTopic === 'multiplication' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 mb-2">مدل مساحتی ضرب کسر در کسر:</div>
                  <div className="flex items-center justify-center gap-4 text-2xl text-cyan-300 font-bold">
                    <FractionDisplay num={mulQ.n1} den={mulQ.d1} color="text-cyan-300" />
                    <span className="text-rose-400 font-extrabold text-3xl">×</span>
                    <FractionDisplay num={mulQ.n2} den={mulQ.d2} color="text-amber-300" />
                    <span>= ؟</span>
                  </div>
                </div>

                {/* 3-Step Laser Simulation Area */}
                <div className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        SoundFX.click();
                        setLaserStep(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        laserStep === 1
                          ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ۱. نمایش کسر اول (افقی)
                    </button>
                    <button
                      onClick={() => {
                        SoundFX.click();
                        setLaserStep(2);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        laserStep === 2
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ۲. نمایش کسر دوم (عمودی)
                    </button>
                    <button
                      onClick={() => {
                        SoundFX.laser();
                        setLaserStep(3);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        laserStep === 3
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ۳. ادغام و نمایش همپوشانی مشترک ✂️
                    </button>
                  </div>

                  {/* Rectangle Grid Canvas */}
                  <div
                    className="w-64 h-48 bg-slate-900 border-2 border-slate-700 rounded-xl grid relative overflow-hidden transition-all duration-500"
                    style={{
                      gridTemplateColumns: `repeat(${mulQ.d2}, 1fr)`,
                      gridTemplateRows: `repeat(${mulQ.d1}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: mulQ.d1 * mulQ.d2 }).map((_, idx) => {
                      const row = Math.floor(idx / mulQ.d2);
                      const col = idx % mulQ.d2;
                      const isRowActive = row < mulQ.n1;
                      const isColActive = col < mulQ.n2;

                      let cellBg = 'bg-transparent';
                      if (laserStep === 1 && isRowActive) cellBg = 'bg-cyan-500/40 border border-cyan-400';
                      if (laserStep === 2 && isColActive) cellBg = 'bg-amber-500/40 border border-amber-400';
                      if (laserStep === 3) {
                        if (isRowActive && isColActive) {
                          cellBg = 'bg-emerald-500/80 border-2 border-emerald-300 shadow-inner';
                        } else if (isRowActive) {
                          cellBg = 'bg-cyan-500/25';
                        } else if (isColActive) {
                          cellBg = 'bg-amber-500/25';
                        }
                      }

                      return <div key={idx} className={`border border-slate-800 transition-all duration-300 ${cellBg}`} />;
                    })}
                  </div>

                  <div className="text-xs text-slate-400 text-center max-w-md">
                    {laserStep === 0 && 'برای فهم شهودی مدل مساحتی، مراحل ۱، ۲ و ۳ را به ترتیب کلیک کنید.'}
                    {laserStep === 1 && `مستطیل به ${toPersianDigits(mulQ.d1)} ردیف تقسیم شده و ${toPersianDigits(mulQ.n1)} ردیف آبی رنگ شد.`}
                    {laserStep === 2 && `مستطیل به ${toPersianDigits(mulQ.d2)} ستون تقسیم شده و ${toPersianDigits(mulQ.n2)} ستون زرد رنگ شد.`}
                    {laserStep === 3 && `رنگ سبز درخشان = ناحیه همپوشانی ضرب (حاصلضرب صورت‌ها بر کل خانه‌ها).`}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">حاصلضرب نهایی کسرها:</span>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="text"
                      placeholder="صورت"
                      value={ansMulN}
                      onChange={(e) => setAnsMulN(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <div className="w-20 h-0.5 bg-cyan-400" />
                    <input
                      type="text"
                      placeholder="مخرج"
                      value={ansMulD}
                      onChange={(e) => setAnsMulD(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const uN = parseInt(toEnglishNumber(ansMulN), 10);
                      const uD = parseInt(toEnglishNumber(ansMulD), 10);
                      if (uN === mulQ.resN && uD === mulQ.resD) {
                        setFeedback({ type: 'success', message: 'فوق‌العاده! مدل مساحتی و ضرب صورت در صورت و مخرج در مخرج کاملاً تایید شد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: صورت جدید از ضرب صورت‌ها (${toPersianDigits(mulQ.n1)} × ${toPersianDigits(mulQ.n2)}) و مخرج جدید از ضرب مخرج‌ها (${toPersianDigits(mulQ.d1)} × ${toPersianDigits(mulQ.d2)}) حاصل می‌شود.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید ضرب 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 4: DIVISION (Real Vertical Fractions) */}
            {subTopic === 'division' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                  <div className="text-xs text-slate-400">مسئله سهم‌بندی و تقسیم کسرها:</div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base text-slate-200 font-semibold">
                    <span>یک بسته سوخت به اندازه</span>
                    <FractionDisplay num={divQ.n1} den={divQ.d1} color="text-amber-300" />
                    <span>کپسول، باید بین <span className="text-cyan-300 font-bold">{toPersianDigits(divQ.n2)}</span> بخش سفینه به طور مساوی سهم‌بندی شود:</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-2xl font-bold text-amber-300" dir="ltr">
                    <FractionDisplay num={divQ.n1} den={divQ.d1} color="text-cyan-300" />
                    <span className="text-rose-400 font-extrabold text-3xl">÷</span>
                    <span className="text-white text-3xl font-extrabold">{toPersianDigits(divQ.n2)}</span>
                    <span className="text-slate-400 font-sans">=</span>
                    <FractionDisplay num={divQ.n1} den={divQ.d1} color="text-cyan-300" />
                    <span className="text-emerald-400 font-extrabold text-3xl">×</span>
                    <FractionDisplay num={1} den={divQ.n2} color="text-amber-300" />
                    <span>= ؟</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">سهم هر بخش:</span>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="text"
                      placeholder="صورت"
                      value={ansDivN}
                      onChange={(e) => setAnsDivN(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <div className="w-20 h-0.5 bg-cyan-400" />
                    <input
                      type="text"
                      placeholder="مخرج"
                      value={ansDivD}
                      onChange={(e) => setAnsDivD(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const uN = parseInt(toEnglishNumber(ansDivN), 10);
                      const uD = parseInt(toEnglishNumber(ansDivD), 10);
                      if (uN === divQ.resN && uD === divQ.resD) {
                        setFeedback({ type: 'success', message: 'آفرین! سهم‌بندی و قانون معکوس کردن مقسوم‌علیه دقیق اجرا شد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: عدد ${toPersianDigits(divQ.n2)} به کسر وارونه با صورت ۱ و مخرج ${toPersianDigits(divQ.n2)} تبدیل می‌شود. حاصلضرب مخرج‌ها (${toPersianDigits(divQ.d1)} × ${toPersianDigits(divQ.n2)}) را مجدداً حساب کنید!`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید تقسیم 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 5: SIMPLIFICATION (Student-Driven Interactive Cross Reduction) */}
            {subTopic === 'simplification' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                  <div className="text-xs text-slate-400">
                    ساده‌کردن ضربدری کسرها پیش از ضرب نهایی (توسط خود دانش‌آموز):
                  </div>

                  {/* Clean Visual Cross-Simplification Fraction Display */}
                  <div className="inline-flex items-center justify-center gap-6 text-2xl font-bold py-2" dir="ltr">
                    {/* First fraction */}
                    <div className="flex flex-col items-center">
                      {diag1Done ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-emerald-400 font-extrabold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 mb-0.5 animate-bounce-subtle">
                            {toPersianDigits(simQ.sn1)}
                          </span>
                          <span className="text-slate-500 line-through text-lg">{toPersianDigits(simQ.n1)}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-300 text-2xl font-bold px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                          {toPersianDigits(simQ.n1)}
                        </span>
                      )}

                      <div className="w-16 h-0.5 bg-slate-600 my-1.5" />

                      {diag2Done ? (
                        <div className="flex flex-col items-center">
                          <span className="text-slate-500 line-through text-lg">{toPersianDigits(simQ.d1)}</span>
                          <span className="text-amber-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 mt-0.5 animate-bounce-subtle">
                            {toPersianDigits(simQ.sd1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-300 text-2xl font-bold px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/40">
                          {toPersianDigits(simQ.d1)}
                        </span>
                      )}
                    </div>

                    <span className="text-rose-400 font-extrabold text-3xl">×</span>

                    {/* Second fraction */}
                    <div className="flex flex-col items-center">
                      {diag2Done ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-amber-400 font-extrabold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 mb-0.5 animate-bounce-subtle">
                            {toPersianDigits(simQ.sn2)}
                          </span>
                          <span className="text-slate-500 line-through text-lg">{toPersianDigits(simQ.n2)}</span>
                        </div>
                      ) : (
                        <span className="text-amber-300 text-2xl font-bold px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/40">
                          {toPersianDigits(simQ.n2)}
                        </span>
                      )}

                      <div className="w-16 h-0.5 bg-slate-600 my-1.5" />

                      {diag1Done ? (
                        <div className="flex flex-col items-center">
                          <span className="text-slate-500 line-through text-lg">{toPersianDigits(simQ.d2)}</span>
                          <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 mt-0.5 animate-bounce-subtle">
                            {toPersianDigits(simQ.sd2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-300 text-2xl font-bold px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                          {toPersianDigits(simQ.d2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student Interactive Diagonal Simplification Tasks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right pt-2">
                    {/* Diagonal 1 Task (Emerald: n1 and d2) */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      diag1Done
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-900 border-emerald-500/40 text-slate-200'
                    }`}>
                      <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
                        <span>قطر ۱ (سبز): صورت اول و مخرج دوم</span>
                        {diag1Done && <span>✅ انجام شد</span>}
                      </div>
                      {!diag1Done ? (
                        <div className="space-y-2 mt-2">
                          <p className="text-xs text-slate-300">
                            صورت ({toPersianDigits(simQ.n1)}) و مخرج ({toPersianDigits(simQ.d2)}) بر چه عاملی بخش‌پذیرند؟
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="عامل مشترک..."
                              value={diag1Input}
                              onChange={(e) => setDiag1Input(e.target.value)}
                              className="w-28 h-9 text-center text-sm font-bold bg-slate-950 border border-emerald-500/50 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                            <button
                              onClick={() => {
                                const factor = parseInt(toEnglishNumber(diag1Input), 10);
                                if (factor && (factor === simQ.f1 || (simQ.n1 % factor === 0 && simQ.d2 % factor === 0 && factor > 1))) {
                                  SoundFX.shatter();
                                  setDiag1Done(true);
                                  if (diag2Done) setSimplifiedDone(true);
                                  setFeedback({
                                    type: 'success',
                                    message: `آفرین! قطر اول بر ${toPersianDigits(factor)} ساده شد. صورت به ${toPersianDigits(simQ.sn1)} و مخرج به ${toPersianDigits(simQ.sd2)} تبدیل گردید.`,
                                  });
                                } else {
                                  onLogMistake();
                                  SoundFX.error();
                                  setFeedback({
                                    type: 'error',
                                    message: `راهنمایی قطر ۱: ${simQ.hint1 || 'عامل مشترک دو عدد را در جدول ضرب بیابید.'}`,
                                  });
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs active:scale-95 transition-all"
                            >
                              ساده‌سازی ✂️
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-300 mt-1">
                          ساده شد: {toPersianDigits(simQ.n1)} و {toPersianDigits(simQ.d2)} تقسیم بر {toPersianDigits(simQ.f1)} شدند {toPersianDigits(simQ.sn1)} و {toPersianDigits(simQ.sd2)}.
                        </div>
                      )}
                    </div>

                    {/* Diagonal 2 Task (Amber: n2 and d1) */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      diag2Done
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : 'bg-slate-900 border-amber-500/40 text-slate-200'
                    }`}>
                      <div className="text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
                        <span>قطر ۲ (زرد): صورت دوم و مخرج اول</span>
                        {diag2Done && <span>✅ انجام شد</span>}
                      </div>
                      {!diag2Done ? (
                        <div className="space-y-2 mt-2">
                          <p className="text-xs text-slate-300">
                            صورت ({toPersianDigits(simQ.n2)}) و مخرج ({toPersianDigits(simQ.d1)}) بر چه عاملی بخش‌پذیرند؟
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="عامل مشترک..."
                              value={diag2Input}
                              onChange={(e) => setDiag2Input(e.target.value)}
                              className="w-28 h-9 text-center text-sm font-bold bg-slate-950 border border-amber-500/50 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button
                              onClick={() => {
                                const factor = parseInt(toEnglishNumber(diag2Input), 10);
                                if (factor && (factor === simQ.f2 || (simQ.n2 % factor === 0 && simQ.d1 % factor === 0 && factor > 1))) {
                                  SoundFX.shatter();
                                  setDiag2Done(true);
                                  if (diag1Done) setSimplifiedDone(true);
                                  setFeedback({
                                    type: 'success',
                                    message: `عالی بود! قطر دوم بر ${toPersianDigits(factor)} ساده شد. صورت به ${toPersianDigits(simQ.sn2)} و مخرج به ${toPersianDigits(simQ.sd1)} تبدیل گردید.`,
                                  });
                                } else {
                                  onLogMistake();
                                  SoundFX.error();
                                  setFeedback({
                                    type: 'error',
                                    message: `راهنمایی قطر ۲: ${simQ.hint2 || 'عامل مشترک دو عدد را در جدول ضرب بیابید.'}`,
                                  });
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs active:scale-95 transition-all"
                            >
                              ساده‌سازی ✂️
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-300 mt-1">
                          ساده شد: {toPersianDigits(simQ.n2)} و {toPersianDigits(simQ.d1)} تقسیم بر {toPersianDigits(simQ.f2)} شدند {toPersianDigits(simQ.sn2)} و {toPersianDigits(simQ.sd1)}.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final simplified fraction calculation */}
                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">حاصل‌ضرب کسر ساده‌شده:</span>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="text"
                      placeholder="صورت"
                      value={ansSimN}
                      onChange={(e) => setAnsSimN(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <div className="w-20 h-0.5 bg-cyan-400" />
                    <input
                      type="text"
                      placeholder="مخرج"
                      value={ansSimD}
                      onChange={(e) => setAnsSimD(e.target.value)}
                      className="w-20 h-9 text-center text-base font-bold bg-slate-900 border border-cyan-500/60 rounded-lg text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const uN = parseInt(toEnglishNumber(ansSimN), 10);
                      const uD = parseInt(toEnglishNumber(ansSimD), 10);
                      if (uN === simQ.resN && uD === simQ.resD) {
                        setFeedback({ type: 'success', message: 'شاهکار بود! ساده‌کردن قبل از ضرب مانع محاسبات سنگین شد.' });
                        advanceStage();
                      } else if (uN === simQ.n1 * simQ.n2 && uD === simQ.d1 * simQ.d2) {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `پاسخ مقداری صحیح است، اما کسر را با اعداد ساده‌شده ضرب نکرده‌اید! ابتدا قطرهای ۱ و ۲ را ساده کرده و حاصل‌ضرب ارقام ساده‌شده را وارد نمایید.`,
                        });
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: حاصل‌ضرب صورت‌های ساده‌شده (${toPersianDigits(simQ.sn1)} × ${toPersianDigits(simQ.sn2)}) و مخرج‌های ساده‌شده (${toPersianDigits(simQ.sd1)} × ${toPersianDigits(simQ.sd2)}) را محاسبه کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید ساده‌سازی 🎯
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
        message="مرحله کسرها با تسلط فتح شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
