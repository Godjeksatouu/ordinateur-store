'use client';

import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface NavigationItem {
  name: string;
  href: string;
}

export function NavigationClient() {
  const { t, locale } = useTranslations();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const navigation: NavigationItem[] = [
    { name: t('home'), href: locale === 'ar' ? '/' : `/${locale}` },
    { name: t('contact'), href: locale === 'ar' ? '/contact' : `/${locale}/contact` },
    ...categories.map((c) => ({
      name: c.name,
      href: locale === 'ar' ? `/categories/${c.slug || c.id}` : `/${locale}/categories/${c.slug || c.id}`
    }))
  ];

  return (
    <div className="flex space-x-1 lg:space-x-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="relative px-3 lg:px-4 xl:px-6 py-3 text-sm lg:text-base xl:text-lg font-semibold text-[#262a2f] hover:text-[#6188a4] transition-all duration-300 rounded-xl hover:bg-[#adb8c1]/30 group whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#6188a4]/50"
        >
          {item.name}
          <span className="absolute bottom-1 left-1/2 w-0 h-[3px] bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full group-hover:w-4/5 group-hover:left-[10%] transition-all duration-300"></span>
        </Link>
      ))}
    </div>
  );
}
