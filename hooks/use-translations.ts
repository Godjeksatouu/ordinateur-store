'use client';

import { usePathname } from 'next/navigation';
import { getTranslation } from '@/lib/i18n';

export function useTranslations() {
  const pathname = usePathname();

  // Extract locale from pathname for App Router
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const validLocales = ['en', 'fr', 'es', 'ar'];
  const locale = validLocales.includes(pathSegments[0]) ? pathSegments[0] : 'fr';

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, key, params);

  return { t, locale };
}
