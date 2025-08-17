'use client';

import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';

export function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] p-3 rounded-xl shadow-lg">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('storeName')}</h3>
                  <p className="text-amber-400 font-medium">{t('storeTagline')}</p>
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
                  <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    {t('home')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    {t('aboutStore')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    {t('termsConditions')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    {t('shippingPolicy')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">{t('contactUs')}</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <span className="text-white">📞</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('phone')}</p>
                    <p className="text-white font-medium">+212 661-585396</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">{t('email')}</p>
                    <p className="text-white font-medium">info@laptopstore.ma</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
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
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                {t('privacyPolicy')}
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                {t('termsConditions')}
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                {t('returnPolicy')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
