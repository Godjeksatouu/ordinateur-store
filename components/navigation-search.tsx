'use client';

import { useTranslations } from '@/hooks/use-translations';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function NavigationSearch() {
  const { t } = useTranslations();

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={t('search')}
        className="w-64 px-4 py-3 pr-12 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
      />
      <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
    </div>
  );
}
