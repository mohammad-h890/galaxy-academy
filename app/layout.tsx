import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'آکادمی مهندسان کهکشان: سفینه امید',
  description: 'سامانه تعاملی آموزش و سنجش ۵ گلوگاه مفهومی ریاضی (کسر، اعشار، تناسب، هندسه و زمان) با شبیه‌ساز کهکشانی',
  openGraph: {
    title: 'آکادمی مهندسان کهکشان: سفینه امید',
    description: 'سامانه تعاملی آموزش و سنجش ۵ گلوگاه مفهومی ریاضی با ماموریت نجات کهکشان',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'آکادمی مهندسان کهکشان: سفینه امید',
    description: 'سامانه تعاملی آموزش و حل چالش‌های مفهومی ریاضی',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl">
      <body suppressHydrationWarning className="font-['Vazirmatn',Tahoma,sans-serif] bg-[#07090f] text-[#e0e6ed] min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
