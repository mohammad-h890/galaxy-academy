'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Header } from '@/components/Header';
import { RobotGuide } from '@/components/RobotGuide';
import { FractionsModule } from '@/components/FractionsModule';
import { DecimalsModule } from '@/components/DecimalsModule';
import { RatiosModule } from '@/components/RatiosModule';
import { GeometryModule } from '@/components/GeometryModule';
import { StatisticsModule } from '@/components/StatisticsModule';
import { PlanetRevitalization } from '@/components/PlanetRevitalization';
import { TeacherDashboardModal } from '@/components/TeacherDashboardModal';
import { VictoryModal } from '@/components/VictoryModal';
import { SoundFX } from '@/lib/sound';
import {
  AppState,
  defaultAppState,
  loadAppState,
  saveAppState,
  toPersianDigits,
} from '@/lib/utils';
import {
  Sparkles,
  Rocket,
  Flame,
  Crosshair,
  Cog,
  Shapes,
  Clock,
  CheckCircle,
  ArrowLeft,
  Award,
  Zap,
} from 'lucide-react';

type ViewMode =
  | 'registration'
  | 'dashboard'
  | 'fractions'
  | 'decimals'
  | 'ratios'
  | 'geometry'
  | 'statistics';

// Client check using useSyncExternalStore to eliminate any hydration mismatch or synchronous setState in effect
function emptySubscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Home() {
  const isClient = useIsClient();

  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window !== 'undefined') {
      return loadAppState();
    }
    return defaultAppState;
  });

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const loaded = loadAppState();
      return loaded.playerName ? 'dashboard' : 'registration';
    }
    return 'registration';
  });

  const [tempName, setTempName] = useState('');
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Sync to local storage on change
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim();
    if (!cleanName) return;

    SoundFX.success();
    updateState((prev) => ({
      ...prev,
      playerName: cleanName,
    }));
    setCurrentView('dashboard');
  };

  // Called when student answers a question correctly in any module
  const handleCorrectAnswer = (energyReward = 20) => {
    updateState((prev) => ({
      ...prev,
      lifeEnergy: prev.lifeEnergy + energyReward,
      totalEnergyEarned: prev.totalEnergyEarned + energyReward,
    }));
  };

  // Called when student finishes all 15 stages of a module
  const completeModule = (moduleKey: string) => {
    updateState((prev) => {
      const alreadyDone = prev.completedModules.includes(moduleKey);
      const nextCompleted = alreadyDone
        ? prev.completedModules
        : [...prev.completedModules, moduleKey];

      const nextLevel = Math.min(100, nextCompleted.length * 20);

      if (nextLevel >= 100 && prev.planetRestorationLevel < 100) {
        setTimeout(() => {
          setIsVictoryModalOpen(true);
        }, 600);
      }

      return {
        ...prev,
        completedModules: nextCompleted,
        planetRestorationLevel: nextLevel,
        moduleScores: {
          ...prev.moduleScores,
          [moduleKey]: 15,
        },
      };
    });

    SoundFX.success();
    setCurrentView('dashboard');
  };

  // Infuse life energy to make the planet greener
  const handleInjectEnergy = (amount: number) => {
    updateState((prev) => {
      if (prev.lifeEnergy < amount) return prev;
      const boost = amount >= 100 ? 35 : amount >= 50 ? 15 : 5;
      const nextGreenery = Math.min(100, prev.planetGreenery + boost);

      return {
        ...prev,
        lifeEnergy: prev.lifeEnergy - amount,
        planetGreenery: nextGreenery,
      };
    });
  };

  const logModuleMistake = (moduleKey: string) => {
    updateState((prev) => ({
      ...prev,
      mistakesLog: {
        ...prev.mistakesLog,
        [moduleKey]: (prev.mistakesLog[moduleKey] || 0) + 1,
      },
    }));
  };

  const resetAllData = () => {
    setAppState(defaultAppState);
    saveAppState(defaultAppState);
    setTempName('');
    setCurrentView('registration');
  };

  const modulesList = [
    {
      key: 'fractions',
      view: 'fractions' as ViewMode,
      title: '۱. موتورخانه (کسرها)',
      subtitle: 'کیمیاگر رآکتور سوخت',
      desc: 'تفریق اعداد مخلوط و کسرها با شکستن واحدهای کامل',
      icon: Flame,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      key: 'decimals',
      view: 'decimals' as ViewMode,
      title: '۲. سیستم ناوبری (اعشار)',
      subtitle: 'تراز لیزری ممیزها',
      desc: 'تراز موقعیت مکانی ممیز و استفاده از سپرهای صفر کمکی',
      icon: Crosshair,
      color: 'from-cyan-600 to-teal-500',
    },
    {
      key: 'ratios',
      view: 'ratios' as ViewMode,
      title: '۳. آزمایشگاه سوخت (تناسب)',
      subtitle: 'رآکتور تناسب و چرخ‌دنده‌ها',
      desc: 'جداول تناسب و اعمال روابط ضربی برای توازن چرخ‌دنده‌ها',
      icon: Cog,
      color: 'from-purple-600 to-indigo-500',
    },
    {
      key: 'geometry',
      view: 'geometry' as ViewMode,
      title: '۴. کارگاه سازه‌ها (هندسه)',
      subtitle: 'برش لیزری صفحات سفینه',
      desc: 'محاسبه مساحت لوزی و ذوزنقه با شبیه‌سازی لیزری و درک نصف شکل',
      icon: Shapes,
      color: 'from-pink-600 to-rose-500',
    },
    {
      key: 'statistics',
      view: 'statistics' as ViewMode,
      title: '۵. اتاق فرمان (آمار و زمان)',
      subtitle: 'مبنای ۶۰ و تحلیل معکوس میانگین',
      desc: 'محاسبات ساعت در مبنای ۶۰ دقیقه و یافتن مجموع از میانگین',
      icon: Clock,
      color: 'from-amber-600 to-orange-500',
    },
  ];

  // Prevent SSR/CSR mismatch by rendering the loading shell on server and before client is ready
  if (!isClient) {
    return (
      <div className="relative min-h-screen bg-[#07090f] text-slate-200 overflow-x-hidden p-4 md:p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
          <span>در حال اتصال به سامانه‌های سفینه امید...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090f] text-slate-200 overflow-x-hidden p-4 md:p-6">
      {/* Background Starfield and Nebula Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header with Total Energy & Spendable Life Energy */}
        <Header
          playerName={appState.playerName}
          planetProgress={appState.planetRestorationLevel}
          totalEnergyEarned={appState.totalEnergyEarned}
          lifeEnergy={appState.lifeEnergy}
          onOpenTeacher={() => setIsTeacherModalOpen(true)}
          onOpenDashboard={() => setCurrentView('dashboard')}
          currentView={currentView}
        />

        {/* VIEW 1: REGISTRATION */}
        {currentView === 'registration' && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-lg animate-pulse" />
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
                <Rocket className="w-12 h-12 text-cyan-100 animate-bounce-subtle" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                آکادمی مهندسان کهکشان
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                سفینه امید برای احیای سیاره نیازمند یک مهندس زبده ریاضی است. لطفاً شناسه خود را ثبت کنید:
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                required
                placeholder="نام و نام خانوادگی دانش‌آموز..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-cyan-500/50 text-center text-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-base shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                ورود به عرشه سفینه امید 🚀
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Spaceship Restoration Status Box */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <span>خوش آمدید، مهندس {appState.playerName}</span>
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    شاخص احیای ۵ بخش سفینه امید (تکمیل ۱۵ مرحله هر بخش ۲۰٪ پیشرفت اضافه می‌کند):
                  </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold text-lg tabular-nums">
                  <span>٪{toPersianDigits(appState.planetRestorationLevel)}</span>
                  <span className="text-xs text-slate-400 font-normal">سفینه فعال شد</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-1000 shadow-md shadow-emerald-500/20"
                  style={{ width: `${appState.planetRestorationLevel}%` }}
                />
              </div>

              {appState.planetRestorationLevel === 100 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-amber-300 font-bold">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>تمام ۵ گلوگاه حل شدند و سفینه کاملاً آماده احیای سیاره است!</span>
                </div>
              )}
            </div>

            {/* Robot Guide Welcome */}
            <RobotGuide
              message={`مهندس ${appState.playerName}، با حل چالش‌های ریاضی ۱۵ مرحله‌ای انرژی حیات به دست بیاورید و سپس با استفاده از سامانه زیر، انرژی را به سیاره تزریق کنید تا جنگل‌ها و مراتع سرسبز شوند.`}
              mood={appState.planetGreenery >= 80 ? 'excited' : 'happy'}
            />

            {/* Section: Planet Revitalization & Terraforming Interactive Arena */}
            <PlanetRevitalization
              lifeEnergy={appState.lifeEnergy}
              totalEnergyEarned={appState.totalEnergyEarned}
              planetGreenery={appState.planetGreenery}
              onInjectEnergy={handleInjectEnergy}
            />

            {/* Modules Grid (Each with 15 stages) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-300">بخش‌های عملیاتی سفینه (۱۵ مرحله‌ای)</h3>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(appState.completedModules.length)} از ۵ بخش تکمیل شده
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulesList.map((mod) => {
                  const Icon = mod.icon;
                  const isDone = appState.completedModules.includes(mod.key);
                  const currentScore = appState.moduleScores[mod.key] || 0;

                  return (
                    <button
                      key={mod.key}
                      onClick={() => {
                        SoundFX.click();
                        setCurrentView(mod.view);
                      }}
                      className={`group relative p-6 rounded-2xl bg-slate-900/90 border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 flex flex-col justify-between min-h-[195px] ${
                        isDone
                          ? 'border-emerald-500/50 shadow-emerald-950/20'
                          : 'border-slate-800 hover:border-cyan-500/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {isDone ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>۱۵ مرحله تکمیل</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
                              <span>ورود به ماژول</span>
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {mod.title}
                        </h4>
                        <div className="text-xs text-cyan-400/80 mb-2 font-medium">
                          {mod.subtitle}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{mod.desc}</p>
                      </div>

                      {/* Bottom status & reward indicator */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400/90">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>+۲۰ انرژی/سوال</span>
                        </span>
                        <span className="font-mono font-bold text-slate-200 tabular-nums">
                          مرحله {toPersianDigits(currentScore)} / ۱۵
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FRACTIONS */}
        {currentView === 'fractions' && (
          <FractionsModule
            onBack={() => setCurrentView('dashboard')}
            onComplete={() => completeModule('fractions')}
            onCorrectAnswer={handleCorrectAnswer}
            onLogMistake={() => logModuleMistake('fractions')}
          />
        )}

        {/* VIEW 4: DECIMALS */}
        {currentView === 'decimals' && (
          <DecimalsModule
            onBack={() => setCurrentView('dashboard')}
            onComplete={() => completeModule('decimals')}
            onCorrectAnswer={handleCorrectAnswer}
            onLogMistake={() => logModuleMistake('decimals')}
          />
        )}

        {/* VIEW 5: RATIOS */}
        {currentView === 'ratios' && (
          <RatiosModule
            onBack={() => setCurrentView('dashboard')}
            onComplete={() => completeModule('ratios')}
            onCorrectAnswer={handleCorrectAnswer}
            onLogMistake={() => logModuleMistake('ratios')}
          />
        )}

        {/* VIEW 6: GEOMETRY */}
        {currentView === 'geometry' && (
          <GeometryModule
            onBack={() => setCurrentView('dashboard')}
            onComplete={() => completeModule('geometry')}
            onCorrectAnswer={handleCorrectAnswer}
            onLogMistake={() => logModuleMistake('geometry')}
          />
        )}

        {/* VIEW 7: STATISTICS */}
        {currentView === 'statistics' && (
          <StatisticsModule
            onBack={() => setCurrentView('dashboard')}
            onComplete={() => completeModule('statistics')}
            onCorrectAnswer={handleCorrectAnswer}
            onLogMistake={() => logModuleMistake('statistics')}
          />
        )}
      </div>

      {/* Teacher Dashboard Modal (Password Removed) */}
      <TeacherDashboardModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        appState={appState}
        onResetData={resetAllData}
      />

      {/* 100% Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        playerName={appState.playerName}
      />
    </div>
  );
}
