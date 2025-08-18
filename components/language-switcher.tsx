'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = languages.find(l => pathname?.startsWith(`/${l.code}`))?.code || 'ar';

  const onSelect = (code: string) => {
    setOpen(false);
    if (!pathname) return;

    // Extract the path without locale
    const pathSegments = pathname.split('/').filter(Boolean);
    const validLocales = ['en', 'fr', 'es', 'ar'];

    // Remove current locale if present
    if (validLocales.includes(pathSegments[0])) {
      pathSegments.shift();
    }

    // Construct new path
    const basePath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/';
    const newPath = code === 'ar' ? basePath : `/${code}${basePath}`;

    router.push(newPath);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 shadow-sm"
      >
        <span>{languages.find(l => l.code === current)?.label}</span>
        <span className="text-gray-500">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 ${current === l.code ? 'font-semibold' : 'text-gray-700'}`}
              style={current === l.code ? {color: '#3a4956'} : {}}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

