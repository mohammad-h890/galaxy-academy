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

type RatioSubTopic = 
  | 'proportion_table' // ۱. مفهوم نسبت، نسبتهای مساوی و رابطه ضربی چرخ‌دنده‌ها (ص ۴۸ تا ۵۵)
  | 'total_diff_share' // ۲. جدول‌های سه‌ردیفه، تسهیم به نسبت و اختلاف نسبت (ص ۵۶ تا ۵۹)
  | 'percentage_discount'; // ۳. مفهوم درصد، تبدیل کسر به درصد و تخفیف مالی (ص ۶۰ تا ۶۳)

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
  const [subTopic, setSubTopic] = useState<RatioSubTopic>('proportion_table');
  const [isSpinning, setIsSpinning] = useState(false);

  // 1. Basic Multiplier with Real-World Word Problem
  const [q1, setQ1] = useState({
    r: 2,
    b: 5,
    multiplier: 4,
    title: 'پیمایش و مصرف سوخت کاوشگر',
    story: 'یک کاوشگر فضایی برای پیمودن هر ۵ کیلومتر، ۲ لیتر سوخت پلاسما مصرف می‌کند. اگر در یک مأموریت ۸ لیتر سوخت مصرف کرده باشد، چند کیلومتر را پیموده است؟',
    label1: 'سوخت مصرفی (لیتر)',
    label2: 'مسافت پیموده‌شده (کیلومتر)',
    unitTarget: 'کیلومتر',
  });
  const [ansB1, setAnsB1] = useState('');

  // 2. Three-row Table (Total or Difference sharing) with Word Problem
  const [q2, setQ2] = useState({
    type: 'total' as 'total' | 'diff',
    r1: 2,
    r2: 5,
    thirdVal: 7, // r1+r2 or r2-r1
    mult: 10,
    knownRow: 'third' as 'r1' | 'r2' | 'third',
    knownVal: 70,
    targetRow: 'r2' as 'r1' | 'r2',
    targetAns: 50,
    title: 'تسهیم پاداش مأموریت',
    story: 'نسبت جرم دو محموله اکتشافی ۲ به ۵ است. اگر مجموع جرم این دو محموله ۷۰ کیلوگرم باشد، جرم محموله دوم چند کیلوگرم است؟',
    label1: 'محموله اول (کیلوگرم)',
    label2: 'محموله دوم (کیلوگرم)',
    unitTarget: 'کیلوگرم',
  });
  const [ansQ2, setAnsQ2] = useState('');

  // 3. Percentage & Discount
  const [q3, setQ3] = useState({
    originalPrice: 200,
    discountPercent: 20,
    discountAmount: 40,
    finalPrice: 160,
  });
  const [ansDiscount, setAnsDiscount] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      title: '۱. مفهوم نسبت و تمایز رابطه ضربی از جمعی (ص ۴۸ تا ۵۵)',
      text: 'هشدار حیاتی: بزرگ‌ترین اشتباه دانش‌آموزان در تناسب، اضافه کردن است! اگر نسبت سوخت ۲ به ۳ باشد و اولی ۶ شود، نگویید ۴ تا اضافه شده پس به دومی هم ۴ تا اضافه شود! رابطه تناسب همواره ضربی (چند برابر شدن) است: چون اولی ۳ برابر شده، دومی هم باید ۳ برابر شود و ۹ شود.',
      tip: 'همیشه ضریب ضرب را بین سطرها یا ستون‌ها پیدا کنید؛ هرگز جمع نکنید!',
      mood: 'warning' as const,
    },
    {
      title: '۲. جدول‌های سه‌ردیفه: مجموع نسبت‌ها و اختلاف نسبت‌ها (ص ۵۶ تا ۵۹)',
      text: 'وقتی مجموع دو مقدار یا اختلاف آن‌ها مشخص است (مانند تقسیم پاداش سفینه یا اختلاف دمای دو رآکتور)، یک ردیف سوم به جدول اضافه می‌کنیم: «مجموع نسبت‌ها» یا «اختلاف نسبت‌ها». سپس با یافتن ضریب ضربی آن سطر، تمام ردیف‌ها به آسانی حل می‌شوند.',
      tip: 'در مسائل مالی و تقسیم، همیشه سطر سوم مجموع یا اختلاف نسبت‌ها نجات‌بخش است.',
      mood: 'happy' as const,
    },
    {
      title: '۳. مفهوم درصد و محاسبات تخفیف (ص ۶۰ تا ۶۳)',
      text: 'درصد یعنی نسبتی که مخرج آن ۱۰۰ است. برای محاسبه تخفیف ۲۰٪ یک قطعه ۲۰۰ هزار تومانی، ابتدا مقدار تخفیف (۴۰ هزار تومان) را به دست می‌آوریم و از قیمت کل کم می‌کنیم تا قیمت پرداختی نهایی (۱۶۰ هزار تومان) حاصل شود.',
      tip: 'قیمت پس از تخفیف = قیمت کل منهای سود یا تخفیف داده‌شده.',
      mood: 'excited' as const,
    },
  ];

  const generateQuestionForStage = (currentStage: number) => {
    setFeedback(null);
    const topics: RatioSubTopic[] = ['proportion_table', 'total_diff_share', 'percentage_discount'];
    const chosenTopic = topics[currentStage % topics.length];
    setSubTopic(chosenTopic);

    if (chosenTopic === 'proportion_table') {
      const wordProblemsQ1 = [
        {
          title: 'پیمایش و مصرف سوخت کاوشگر',
          makeStory: (r: number, b: number, mult: number) =>
            `یک کاوشگر فضایی برای پیمودن هر ${toPersianDigits(b)} کیلومتر، ${toPersianDigits(r)} لیتر سوخت مصرف می‌کند. اگر در یک پیمایش ${toPersianDigits(r * mult)} لیتر سوخت مصرف کرده باشد، چند کیلومتر را پیموده است؟`,
          label1: 'سوخت مصرفی (لیتر)',
          label2: 'مسافت پیموده‌شده (کیلومتر)',
          unitTarget: 'کیلومتر',
          rPool: [2, 3, 4],
          bPool: [5, 7, 8],
          multPool: [3, 4, 5, 6],
        },
        {
          title: 'تولید قطعات تیتانیومی چاپگر سه‌بعدی',
          makeStory: (r: number, b: number, mult: number) =>
            `چاپگر سه‌بعدی پایگاه در هر ${toPersianDigits(r)} دقیقه، ${toPersianDigits(b)} مهره تیتانیومی تولید می‌کند. این چاپگر در ${toPersianDigits(r * mult)} دقیقه چند مهره تولید خواهد کرد؟`,
          label1: 'زمان کارکرد (دقیقه)',
          label2: 'تعداد مهره‌های تولیدی',
          unitTarget: 'مهره',
          rPool: [2, 3, 5],
          bPool: [4, 6, 7],
          multPool: [3, 4, 5, 6],
        },
        {
          title: 'آلیاژ ساخت بدنه فضاپیما',
          makeStory: (r: number, b: number, mult: number) =>
            `برای ساخت آلیاژ سپر حرارتی، به ازای هر ${toPersianDigits(r)} کیلوگرم مس، ${toPersianDigits(b)} کیلوگرم تیتانیوم ترکیب می‌شود. اگر ${toPersianDigits(r * mult)} کیلوگرم مس مصرف شود، به چند کیلوگرم تیتانیوم نیاز است؟`,
          label1: 'مقدار مس (کیلوگرم)',
          label2: 'مقدار تیتانیوم (کیلوگرم)',
          unitTarget: 'کیلوگرم تیتانیوم',
          rPool: [2, 3, 4],
          bPool: [5, 7, 9],
          multPool: [3, 4, 5],
        },
        {
          title: 'انتقال دور چرخ‌دنده‌های مکانیکی',
          makeStory: (r: number, b: number, mult: number) =>
            `در جعبه‌دنده موتور، به ازای هر ${toPersianDigits(r)} دور چرخش چرخ‌دنده بزرگ، چرخ‌دنده کوچک ${toPersianDigits(b)} دور می‌چرخد. اگر چرخ‌دنده بزرگ ${toPersianDigits(r * mult)} دور بچرخد، چرخ‌دنده کوچک چند دور می‌چرخد؟`,
          label1: 'دوران چرخ‌دنده بزرگ',
          label2: 'دوران چرخ‌دنده کوچک',
          unitTarget: 'دور',
          rPool: [2, 3, 4],
          bPool: [5, 6, 8],
          multPool: [3, 4, 5, 6],
        },
        {
          title: 'رشد جوانه‌های گیاهی در ایستگاه فضایی',
          makeStory: (r: number, b: number, mult: number) =>
            `یک جوانه هیدروپونیک در گلخانه مدارگرد در هر ${toPersianDigits(r)} روز، ${toPersianDigits(b)} سانتی‌متر رشد می‌کند. در ${toPersianDigits(r * mult)} روز این جوانه چند سانتی‌متر رشد خواهد کرد؟`,
          label1: 'تعداد روزها',
          label2: 'میزان رشد (سانتی‌متر)',
          unitTarget: 'سانتی‌متر',
          rPool: [3, 4, 5],
          bPool: [2, 6, 7],
          multPool: [3, 4, 5, 7],
        },
      ];

      const chosenScenario = wordProblemsQ1[Math.floor(Math.random() * wordProblemsQ1.length)];
      const r = chosenScenario.rPool[Math.floor(Math.random() * chosenScenario.rPool.length)];
      const b = chosenScenario.bPool[Math.floor(Math.random() * chosenScenario.bPool.length)];
      const multiplier = chosenScenario.multPool[Math.floor(Math.random() * chosenScenario.multPool.length)];

      setQ1({
        r,
        b,
        multiplier,
        title: chosenScenario.title,
        story: chosenScenario.makeStory(r, b, multiplier),
        label1: chosenScenario.label1,
        label2: chosenScenario.label2,
        unitTarget: chosenScenario.unitTarget,
      });
      setAnsB1('');
    } else if (chosenTopic === 'total_diff_share') {
      const isTotal = Math.random() > 0.5;

      const totalStories = [
        {
          title: 'جرم محموله‌های اکتشافی',
          makeStory: (r1: number, r2: number, total: number) =>
            `نسبت جرم دو محموله اکتشافی ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر مجموع جرم این دو محموله ${toPersianDigits(total)} کیلوگرم باشد، جرم محموله دوم چند کیلوگرم است؟`,
          label1: 'محموله اول (کیلوگرم)',
          label2: 'محموله دوم (کیلوگرم)',
          unitTarget: 'کیلوگرم',
        },
        {
          title: 'سن فضانوردان ایستگاه مداری',
          makeStory: (r1: number, r2: number, total: number) =>
            `نسبت سن دو پژوهشگر ایستگاه مداری ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر مجموع سن آن‌ها ${toPersianDigits(total)} سال باشد، سن پژوهشگر دوم چند سال است؟`,
          label1: 'سن پژوهشگر اول',
          label2: 'سن پژوهشگر دوم',
          unitTarget: 'سال',
        },
        {
          title: 'ترکیب گازهای تنفسی',
          makeStory: (r1: number, r2: number, total: number) =>
            `در یک مخزن هوا، نسبت گاز نیتروژن به اکسیژن ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر مجموع حجم گازها ${toPersianDigits(total)} لیتر باشد، حجم گاز اکسیژن چند لیتر است؟`,
          label1: 'گاز نیتروژن (لیتر)',
          label2: 'گاز اکسیژن (لیتر)',
          unitTarget: 'لیتر',
        },
      ];

      const diffStories = [
        {
          title: 'اختلاف دمای رآکتورهای پلاسما',
          makeStory: (r1: number, r2: number, diff: number) =>
            `نسبت دمای دو رآکتور پلاسما ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر اختلاف دمای این دو رآکتور ${toPersianDigits(diff)} درجه باشد، دمای رآکتور گرم‌تر (دومی) چند درجه است؟`,
          label1: 'دمای رآکتور اول',
          label2: 'دمای رآکتور دوم',
          unitTarget: 'درجه',
        },
        {
          title: 'اختلاف طول پنل‌های خورشیدی',
          makeStory: (r1: number, r2: number, diff: number) =>
            `نسبت طول دو پنل خورشیدی ماهواره ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر پنل دوم ${toPersianDigits(diff)} سانتی‌متر از پنل اول بلندتر باشد (اختلاف)، طول پنل دوم چند سانتی‌متر است؟`,
          label1: 'طول پنل اول (سانتی‌متر)',
          label2: 'طول پنل دوم (سانتی‌متر)',
          unitTarget: 'سانتی‌متر',
        },
        {
          title: 'اختلاف بودجه پروژه‌های فضایی',
          makeStory: (r1: number, r2: number, diff: number) =>
            `نسبت بودجه دو پروژه تحقیقاتی ${toPersianDigits(r1)} به ${toPersianDigits(r2)} است. اگر اختلاف بودجه آن‌ها ${toPersianDigits(diff)} میلیون تومان باشد، بودجه پروژه دوم چقدر است؟`,
          label1: 'بودجه پروژه اول (میلیون تومان)',
          label2: 'بودجه پروژه دوم (میلیون تومان)',
          unitTarget: 'میلیون تومان',
        },
      ];

      const r1 = Math.floor(Math.random() * 3) + 2;
      const r2 = Math.floor(Math.random() * 4) + 5; // r2 > r1
      const thirdVal = isTotal ? r1 + r2 : r2 - r1;
      const mult = (Math.floor(Math.random() * 4) + 2) * 5; // 10, 15, 20, 25
      const knownVal = thirdVal * mult;

      const storyPool = isTotal ? totalStories : diffStories;
      const chosenStory = storyPool[Math.floor(Math.random() * storyPool.length)];

      setQ2({
        type: isTotal ? 'total' : 'diff',
        r1,
        r2,
        thirdVal,
        mult,
        knownRow: 'third',
        knownVal,
        targetRow: 'r2',
        targetAns: r2 * mult,
        title: chosenStory.title,
        story: chosenStory.makeStory(r1, r2, knownVal),
        label1: chosenStory.label1,
        label2: chosenStory.label2,
        unitTarget: chosenStory.unitTarget,
      });
      setAnsQ2('');
    } else {
      // Percentage & discount
      const percentages = [10, 20, 25, 30, 50];
      const p = percentages[Math.floor(Math.random() * percentages.length)];
      const orig = (Math.floor(Math.random() * 5) + 2) * 100; // 200, 300, 400, 500, 600
      const discount = (orig * p) / 100;
      const finalPrice = orig - discount;
      setQ3({ originalPrice: orig, discountPercent: p, discountAmount: discount, finalPrice });
      setAnsDiscount('');
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
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 800);

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
            <div className="px-4 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score + 1)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-bold text-purple-300 mb-2 flex items-center gap-2">
          <Cog className={`w-6 h-6 text-purple-400 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>آزمایشگاه سوخت: گلوگاه‌های نسبت، تناسب سه‌ردیفه و درصد مالی</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">مسلط شدن بر جدول‌های سه‌ردیفه تسهیم به نسبت، اختلاف نسبت، محاسبه تخفیف و رابطه ضربی چرخ‌دنده‌ها</p>

        {!inGame ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 font-bold text-base">
              📖 {lessonSlides[slide].title}
            </div>

            <RobotGuide
              message={lessonSlides[slide].text}
              mood={lessonSlides[slide].mood}
              size="md"
            />

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-purple-300">
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
                      idx === slide ? 'bg-purple-400 w-6 shadow-sm shadow-purple-400' : 'bg-slate-700'
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
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-sm transition-all"
                >
                  اسلاید بعدی
                </button>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>آغاز عملیات ۱۵ مرحله‌ای آزمایشگاه</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SUB-TOPIC 1: PROPORTION MULTIPLIER WITH WORD PROBLEM */}
            {subTopic === 'proportion_table' && (
              <div className="space-y-6">
                {/* Word Problem Card */}
                <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-right space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                    <span>📝 مسئله کاربردی تناسب: {q1.title}</span>
                  </div>
                  <p className="text-base md:text-lg text-slate-100 font-semibold leading-relaxed">
                    {q1.story}
                  </p>
                  <p className="text-xs text-slate-400">
                    اطلاعات مسئله در جدول تناسب زیر سازماندهی شده است. خانه مجهول (؟) را بیابید:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">جدول تناسب مسئله (خوانش از راست به چپ):</div>
                  <div className="w-full max-w-md mx-auto border-2 border-purple-500/40 rounded-2xl overflow-hidden text-center">
                    <div className="grid grid-cols-3 bg-purple-950/60 font-bold text-purple-200 border-b border-purple-500/40 py-2.5 text-sm">
                      <div>عنوان ردیف</div>
                      <div>نسبت پایه</div>
                      <div>مقدار واقعی</div>
                    </div>
                    <div className="grid grid-cols-3 py-3 border-b border-slate-800 text-base font-bold text-white">
                      <div className="text-purple-300 text-sm">{q1.label1}</div>
                      <div className="text-cyan-300">{toPersianDigits(q1.r)}</div>
                      <div className="text-emerald-400 font-mono">{toPersianDigits(q1.r * q1.multiplier)}</div>
                    </div>
                    <div className="grid grid-cols-3 py-3 text-base font-bold text-white bg-slate-900/40">
                      <div className="text-purple-300 text-sm">{q1.label2}</div>
                      <div className="text-cyan-300">{toPersianDigits(q1.b)}</div>
                      <div className="text-amber-400 font-mono">؟ (مجهول)</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-300">
                    💡 راهبرد حل: بررسی کنید در سطر «{q1.label1}»، نسبت پایه در چه عددی ضرب شده تا مقدار واقعی به دست آید؟ این ضریب را خودتان پیدا کنید و سپس نسبت سطر «{q1.label2}» را در همان ضریب ضرب نمایید.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300">مقدار مجهول ({q1.label2}):</span>
                  <input
                    type="text"
                    placeholder="پاسخ مسئله..."
                    value={ansB1}
                    onChange={(e) => setAnsB1(e.target.value)}
                    className="w-36 h-12 text-center text-xl font-bold bg-slate-900 border border-purple-500/60 rounded-xl text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-xs text-purple-300 font-semibold">{q1.unitTarget}</span>

                  <button
                    onClick={() => {
                      const expected = q1.b * q1.multiplier;
                      const uAns = parseInt(toEnglishNumber(ansB1), 10);
                      if (uAns === expected) {
                        setFeedback({ type: 'success', message: `آفرین! مسئله با موفقیت حل شد. مقدار ${q1.label2} برابر با ${toPersianDigits(expected)} ${q1.unitTarget} است.` });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({ type: 'error', message: `خطا! ضریب ضربی جدول ${toPersianDigits(q1.multiplier)} است؛ پس حاصل: ${toPersianDigits(q1.b)} × ${toPersianDigits(q1.multiplier)} = ${toPersianDigits(expected)} می‌شود.` });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید پاسخ مسئله 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 2: 3-ROW PROPORTION TABLES WITH WORD PROBLEM */}
            {subTopic === 'total_diff_share' && (
              <div className="space-y-6">
                {/* Word Problem Card */}
                <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-right space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>📝 مسئله جدول سه‌ردیفه ({q2.type === 'total' ? 'مجموع نسبت‌ها / تسهیم به نسبت' : 'اختلاف نسبت‌ها'}): {q2.title}</span>
                  </div>
                  <p className="text-base md:text-lg text-slate-100 font-semibold leading-relaxed">
                    {q2.story}
                  </p>
                  <p className="text-xs text-slate-400">
                    برای حل این مسئله، از جدول سه‌ردیفه زیر با اضافه کردن ردیف «{q2.type === 'total' ? 'مجموع' : 'اختلاف'}» استفاده شده است:
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">
                    جدول سه‌ردیفه تناسب (ص ۵۶ تا ۵۹ کتاب پنجم):
                  </div>
                  <div className="w-full max-w-md mx-auto border-2 border-purple-500/40 rounded-2xl overflow-hidden text-center">
                    <div className="grid grid-cols-3 bg-purple-950/60 font-bold text-purple-200 border-b border-purple-500/40 py-2.5 text-sm">
                      <div>عنوان ردیف</div>
                      <div>نسبت</div>
                      <div>مقدار واقعی</div>
                    </div>
                    <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm font-bold text-white">
                      <div className="text-cyan-300">{q2.label1}</div>
                      <div>{toPersianDigits(q2.r1)}</div>
                      <div className="text-slate-400">—</div>
                    </div>
                    <div className="grid grid-cols-3 py-2.5 border-b border-slate-800 text-sm font-bold text-white bg-slate-900/30">
                      <div className="text-purple-300">{q2.label2}</div>
                      <div>{toPersianDigits(q2.r2)}</div>
                      <div className="text-amber-400 font-bold">؟ (هدف مسئله)</div>
                    </div>
                    <div className="grid grid-cols-3 py-2.5 text-sm font-bold text-emerald-300 bg-emerald-950/40">
                      <div>{q2.type === 'total' ? 'مجموع' : 'اختلاف'}</div>
                      <div>{toPersianDigits(q2.thirdVal)}</div>
                      <div className="text-emerald-400 font-mono text-base">{toPersianDigits(q2.knownVal)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-300">
                    💡 راهبرد حل: ابتدا با مقایسه سطر سوم ({q2.type === 'total' ? 'مجموع' : 'اختلاف'})، ضریب ضربی جدول را از تقسیم مقدار واقعی بر نسبت سطر سوم خودتان پیدا کنید؛ سپس نسبت سطر «{q2.label2}» را در همان ضریب ضرب کنید تا مقدار هدف مشخص شود.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300">مقدار واقعی {q2.label2} (؟):</span>
                  <input
                    type="text"
                    placeholder="پاسخ مسئله..."
                    value={ansQ2}
                    onChange={(e) => setAnsQ2(e.target.value)}
                    className="w-36 h-12 text-center text-xl font-bold bg-slate-900 border border-purple-500/60 rounded-xl text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-xs text-purple-300 font-semibold">{q2.unitTarget}</span>

                  <button
                    onClick={() => {
                      const uAns = parseInt(toEnglishNumber(ansQ2), 10);
                      if (uAns === q2.targetAns) {
                        setFeedback({ type: 'success', message: `احسنت! مسئله سه‌ردیفه تناسب با یافتن ضریب سطر سوم با موفقیت حل شد. مقدار ${q2.label2} برابر ${toPersianDigits(q2.targetAns)} ${q2.unitTarget} است.` });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({ type: 'error', message: `خطا! ضریب سطر سوم ${toPersianDigits(q2.mult)} است؛ پس حاصل: ${toPersianDigits(q2.r2)} × ${toPersianDigits(q2.mult)} = ${toPersianDigits(q2.targetAns)} می‌شود.` });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید پاسخ مسئله 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 3: PERCENTAGE & DISCOUNT */}
            {subTopic === 'percentage_discount' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">کاربرد درصد و مسائل تخفیف سفینه (ص ۶۰ تا ۶۳ کتاب پنجم):</div>
                  <p className="text-sm md:text-base text-slate-200 font-semibold">
                    قیمت یک باتری پلاسمایی <strong className="text-cyan-400">{toPersianDigits(q3.originalPrice)} هزار تومان</strong> است. اگر این باتری با <strong className="text-amber-400">٪{toPersianDigits(q3.discountPercent)} تخفیف</strong> ویژه مهندسان عرضه شود، قیمت پرداختی نهایی چقدر خواهد بود؟
                  </p>
                  <div className="text-xs text-purple-300 pt-1">
                    💡 راهبرد حل: ابتدا با محاسبه درصد تخفیف از قیمت اولیه، مقدار تخفیف را خودتان به دست آورید و سپس آن را از قیمت اولیه کسر کنید تا قیمت نهایی مشخص شود.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300">قیمت نهایی پس از تخفیف (هزار تومان):</span>
                  <input
                    type="text"
                    placeholder="قیمت پس از تخفیف..."
                    value={ansDiscount}
                    onChange={(e) => setAnsDiscount(e.target.value)}
                    className="w-36 h-12 text-center text-xl font-bold bg-slate-900 border border-purple-500/60 rounded-xl text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  <button
                    onClick={() => {
                      const uAns = parseInt(toEnglishNumber(ansDiscount), 10);
                      if (uAns === q3.finalPrice) {
                        setFeedback({ type: 'success', message: 'محاسبه تخفیف دقیق بود! کسر تخفیف از قیمت اولیه با موفقیت انجام شد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({ type: 'error', message: `خطا! قیمت نهایی برابر: ${toPersianDigits(q3.originalPrice)} - ${toPersianDigits(q3.discountAmount)} = ${toPersianDigits(q3.finalPrice)} هزار تومان است.` });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید درصد تخفیف 🎯
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
        message="مرحله تناسب با تسلط حل شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
