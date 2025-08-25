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

  const current = languages.find(l => pathname?.startsWith(`/${l.code}`))?.code || 'fr';

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
    const newPath = code === 'fr' ? basePath : `/${code}${basePath}`;

    router.push(newPath);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-800 min-w-[100px] transition-colors"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{languages.find(l => l.code === current)?.label}</span>
        <span className="text-gray-500">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-50" role="listbox">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                current === l.code ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-700'
              }`}
              role="option"
              aria-selected={current === l.code}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

