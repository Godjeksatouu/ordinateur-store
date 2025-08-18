'use client';

import { useTranslations } from '@/hooks/use-translations';

export function FreeDeliveryBanner() {
  const { t } = useTranslations();

  return (
    <div
      className="px-4 py-2 bg-gray-950 text-white text-center text text-sm font-medium"
      suppressHydrationWarning
    >
      {t('topBannerWelcome')}
    </div>
  );
}
