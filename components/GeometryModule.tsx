'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { RobotGuide } from './RobotGuide';
import { CelebrationOverlay } from './CelebrationOverlay';
import { toEnglishNumber, toPersianDigits } from '@/lib/utils';
import { ArrowRight, Sparkles, Check, Scissors, Zap, Shapes, RotateCw } from 'lucide-react';

interface GeometryModuleProps {
  onBack: () => void;
  onComplete: () => void;
  onCorrectAnswer: (energy: number) => void;
  onLogMistake: () => void;
}

type GeometrySubTopic =
  | 'central_symmetry'
  | 'angles_bisector'
  | 'rhombus_trapezoid'
  | 'circle_perimeter'
  | 'volume_capacity';

type SymmetryShapeType = 'parallelogram' | 'circle' | 'equilateral_triangle' | 'letter_N' | 'trapezoid';

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
  const [subTopic, setSubTopic] = useState<GeometrySubTopic>('rhombus_trapezoid');

  // 1. Central Symmetry States with diverse shapes
  const [symShape, setSymShape] = useState<SymmetryShapeType>('parallelogram');
  const [isRotated180, setIsRotated180] = useState(false);

  // 2. Angles & Bisector
  const [angleType, setAngleType] = useState<'triangle' | 'quad'>('triangle');
  const [ang1, setAng1] = useState(50);
  const [ang2, setAng2] = useState(70);
  const [ang3, setAng3] = useState(0);
  const [missingAngle, setMissingAngle] = useState(60);
  const [userAngle, setUserAngle] = useState('');

  // 3. Rhombus & Trapezoid (Laser cut simulation)
  const [geoQ, setGeoQ] = useState({
    type: 'rhombus' as 'rhombus' | 'trapezoid',
    d1: 10,
    d2: 6,
    b1: 4,
    b2: 8,
    h: 5,
    area: 30,
  });
  const [isSimulated, setIsSimulated] = useState(false);
  const [ansArea, setAnsArea] = useState('');

  // 4. Circle Perimeter & Pi
  const [circleGiven, setCircleGiven] = useState<'radius' | 'diameter'>('radius');
  const [circleVal, setCircleVal] = useState(5);
  const [circlePerimeter, setCirclePerimeter] = useState('31.4');
  const [ansPerimeter, setAnsPerimeter] = useState('');

  // 5. Volume & Capacity Units with Mandatory Unit Conversion
  const [volQuestion, setVolQuestion] = useState({
    name: 'مخزن سوخت فضاپیما',
    lM: 2,
    wM: 1,
    hM: 0.5,
    lStr: '۲',
    wStr: '۱',
    hStr: '۰/۵',
    lCm: 200,
    wCm: 100,
    hCm: 50,
    volM3: 1,
    volCm3: 1000000,
    targetUnit: 'سانتی‌متر مکعب (cm³)',
    story: 'یک مخزن سوخت فضاپیما با ابعاد طول ۲ متر، عرض ۱ متر و ارتفاع ۰/۵ متر در بخش انبار نصب شده است.',
    hint: '۲ متر = ۲۰۰ سانتی‌متر، ۱ متر = ۱۰۰ سانتی‌متر، ۰/۵ متر = ۵۰ سانتی‌متر ⬅️ ۲۰۰ × ۱۰۰ × ۵۰ = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب (یا ۱ متر مکعب = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب).',
  });
  const [showUnitGuide, setShowUnitGuide] = useState(false);
  const [ansVol, setAnsVol] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const lessonSlides = [
    {
      title: '۱. تقارن مرکزی: دوران ۱۸۰ درجه حول نقطه (ص ۷۳ و ۷۴)',
      text: 'تقارن مرکزی یعنی شکل حول یک نقطه دقیقاً ۱۸۰ درجه (نیم‌دور) بچرخد و روی خودش منطبق شود. متوازی‌الاضلاع، دایره و حرف N تقارن مرکزی دارند، اما مثلث متساوی‌الاضلاع و ذوزنقه تقارن مرکزی ندارند چون با ۱۸۰ درجه چرخش وارونه می‌شوند!',
      tip: 'اگر شکل را نیم‌دور بچرخانید و جهت آن حفظ شود، مرکز تقارن دارد.',
      mood: 'happy' as const,
    },
    {
      title: '۲. مجموع زوایای مثلث و چهارضلعی‌ها + نیمساز (ص ۷۵ تا ۸۳)',
      text: 'مجموع زاویه‌های داخلی هر مثلث همیشه ۱۸۰ درجه و هر چهارضلعی ۳۶۰ درجه است.',
      tip: 'برای یافتن زاویه مجهول در مثلث: مجموع دو زاویه معلوم را از ۱۸۰ کم کنید.',
      mood: 'excited' as const,
    },
    {
      title: '۳. مساحت لوزی و ذوزنقه با شبیه‌سازی لیزری (ص ۱۰۶ تا ۱۰۹)',
      text: 'فرمول لوزی: (قطر بزرگ × قطر کوچک) ÷ ۲. فرمول ذوزنقه: ((قاعده بزرگ + قاعده کوچک) × ارتفاع) ÷ ۲.',
      tip: 'علت تقسیم بر ۲: مساحت لوزی نصف مساحت مستطیل پیرامون آن است.',
      mood: 'warning' as const,
    },
    {
      title: '۴. محیط دایره و عدد پی: دام شعاع به جای قطر! (ص ۱۱۰ تا ۱۱۲)',
      text: 'فرمول محیط دایره: قطر × ۳/۱۴. اگر سوال شعاع داد، حتماً ابتدا آن را دوبرابر کنید تا قطر به دست آید!',
      tip: 'محیط = ۲ × شعاع × ۳/۱۴',
      mood: 'warning' as const,
    },
    {
      title: '۵. حجم مکعب‌مستطیل و چالش تبدیل واحد (متر به سانتی‌متر مکعب) (ص ۱۱۳ تا ۱۲۱)',
      text: 'حجم مکعب‌مستطیل = طول × عرض × ارتفاع. اگر ابعاد به «متر» باشد و حجم را به «سانتی‌متر مکعب» بخواهند، یا ابتدا هر بعد را به سانتی‌متر تبدیل کنید (هر ۱ متر = ۱۰۰ سانتی‌متر) و سپس ضرب کنید، یا حجم را به متر مکعب به دست آورده و در ۱,۰۰۰,۰۰۰ ضرب نمایید (چون ۱ متر مکعب = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب است)!',
      tip: '۱ متر = ۱۰۰ سانتی‌متر ⬅️ ۱ متر مکعب = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب = ۱۰۰۰ لیتر',
      mood: 'warning' as const,
    },
  ];

  // Dynamic random questions for each stage
  const generateQuestionForStage = (currentStage: number) => {
    setFeedback(null);
    const topics: GeometrySubTopic[] = [
      'rhombus_trapezoid',
      'circle_perimeter',
      'angles_bisector',
      'central_symmetry',
      'volume_capacity',
    ];
    const chosenTopic = topics[currentStage % topics.length];
    setSubTopic(chosenTopic);

    if (chosenTopic === 'rhombus_trapezoid') {
      const isRhombus = Math.random() > 0.5;
      if (isRhombus) {
        const d1 = (Math.floor(Math.random() * 5) + 3) * 2;
        const d2 = (Math.floor(Math.random() * 4) + 2) * 2;
        setGeoQ({ type: 'rhombus', d1, d2, b1: 0, b2: 0, h: 0, area: (d1 * d2) / 2 });
      } else {
        const b1 = Math.floor(Math.random() * 4) + 3;
        const b2 = Math.floor(Math.random() * 5) + 7;
        const h = (Math.floor(Math.random() * 3) + 2) * 2;
        setGeoQ({ type: 'trapezoid', d1: 0, d2: 0, b1, b2, h, area: ((b1 + b2) * h) / 2 });
      }
      setIsSimulated(false);
      setAnsArea('');
    } else if (chosenTopic === 'circle_perimeter') {
      const isRadius = Math.random() > 0.5;
      const r = [5, 10, 15, 20, 25][Math.floor(Math.random() * 5)];
      setCircleGiven(isRadius ? 'radius' : 'diameter');
      setCircleVal(isRadius ? r : r * 2);
      const diameter = r * 2;
      setCirclePerimeter((diameter * 3.14).toFixed(1));
      setAnsPerimeter('');
    } else if (chosenTopic === 'angles_bisector') {
      const isTri = Math.random() > 0.5;
      setAngleType(isTri ? 'triangle' : 'quad');
      if (isTri) {
        const a1 = (Math.floor(Math.random() * 5) + 4) * 10;
        const a2 = (Math.floor(Math.random() * 4) + 3) * 10;
        const missing = 180 - (a1 + a2);
        setAng1(a1);
        setAng2(a2);
        setMissingAngle(missing);
      } else {
        const a1 = (Math.floor(Math.random() * 3) + 9) * 10; // 90..110
        const a2 = (Math.floor(Math.random() * 3) + 7) * 10; // 70..90
        const a3 = (Math.floor(Math.random() * 3) + 8) * 10; // 80..100
        const missing = 360 - (a1 + a2 + a3);
        setAng1(a1);
        setAng2(a2);
        setAng3(a3);
        setMissingAngle(missing);
      }
      setUserAngle('');
    } else if (chosenTopic === 'central_symmetry') {
      // Pick random shape from diverse pool
      const shapes: SymmetryShapeType[] = ['parallelogram', 'circle', 'equilateral_triangle', 'letter_N', 'trapezoid'];
      const s = shapes[Math.floor(Math.random() * shapes.length)];
      setSymShape(s);
      setIsRotated180(false);
    } else {
      // Volume with Unit Conversion: Dimensions in Meters -> Volume in cm³
      const volumeScenarios = [
        {
          name: 'مخزن سوخت فضاپیما',
          lM: 2, wM: 1, hM: 0.5,
          lStr: '۲', wStr: '۱', hStr: '۰/۵',
          lCm: 200, wCm: 100, hCm: 50,
          volM3: 1,
          volCm3: 1000000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'یک مخزن سوخت فضاپیما با ابعاد طول ۲ متر، عرض ۱ متر و ارتفاع ۰/۵ متر در بخش انبار نصب شده است.',
          hint: '۲ متر = ۲۰۰ سانتی‌متر، ۱ متر = ۱۰۰ سانتی‌متر، ۰/۵ متر = ۵۰ سانتی‌متر ⬅️ ۲۰۰ × ۱۰۰ × ۵۰ = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب (یا ۱ متر مکعب = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب).'
        },
        {
          name: 'کپسول هوای بخش زیستی',
          lM: 1, wM: 0.4, hM: 0.2,
          lStr: '۱', wStr: '۰/۴', hStr: '۰/۲',
          lCm: 100, wCm: 40, hCm: 20,
          volM3: 0.08,
          volCm3: 80000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'ابعاد یک محفظه ذخیره هوا برابر است با: طول ۱ متر، عرض ۰/۴ متر و ارتفاع ۰/۲ متر.',
          hint: '۱ متر = ۱۰۰ سانتی‌متر، ۰/۴ متر = ۴۰ سانتی‌متر، ۰/۲ متر = ۲۰ سانتی‌متر ⬅️ ۱۰۰ × ۴۰ × ۲۰ = ۸۰,۰۰۰ سانتی‌متر مکعب.'
        },
        {
          name: 'تانکر آب اضطراری سفینه',
          lM: 2, wM: 0.5, hM: 0.3,
          lStr: '۲', wStr: '۰/۵', hStr: '۰/۳',
          lCm: 200, wCm: 50, hCm: 30,
          volM3: 0.3,
          volCm3: 300000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'یک تانکر آب اضطراری به طول ۲ متر، عرض ۰/۵ متر و ارتفاع ۰/۳ متر در ایستگاه پشتیبانی ساخته شده است.',
          hint: '۲ متر = ۲۰۰ سانتی‌متر، ۰/۵ متر = ۵۰ سانتی‌متر، ۰/۳ متر = ۳۰ سانتی‌متر ⬅️ ۲۰۰ × ۵۰ × ۳۰ = ۳۰۰,۰۰۰ سانتی‌متر مکعب.'
        },
        {
          name: 'جعبه ابزار ربات کاوشگر',
          lM: 0.5, wM: 0.4, hM: 0.3,
          lStr: '۰/۵', wStr: '۰/۴', hStr: '۰/۳',
          lCm: 50, wCm: 40, hCm: 30,
          volM3: 0.06,
          volCm3: 60000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'ابعاد جعبه ابزار مکانیکی ربات: طول ۰/۵ متر، عرض ۰/۴ متر و ارتفاع ۰/۳ متر است.',
          hint: '۰/۵ متر = ۵۰ سانتی‌متر، ۰/۴ متر = ۴۰ سانتی‌متر، ۰/۳ متر = ۳۰ سانتی‌متر ⬅️ ۵۰ × ۴۰ × ۳۰ = ۶۰,۰۰۰ سانتی‌متر مکعب.'
        },
        {
          name: 'محفظه باتری پلاسما',
          lM: 1.5, wM: 1, hM: 0.4,
          lStr: '۱/۵', wStr: '۱', hStr: '۰/۴',
          lCm: 150, wCm: 100, hCm: 40,
          volM3: 0.6,
          volCm3: 600000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'محفظه باتری پلاسما با ابعاد طول ۱/۵ متر، عرض ۱ متر و ارتفاع ۰/۴ متر طراحی شده است.',
          hint: '۱/۵ متر = ۱۵۰ سانتی‌متر، ۱ متر = ۱۰۰ سانتی‌متر، ۰/۴ متر = ۴۰ سانتی‌متر ⬅️ ۱۵۰ × ۱۰۰ × ۴۰ = ۶۰۰,۰۰۰ سانتی‌متر مکعب.'
        },
        {
          name: 'انبار نمونه‌های سنگین سیاره',
          lM: 3, wM: 2, hM: 1,
          lStr: '۳', wStr: '۲', hStr: '۱',
          lCm: 300, wCm: 200, hCm: 100,
          volM3: 6,
          volCm3: 6000000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'ابعاد انبار نمونه‌های زمین‌شناسی: طول ۳ متر، عرض ۲ متر و ارتفاع ۱ متر است.',
          hint: 'حجم به متر مکعب = ۳ × ۲ × ۱ = ۶ متر مکعب. چون هر متر مکعب ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب است ⬅️ ۶ × ۱,۰۰۰,۰۰۰ = ۶,۰۰۰,۰۰۰ سانتی‌متر مکعب.'
        },
        {
          name: 'کانتینر تجهیزات آزمایشگاهی',
          lM: 2, wM: 1.5, hM: 1,
          lStr: '۲', wStr: '۱/۵', hStr: '۱',
          lCm: 200, wCm: 150, hCm: 100,
          volM3: 3,
          volCm3: 3000000,
          targetUnit: 'سانتی‌متر مکعب (cm³)',
          story: 'کانتینر تجهیزات با ابعاد طول ۲ متر، عرض ۱/۵ متر و ارتفاع ۱ متر آماده کالیبراسیون است.',
          hint: '۲ متر = ۲۰۰ سانتی‌متر، ۱/۵ متر = ۱۵۰ سانتی‌متر، ۱ متر = ۱۰۰ سانتی‌متر ⬅️ ۲۰۰ × ۱۵۰ × ۱۰۰ = ۳,۰۰۰,۰۰۰ سانتی‌متر مکعب.'
        }
      ];
      const chosenScenario = volumeScenarios[Math.floor(Math.random() * volumeScenarios.length)];
      setVolQuestion(chosenScenario);
      setShowUnitGuide(false);
      setAnsVol('');
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

  // Helper info for current symmetry shape
  const getSymmetryInfo = () => {
    switch (symShape) {
      case 'parallelogram':
        return { name: 'متوازی‌الاضلاع', hasCentral: true, hint: 'با ۱۸۰ درجه چرخش دقیقاً روی خودش منطبق می‌شود.' };
      case 'circle':
        return { name: 'دایره', hasCentral: true, hint: 'دایره حول مرکز خود تقارن مرکزی کامل دارد.' };
      case 'letter_N':
        return { name: 'حرف انگلیسی N', hasCentral: true, hint: 'اگر حرف N را ۱۸۰ درجه بچرخانید دوباره به همان شکل N دیده می‌شود.' };
      case 'equilateral_triangle':
        return { name: 'مثلث متساوی‌الاضلاع', hasCentral: false, hint: 'مثلث با ۱۸۰ درجه چرخش نوک آن به سمت پایین می‌افتد و روی خودش منطبق نمی‌شود!' };
      case 'trapezoid':
        return { name: 'ذوزنقه', hasCentral: false, hint: 'قاعده کوچک و بزرگ ذوزنقه با ۱۸۰ درجه چرخش جابه‌جا می‌شوند.' };
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
            <div className="px-4 py-1.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-pink-300 text-sm font-semibold tabular-nums">
              مرحله: {toPersianDigits(score + 1)} / {toPersianDigits(TOTAL_STAGES)}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-pink-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-bold text-pink-300 mb-2 flex items-center gap-2">
          <Shapes className="w-6 h-6 text-pink-400" />
          <span>کارگاه سازه‌ها: ۵ گلوگاه مفهومی هندسه</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          تقارن مرکزی اشکال متنوع، مجموع زوایا، مساحت لوزی و ذوزنقه، تله شعاع در محیط دایره و گنجایش مکعب‌مستطیل
        </p>

        {!inGame ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 text-pink-200 font-bold text-base">
              📖 {lessonSlides[slide].title}
            </div>

            <RobotGuide message={lessonSlides[slide].text} mood={lessonSlides[slide].mood} size="md" />

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-pink-300">
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
                      idx === slide ? 'bg-pink-400 w-6 shadow-sm shadow-pink-400' : 'bg-slate-700'
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
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-semibold text-sm transition-all"
                >
                  اسلاید بعدی
                </button>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>آغاز عملیات ۱۵ مرحله‌ای سازه‌ها</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* SUB-TOPIC 1: RHOMBUS & TRAPEZOID */}
            {subTopic === 'rhombus_trapezoid' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">
                    مساحت {geoQ.type === 'rhombus' ? 'لوزی' : 'ذوزنقه'} با شبیه‌سازی لیزری:
                  </div>
                  <div className="text-sm md:text-base text-slate-200">
                    {geoQ.type === 'rhombus' ? (
                      <span>
                        قطر بزرگ = <strong className="text-cyan-400">{toPersianDigits(geoQ.d1)}</strong> و قطر کوچک = <strong className="text-cyan-400">{toPersianDigits(geoQ.d2)}</strong> متر
                      </span>
                    ) : (
                      <span>
                        قاعده بزرگ = <strong className="text-cyan-400">{toPersianDigits(geoQ.b2)}</strong>، قاعده کوچک = <strong className="text-cyan-400">{toPersianDigits(geoQ.b1)}</strong> و ارتفاع = <strong className="text-amber-400">{toPersianDigits(geoQ.h)}</strong> متر
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950/90 border border-pink-500/30 flex flex-col items-center gap-4">
                  <button
                    onClick={() => {
                      SoundFX.laser();
                      setIsSimulated(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>✂️ ۱. شبیه‌سازی برش لیزری و نمایش شکل دوبرابر</span>
                  </button>

                  <div className="w-full max-w-xl h-56 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                    <svg viewBox="0 0 500 220" className="w-full h-full">
                      {geoQ.type === 'rhombus' ? (
                        <g>
                          {isSimulated && (
                            <>
                              <rect x="100" y="30" width="300" height="150" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
                              <polygon points="100,30 250,30 100,105" fill="rgba(244, 114, 182, 0.2)" />
                              <polygon points="250,30 400,30 400,105" fill="rgba(244, 114, 182, 0.2)" />
                              <polygon points="100,105 100,180 250,180" fill="rgba(244, 114, 182, 0.2)" />
                              <polygon points="400,105 250,180 400,180" fill="rgba(244, 114, 182, 0.2)" />
                            </>
                          )}
                          <polygon points="250,30 400,105 250,180 100,105" fill="rgba(236, 72, 153, 0.55)" stroke="#f472b6" strokeWidth="3" />
                          <line x1="100" y1="105" x2="400" y2="105" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 4" />
                          <line x1="250" y1="30" x2="250" y2="180" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 4" />
                          <text x="250" y="205" fill="#38bdf8" fontSize="13" textAnchor="middle" fontWeight="bold">
                            قطر بزرگ = {toPersianDigits(geoQ.d1)} متر
                          </text>
                          <text x="445" y="110" fill="#38bdf8" fontSize="13" textAnchor="middle" fontWeight="bold">
                            قطر کوچک = {toPersianDigits(geoQ.d2)} متر
                          </text>
                        </g>
                      ) : (
                        <g>
                          {isSimulated && (
                            <polygon points="200,45 420,45 360,165 260,165" fill="rgba(56, 189, 248, 0.35)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                          )}
                          <polygon points="100,45 200,45 260,165 40,165" fill="rgba(236, 72, 153, 0.6)" stroke="#f472b6" strokeWidth="3" />
                          <line x1="100" y1="45" x2="100" y2="165" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
                          <text x="150" y="35" fill="#f472b6" fontSize="12" textAnchor="middle" fontWeight="bold">قاعده کوچک = {toPersianDigits(geoQ.b1)}</text>
                          <text x="150" y="185" fill="#f472b6" fontSize="12" textAnchor="middle" fontWeight="bold">قاعده بزرگ = {toPersianDigits(geoQ.b2)}</text>
                          <text x="80" y="110" fill="#fbbf24" fontSize="12" textAnchor="middle" fontWeight="bold">ارتفاع = {toPersianDigits(geoQ.h)}</text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">مساحت شکل (متر مربع):</span>
                  <input
                    type="text"
                    placeholder="مساحت..."
                    value={ansArea}
                    onChange={(e) => setAnsArea(e.target.value)}
                    className="w-32 h-12 text-center text-xl font-bold bg-slate-900 border border-pink-500/60 rounded-xl text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />

                  <button
                    onClick={() => {
                      const uAns = parseFloat(toEnglishNumber(ansArea));
                      if (Math.abs(uAns - geoQ.area) < 0.1) {
                        setFeedback({ type: 'success', message: 'مساحت کاملاً دقیق محاسبه شد!' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: دقت کنید که آیا تقسیم بر ۲ را اعمال کرده‌اید؟ فرمول ${geoQ.type === 'rhombus' ? '(قطر بزرگ × قطر کوچک) ÷ ۲' : '((مجموع دو قاعده) × ارتفاع) ÷ ۲'} را دوباره محاسبه کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید مساحت 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 2: CIRCLE PERIMETER & PI (RADIUS TRAP) */}
            {subTopic === 'circle_perimeter' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">محیط سپر حلقوی سفینه با عدد پی (ص ۱۱۰ تا ۱۱۲):</div>
                  <div className="text-base md:text-lg text-white font-semibold">
                    {circleGiven === 'radius' ? (
                      <span>
                        شعاع سپر دایره‌ای برابر <strong className="text-amber-400">{toPersianDigits(circleVal)} متر</strong> است. محیط دایره چقدر است؟ (عدد پی = ۳/۱۴)
                      </span>
                    ) : (
                      <span>
                        قطر سپر دایره‌ای برابر <strong className="text-cyan-400">{toPersianDigits(circleVal)} متر</strong> است. محیط دایره چقدر است؟ (عدد پی = ۳/۱۴)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-rose-300 font-semibold">
                    ⚠️ هشدار: مراقب تفاوت شعاع و قطر در فرمول محیط دایره باشید!
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">محیط دایره (متر):</span>
                  <input
                    type="text"
                    placeholder="محیط..."
                    value={ansPerimeter}
                    onChange={(e) => setAnsPerimeter(e.target.value)}
                    className="w-36 h-12 text-center text-xl font-bold bg-slate-900 border border-pink-500/60 rounded-xl text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />

                  <button
                    onClick={() => {
                      const uAns = parseFloat(toEnglishNumber(ansPerimeter));
                      const exp = parseFloat(circlePerimeter);
                      if (Math.abs(uAns - exp) < 0.2) {
                        setFeedback({ type: 'success', message: 'احسنت! در دام شعاع نیفتادید و محیط با ضرب در قطر دقیق به دست آمد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: فرمول محیط دایره برابر (قطر × ۳/۱۴) است. اگر شعاع به شما داده شده، ابتدا آن را ۲ برابر کنید!`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید محیط دایره 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 3: ANGLES & BISECTOR */}
            {subTopic === 'angles_bisector' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="text-xs text-slate-400">مجموع زوایای {angleType === 'triangle' ? 'مثلث (۱۸۰ درجه)' : 'چهارضلعی (۳۶۰ درجه)'}:</div>
                  <div className="text-base md:text-lg text-white font-semibold">
                    {angleType === 'triangle' ? (
                      <span>در یک مثلث، دو زاویه <strong className="text-cyan-400">{toPersianDigits(ang1)}°</strong> و <strong className="text-cyan-400">{toPersianDigits(ang2)}°</strong> هستند. زاویه سوم چند درجه است؟</span>
                    ) : (
                      <span>در یک چهارضلعی، سه زاویه <strong className="text-cyan-400">{toPersianDigits(ang1)}°</strong>، <strong className="text-cyan-400">{toPersianDigits(ang2)}°</strong> و <strong className="text-cyan-400">{toPersianDigits(ang3)}°</strong> هستند. زاویه چهارم چند درجه است؟</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">اندازه زاویه مجهول (درجه):</span>
                  <input
                    type="text"
                    placeholder="درجه..."
                    value={userAngle}
                    onChange={(e) => setUserAngle(e.target.value)}
                    className="w-28 h-12 text-center text-xl font-bold bg-slate-900 border border-pink-500/60 rounded-xl text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />

                  <button
                    onClick={() => {
                      const u = parseInt(toEnglishNumber(userAngle), 10);
                      if (u === missingAngle) {
                        setFeedback({ type: 'success', message: 'عالی بود! قانون مجموع زوایا به درستی اعمال شد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: مجموع زوایای ${angleType === 'triangle' ? 'مثلث ۱۸۰ درجه' : 'چهارضلعی ۳۶۰ درجه'} است. مجموع زاویه‌های داده‌شده را از کل کم کنید.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید زاویه 🎯
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 4: CENTRAL SYMMETRY (Diverse Shapes: N, Circle, Triangle, Parallelogram, Trapezoid) */}
            {subTopic === 'central_symmetry' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-slate-400">آزمایش تقارن مرکزی (دوران ۱۸۰ درجه حول نقطه مرکز):</div>
                  <div className="text-base md:text-lg text-white font-semibold">
                    آیا شکل زیر یعنی <strong className="text-cyan-300">{getSymmetryInfo().name}</strong> مرکز تقارن دارد؟
                    دکمه چرخش ۱۸۰ درجه را بزنید تا همپوشانی شکل را بیازمایید:
                  </div>

                  <div className="flex flex-col items-center gap-4 py-2">
                    <button
                      onClick={() => {
                        SoundFX.click();
                        setIsRotated180((prev) => !prev);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>{isRotated180 ? 'بازگردانی به حالت اولیه' : 'دوران ۱۸۰ درجه حول نقطه قرمز'}</span>
                    </button>

                    <div className="w-64 h-44 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                      {/* Central Point */}
                      <div className="absolute w-3 h-3 rounded-full bg-rose-500 z-20 shadow-md" />

                      {/* Dynamic Shapes */}
                      <div
                        className="transition-transform duration-700 flex items-center justify-center"
                        style={{ transform: `rotate(${isRotated180 ? '180deg' : '0deg'})` }}
                      >
                        {symShape === 'parallelogram' && (
                          <div className="w-36 h-20 bg-gradient-to-tr from-pink-600 to-rose-400 rounded-lg -skew-x-12" />
                        )}
                        {symShape === 'circle' && (
                          <div className="w-24 h-24 rounded-full border-4 border-cyan-400 bg-cyan-600/30" />
                        )}
                        {symShape === 'letter_N' && (
                          <span className="text-7xl font-mono font-black text-amber-400 select-none">N</span>
                        )}
                        {symShape === 'equilateral_triangle' && (
                          <div
                            className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[80px] border-b-emerald-500"
                          />
                        )}
                        {symShape === 'trapezoid' && (
                          <div className="w-32 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 [clip-path:polygon(25%_0%,75%_0%,100%_100%,0%_100%)]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <button
                    onClick={() => {
                      if (getSymmetryInfo().hasCentral) {
                        setFeedback({ type: 'success', message: 'کاملاً درست است! شکل با ۱۸۰ درجه دوران دقیقاً روی خودش منطبق می‌شود.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: دقت کنید! بعد از دوران ۱۸۰ درجه جهت شکل وارونه شد؛ بنابراین ${getSymmetryInfo().name} مرکز تقارن ندارد.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    بله، مرکز تقارن دارد ✓
                  </button>

                  <button
                    onClick={() => {
                      if (!getSymmetryInfo().hasCentral) {
                        setFeedback({ type: 'success', message: 'احسنت! شکل بعد از ۱۸۰ درجه وارونه شد و تقارن مرکزی ندارد.' });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: به تطابق کامل شکل بعد از چرخش ۱۸۰ درجه نگاه کنید؛ شکل مجدداً همان ساختار اولیه را به خود گرفت.`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    خیر، ندارد ✗
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TOPIC 5: VOLUME & CAPACITY (METERS TO CUBIC CENTIMETERS) */}
            {subTopic === 'volume_capacity' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="text-xs text-pink-400 font-bold flex items-center justify-center gap-1.5">
                    <span>📦 محاسبه حجم مکعب‌مستطیل با چالش تبدیل واحد</span>
                  </div>
                  <div className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
                    {volQuestion.story}
                  </div>

                  {/* Dimension Cards */}
                  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-center">
                      <div className="text-[11px] text-slate-400">طول (متر)</div>
                      <div className="text-base font-bold text-cyan-300 mt-1">
                        {toPersianDigits(volQuestion.lStr)} <span className="text-xs font-normal">متر</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-center">
                      <div className="text-[11px] text-slate-400">عرض (متر)</div>
                      <div className="text-base font-bold text-cyan-300 mt-1">
                        {toPersianDigits(volQuestion.wStr)} <span className="text-xs font-normal">متر</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-center">
                      <div className="text-[11px] text-slate-400">ارتفاع (متر)</div>
                      <div className="text-base font-bold text-cyan-300 mt-1">
                        {toPersianDigits(volQuestion.hStr)} <span className="text-xs font-normal">متر</span>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Conversion Notice */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs md:text-sm text-amber-200 font-semibold flex items-center justify-center gap-2">
                    <span>⚠️ تبدیل واحد الزامی:</span>
                    <span>ابعاد به «متر» داده شده، اما حجم کل را به «سانتی‌متر مکعب (cm³)» محاسبه کنید!</span>
                  </div>

                  {/* Unit Guide Accordion Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowUnitGuide(!showUnitGuide)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-pink-300 transition-all"
                    >
                      {showUnitGuide ? '▲ بستن راهنمای تبدیل واحد' : '💡 راهنمای گام‌به‌گام تبدیل واحد (کلیک کنید)'}
                    </button>
                  </div>

                  {showUnitGuide && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-pink-500/30 text-xs text-slate-300 text-right space-y-2 max-w-xl mx-auto animate-fadeIn">
                      <div className="font-bold text-pink-300 border-b border-slate-800 pb-1">
                        📐 دو روش ساده برای تبدیل واحد به سانتی‌متر مکعب:
                      </div>
                      <p>
                        <strong>روش اول (تبدیل مستقیم ابعاد به سانتی‌متر):</strong> چون هر ۱ متر برابر با ۱۰۰ سانتی‌متر است:
                      </p>
                      <ul className="list-disc list-inside text-cyan-300 pr-2 space-y-0.5">
                        <li>طول: {toPersianDigits(volQuestion.lStr)} متر = {toPersianDigits(volQuestion.lCm)} سانتی‌متر</li>
                        <li>عرض: {toPersianDigits(volQuestion.wStr)} متر = {toPersianDigits(volQuestion.wCm)} سانتی‌متر</li>
                        <li>ارتفاع: {toPersianDigits(volQuestion.hStr)} متر = {toPersianDigits(volQuestion.hCm)} سانتی‌متر</li>
                      </ul>
                      <p className="text-emerald-300 font-semibold">
                        سپس سه بعد سانتی‌متری را در هم ضرب کنید: ({toPersianDigits(volQuestion.lCm)} × {toPersianDigits(volQuestion.wCm)} × {toPersianDigits(volQuestion.hCm)})
                      </p>
                      <p className="text-slate-400 text-[11px] pt-1">
                        <strong>روش دوم:</strong> حجم را ابتدا به متر مکعب بیابید و سپس در ۱,۰۰۰,۰۰۰ ضرب کنید (چون ۱ متر مکعب = ۱,۰۰۰,۰۰۰ سانتی‌متر مکعب است).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-sm text-slate-300 font-semibold">حجم کل بر حسب سانتی‌متر مکعب:</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثلاً: ۱۰۰۰۰۰۰"
                      value={ansVol}
                      onChange={(e) => setAnsVol(e.target.value)}
                      className="w-44 h-12 text-center text-lg font-bold bg-slate-900 border border-pink-500/60 rounded-xl text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-xs placeholder:text-slate-500"
                    />
                  </div>
                  <span className="text-xs text-pink-300 font-bold">cm³ (سانتی‌متر مکعب)</span>

                  <button
                    onClick={() => {
                      const cleanAns = toEnglishNumber(ansVol).replace(/[^0-9]/g, '');
                      const u = parseInt(cleanAns, 10);
                      if (u === volQuestion.volCm3) {
                        setFeedback({
                          type: 'success',
                          message: `آفرین! تبدیل واحد از متر به سانتی‌متر مکعب کاملاً دقیق انجام شد و حجم مخزن برابر با ${toPersianDigits(volQuestion.volCm3.toLocaleString('fa-IR'))} سانتی‌متر مکعب ثبت گردید.`,
                        });
                        advanceStage();
                      } else {
                        onLogMistake();
                        SoundFX.error();
                        setFeedback({
                          type: 'error',
                          message: `راهنمایی: ابعاد بر حسب متر است. ${volQuestion.hint}`,
                        });
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                  >
                    تایید حجم و تبدیل واحد 🎯
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
        message="مرحله کارگاه سازه‌ها با موفقیت فتح شد!"
        energyGained={20}
        onDone={() => setShowCelebration(false)}
      />
    </div>
  );
}
