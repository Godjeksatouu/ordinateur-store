'use client';

import { usePathname } from 'next/navigation';
import { getTranslation } from '@/lib/translations';

export function useTranslations() {
  const pathname = usePathname();
  
  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'ar';
  const validLocales = ['en', 'fr', 'es', 'ar'];
  const currentLocale = validLocales.includes(locale) ? locale : 'ar';
  
  const t = (key: string) => getTranslation(currentLocale, key);
  
  return { t, locale: currentLocale };
}
