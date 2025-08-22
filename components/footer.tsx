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
                    <p className="text-white font-medium">0661-585396</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#3a4956'}}>
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('email')}</p>
                    <p className="text-white font-medium">ordinateurstore.contact@gmail.com</p>
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
            <div className="flex flex-col items-center md:items-start space-y-2">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} {t('storeName')}. {t('allRightsReserved')}.
              </p>
              <p className="text-gray-500 text-xs">
                {t('developed')} <a
                  href="https://www.instagram.com/satou.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                >
                  Mohamedamine Satou
                </a>
              </p>
            </div>

            <div className="flex space-x-6 text-sm">
              <Link
                href={locale === 'ar' ? '/confidentiality' : `/${locale}/confidentiality`}
                className="relative text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6188a4]/50 px-1 group"
              >
                {t('privacyPolicy')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href={locale === 'ar' ? '/terms-and-conditions' : `/${locale}/terms-and-conditions`}
                className="relative text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6188a4]/50 px-1 group"
              >
                {t('termsConditions')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href={locale === 'ar' ? '/return-policy' : `/${locale}/return-policy`}
                className="relative text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6188a4]/50 px-1 group"
              >
                {t('returnPolicy')}
                <span className="absolute -bottom-1 left-0 w-0.5 h-0.5 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
