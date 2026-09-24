'use client';

import React, { useState } from 'react';
import { SoundFX } from '@/lib/sound';
import { AppState, toPersianDigits } from '@/lib/utils';
import { ShieldCheck, X, AlertTriangle, RotateCcw, CheckCircle, Clock, Zap, Sprout } from 'lucide-react';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onResetData: () => void;
}

const moduleNames: Record<string, { title: string; concept: string; misconception: string }> = {
  fractions: {
    title: '۱. موتورخانه (کسرها)',
    concept: 'تفریق اعداد مخلوط و کسرها با شکستن واحد',
    misconception: 'تفریق برعکس صورت‌ها بدون قرض گرفتن از عدد صحیح',
  },
  decimals: {
    title: '۲. سیستم ناوبری (اعشار)',
    concept: 'تراز لیزری ممیز و افزودن صفرهای کمکی',
    misconception: 'تراز کردن اعداد اعشاری از سمت راست مشابه اعداد طبیعی',
  },
  ratios: {
    title: '۳. آزمایشگاه سوخت (تناسب)',
    concept: 'جداول تناسب و رابطه ضربی بین مقادیر',
    misconception: 'اعمال رابطه جمعی به جای رابطه ضربی بین ردیف‌ها و ستون‌ها',
  },
  geometry: {
    title: '۴. کارگاه سازه‌ها (هندسه)',
    concept: 'مساحت لوزی و ذوزنقه با شبیه‌سازی بُرش',
    misconception: 'فراموش کردن تقسیم بر ۲ در محاسبه مساحت لوزی و ذوزنقه',
  },
  statistics: {
    title: '۵. اتاق فرمان (آمار و زمان)',
    concept: 'محاسبات زمانی در مبنای ۶۰ و میانگین معکوس',
    misconception: 'فرض مبنای ۱۰۰ برای ساعت به جای مبنای ۶۰ دقیقه',
  },
};

export function TeacherDashboardModal({
  isOpen,
  onClose,
  appState,
  onResetData,
}: TeacherDashboardModalProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    SoundFX.click();
    setShowConfirmReset(false);
    onClose();
  };

  const executeReset = () => {
    SoundFX.shatter();
    onResetData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 md:p-8 text-slate-200 shadow-2xl shadow-indigo-950/60">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-500/40 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">داشبورد نظارت معلم بر یادگیری</h2>
            <p className="text-xs text-slate-400">
              تحلیل بدفهمی‌های ریاضی، پایش پیشرفت و وضعیت انرژی حیات (دسترسی مستقیم معلم)
            </p>
          </div>
        </div>

        {/* Analytics Dashboard Content */}
        <div className="space-y-6">
          {/* Student Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">نام دانش‌آموز:</span>
              <strong className="text-white text-base">{appState.playerName || 'ثبت‌نشده'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">احیای سفینه:</span>
              <strong className="text-cyan-400 text-base tabular-nums">
                ٪{toPersianDigits(appState.planetRestorationLevel)}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">سرسبزی سیاره:</span>
              <strong className="text-emerald-400 text-base tabular-nums flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5" />
                <span>٪{toPersianDigits(appState.planetGreenery)}</span>
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block text-xs">کل انرژی کسب‌شده:</span>
              <strong className="text-amber-400 text-base tabular-nums flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{toPersianDigits(appState.totalEnergyEarned)}</span>
              </strong>
            </div>
          </div>

          {/* Diagnostic Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950 text-cyan-300 border-b border-slate-800">
                  <th className="p-3">مبحث آموزشی و گلوگاه (۱۵ مرحله‌ای)</th>
                  <th className="p-3">وضعیت مراحل</th>
                  <th className="p-3">بدفهمی ثبت‌شده</th>
                  <th className="p-3 text-center">تعداد خطاهای مفهومی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {Object.entries(moduleNames).map(([key, info]) => {
                  const isDone = appState.completedModules.includes(key);
                  const currentScore = appState.moduleScores[key] || 0;
                  const mistakes = appState.mistakesLog[key] || 0;

                  return (
                    <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <strong className="text-white block">{info.title}</strong>
                        <span className="text-slate-400 text-xs">{info.concept}</span>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            <span>۱۵ از ۱۵ (تکمیل)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium font-mono">
                            <Clock className="w-4 h-4" />
                            <span>{toPersianDigits(currentScore)} از ۱۵ مرحله</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-xs text-slate-300">{info.misconception}</td>

                      <td className="p-3 text-center whitespace-nowrap">
                        {mistakes > 0 ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs">
                            {toPersianDigits(mistakes)} خطا
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">بدون خطا</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pedagogical Guidance */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs md:text-sm text-indigo-200 leading-relaxed">
            💡 <strong>توصیه آموزشی به معلم:</strong> هر بخش اکنون شامل ۱۵ مرحله استاندارد مفهومی با ارقام پویاست. ثبت خطاها بلافاصله بازخورد اصلاحی نمایش می‌دهد و هر پاسخ صحیح با ایجاد انرژی حیات انگیزه دانش‌آموز را برای بهبود سرسبزی سیاره دوچندان می‌کند.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بازنشانی پیشرفت دانش‌آموز</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  آیا از حذف کامل سوابق اطمینان دارید؟
                </span>
                <button
                  onClick={executeReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  بله، بازنشانی کن
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  انصراف
                </button>
              </div>
            )}

            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
