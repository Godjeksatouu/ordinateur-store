import { getCart } from '@/lib/actions';
import { ShoppingBagIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { LanguageSwitcherWrapper } from './language-switcher-wrapper';

const navigation = [
  { name: 'الصفحة الرئيسية', href: '/' },
  { name: 'حاسوب', href: '/laptops' },
  { name: 'اتصل بنا', href: '/contact' }
];

function ShoppingCartNavItemFallback() {
  return (
    <Link href="/cart" className="group relative p-3 rounded-xl hover:bg-amber-50 transition-all duration-300">
      <ShoppingCartIcon className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-amber-600 transition-colors duration-300" />
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
    <header className="relative bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-40" suppressHydrationWarning>
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
            <div className="flex space-x-2" suppressHydrationWarning>
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
              <div className="relative" suppressHydrationWarning>
                <input
                  type="text"
                  placeholder="البحث..."
                  className="w-64 px-4 py-3 pr-12 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                />
                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
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
