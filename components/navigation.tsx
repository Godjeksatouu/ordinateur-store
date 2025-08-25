'use client';

import { getCart } from '@/lib/actions';
import { ShoppingBagIcon, ShoppingCartIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { LanguageSwitcherWrapper } from './language-switcher-wrapper';
import { NavigationClient } from './navigation-client';
import { NavigationSearch } from './navigation-search';
import { CurrencyDropdown } from './currency-dropdown';



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
    <Link
      href="/cart"
      className="group relative p-3 rounded-xl hover:bg-amber-50 transition-all duration-300"
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ' (empty)'}`}
    >
      <ShoppingCartIcon className="h-6 w-6 flex-shrink-0 text-gray-800 group-hover:text-amber-600 transition-colors duration-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
          {itemCount}
        </span>
      )}
      <span className="sr-only">View shopping cart</span>
    </Link>
  );
}

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40" suppressHydrationWarning>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-20 items-center justify-between" suppressHydrationWarning>
          {/* Left: Navigation Links */}
          <div className="flex flex-1 items-center" suppressHydrationWarning>
            <NavigationClient />
          </div>

          {/* Center: Logo */}
          <div className="flex items-center justify-center" suppressHydrationWarning>
            <Link
              href="/"
              className="flex items-center justify-center group"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 bg-white p-1">
                <Image
                  src="/images/logo.png"
                  alt="Computer Store Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                  unoptimized
                />
              </div>
            </Link>
          </div>

          {/* Right: Search, Language, Currency and Cart */}
          <div className="flex flex-1 items-center justify-end space-x-4" suppressHydrationWarning>
            <NavigationSearch />
            <div className="flex items-center gap-3" suppressHydrationWarning>
              <LanguageSwitcherWrapper />
              <CurrencyDropdown />
            </div>
            <div className="ml-2 flow-root" suppressHydrationWarning>
              <Suspense fallback={<ShoppingCartNavItemFallback />}>
                <ShoppingCartNavItem />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden" suppressHydrationWarning>
          {/* Top bar: Cart + Logo + Hamburger */}
          <div className="flex h-16 items-center justify-between px-3">
            {/* Left: Cart */}
            <div className="flex items-center">
              <Suspense fallback={<ShoppingCartNavItemFallback />}>
                <ShoppingCartNavItem />
              </Suspense>
            </div>

            {/* Center: Logo */}
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="flex items-center justify-center"
                aria-label="Go to homepage"
              >
                <div className="relative h-10 max-h-12 w-auto rounded-xl overflow-hidden shadow-lg bg-white p-1">
                  <Image
                    src="/images/logo.png"
                    alt="Computer Store Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </Link>
            </div>

            {/* Right: Hamburger */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setMobileOpen(v => !v)}
                className="inline-flex items-center justify-center p-3 rounded-xl border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors"
                aria-label="Open navigation menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Second row: Currency + Language + Search */}
          <div className="border-t border-gray-200 bg-white px-3 py-3">
            <div className="flex items-center gap-3">
              <CurrencyDropdown className="h-11 min-w-[80px]" />
              <LanguageSwitcherWrapper />
              <div className="flex-1">
                <NavigationSearch />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer (only navigation links) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4">
            <NavigationClient />
          </div>
        </div>
      )}

    </header>
  );
}

