import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ClientOnly } from '@/components/client-only';

import './globals.css';

export const metadata: Metadata = {
  title: 'متجر الحاسوب - أفضل أجهزة الكمبيوتر المحمولة',
  description: 'متجر متخصص في بيع أجهزة الكمبيوتر المحمولة HP EliteBook بأفضل الأسعار',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <ClientOnly>
          <Toaster />
        </ClientOnly>
      </body>
    </html>
  );
}
