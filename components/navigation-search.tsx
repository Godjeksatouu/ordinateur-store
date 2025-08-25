'use client';

import { useTranslations } from '@/hooks/use-translations';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function NavigationSearch() {
  const { t } = useTranslations();

  return (
    <div className="relative w-full max-w-[20rem] sm:max-w-[24rem] lg:max-w-[28rem]">
      <input
        type="text"
        placeholder={t('search')}
        className="w-full h-11 px-4 pr-12 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white hover:bg-gray-50 placeholder-gray-500"
        aria-label="Search products"
      />
      <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
    </div>
  );
}
