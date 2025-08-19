'use client';

import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const { t, locale } = useTranslations();
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-white p-1">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('storeName')}</h3>
                  <p className="font-medium" style={{color: '#3a4956'}}>{t('storeTagline')}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                {t('storeDescription')}
              </p>


            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">{t('quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 transition-colors duration-300 flex items-center hover:text-[#3a4956]">
                    <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#3a4956'}}></span>
                    {t('home')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 transition-colors duration-300 flex items-center  hover:text-[#3a4956]">
                    <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#3a4956'}}></span>
                    {t('aboutStore')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">{t('contactUs')}</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#3a4956'}}>
                    <span className="text-white">📞</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('phone')}</p>
                    <p className="text-white font-medium">+212 661-585396</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#3a4956'}}>
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('email')}</p>
                    <p className="text-white font-medium">info@laptopstore.ma</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#3a4956'}}>
                    <span className="text-white">📍</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('address')}</p>
                    <p className="text-white font-medium">{t('storeAddress')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {t('storeName')}. {t('allRightsReserved')}.
            </p>

            <div className="flex space-x-6 text-sm">
              <Link
                href={locale === 'ar' ? '/confidentiality' : `/${locale}/confidentiality`}
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                {t('privacyPolicy')}
              </Link>
              <Link
                href={locale === 'ar' ? '/terms-and-conditions' : `/${locale}/terms-and-conditions`}
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                {t('termsConditions')}
              </Link>
              <Link
                href={locale === 'ar' ? '/return-policy' : `/${locale}/return-policy`}
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
              >
                {t('returnPolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
