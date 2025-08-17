import { getCart } from '@/lib/actions';
import { ShoppingBagIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { LanguageSwitcherWrapper } from './language-switcher-wrapper';
import { NavigationClient } from './navigation-client';
import { NavigationSearch } from './navigation-search';



function ShoppingCartNavItemFallback() {
  return (
    <Link href="/cart" className="group relative p-3 rounded-xl hover:bg-[#adb8c1]/30 transition-all duration-300">
      <ShoppingCartIcon className="h-6 w-6 flex-shrink-0 text-[#262a2f] group-hover:text-[#6188a4] transition-colors duration-300" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
    </Link>
  );
}

function ShoppingCartNavItem() {
  // For now, we'll show a static cart icon. In a real app, you'd use a state management solution
  const itemCount = 0; // This would come from your cart state management

  return (
    <Link href="/cart" className="group relative p-3 rounded-xl hover:bg-amber-50 transition-all duration-300">
      <ShoppingCartIcon className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-amber-600 transition-colors duration-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

export function Navigation() {
  return (
    <header className="relative bg-[#fdfefd]/95 backdrop-blur-md shadow-lg border-b border-[#adb8c1]/40 sticky top-0 z-40" suppressHydrationWarning>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between" suppressHydrationWarning>
          {/* Mobile menu button */}
          <div className="flex flex-1 items-center lg:hidden" suppressHydrationWarning>
            <Link
              href="/"
              className="flex items-center justify-center"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            </Link>
          </div>

          {/* Logo */}
          <div className="hidden lg:flex" suppressHydrationWarning>
            <Link
              href="/"
              className="flex items-center justify-center group"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 bg-white p-1">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Centered Navigation */}
          <div className="hidden lg:flex flex-1 justify-center" suppressHydrationWarning>
            <NavigationClient />
          </div>

          {/* Search, Language and Cart */}
          <div className="flex flex-1 items-center justify-end space-x-4" suppressHydrationWarning>
            {/* Language Switcher */}
            <div className="hidden lg:flex items-center" suppressHydrationWarning>
              <div className="relative mr-2" suppressHydrationWarning>
                <LanguageSwitcherWrapper />
              </div>
            </div>
            {/* Search Bar */}
            <div className="hidden lg:flex items-center" suppressHydrationWarning>
              <NavigationSearch />
            </div>

            {/* Cart */}
            <div className="ml-4 flow-root lg:ml-6" suppressHydrationWarning>
              <Suspense fallback={<ShoppingCartNavItemFallback />}>
                <ShoppingCartNavItem />
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
