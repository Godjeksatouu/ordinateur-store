'use client';

import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  href: string;
}

export function NavigationClient() {
  const { t, locale } = useTranslations();
  
  const navigation: NavigationItem[] = [
    { name: t('home'), href: locale === 'ar' ? '/' : `/${locale}` },
    { name: t('laptops'), href: locale === 'ar' ? '/laptops' : `/${locale}/laptops` },
    { name: t('contact'), href: locale === 'ar' ? '/contact' : `/${locale}/contact` },
  ];

  return (
    <div className="flex space-x-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="relative px-6 py-3 text-lg font-semibold text-gray-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-50 group"
        >
          {item.name}
          <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
        </Link>
      ))}
    </div>
  );
}
