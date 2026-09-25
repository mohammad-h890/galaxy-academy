import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07090f] text-slate-100 p-4 text-center" dir="rtl">
      <h2 className="text-3xl font-bold text-cyan-400 mb-2">۴۰۴ - صفحه یافت نشد</h2>
      <p className="text-slate-400 mb-6">سیستم ناوبری فضاپیما نتوانست این مختصات را پیدا کند.</p>
      <Link href="/" className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm">
        بازگشت به عرشه فرماندهی
      </Link>
    </div>
  );
}
