'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LanguageSwitcher = dynamic(() => import('./language-switcher').then(m => m.LanguageSwitcher), {
  ssr: false,
  loading: () => (
    <div className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 min-w-[100px]">
      <span>Français</span>
      <span className="text-gray-500">▾</span>
    </div>
  )
});

export function LanguageSwitcherWrapper() {
  return (
    <Suspense fallback={
      <div className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 min-w-[100px]">
        <span>Français</span>
        <span className="text-gray-500">▾</span>
      </div>
    }>
      <LanguageSwitcher />
    </Suspense>
  );
}
