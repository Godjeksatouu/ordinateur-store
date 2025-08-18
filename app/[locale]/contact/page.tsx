'use client';

import React from 'react';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { useTranslations } from '@/hooks/use-translations';

export default function LocalizedContactPage() {
  const { t } = useTranslations();

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" suppressHydrationWarning={true}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20" suppressHydrationWarning={true}>
        <div className="max-w-7xl mx-auto px-4 text-center" suppressHydrationWarning={true}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {t('contactUs')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك في العثور على الجهاز المثالي لاحتياجاتك
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-8"></div>
        </div>
      </div>

      <Main>
        <div className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                  {t('contactInfo')}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors duration-300">
                    <div className="bg-amber-500 text-white p-3 rounded-full">
                      📞
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('phone')}</p>
                      <p className="text-amber-600 font-medium">+212 661-585396</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
                    <div className="bg-blue-500 text-white p-3 rounded-full">
                      ✉️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('email')}</p>
                      <p className="text-blue-600 font-medium">info@laptopstore.ma</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
                    <div className="bg-green-500 text-white p-3 rounded-full">
                      📍
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('address')}</p>
                      <p className="text-green-600 font-medium">{t('storeLocation')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                  {t('workingHours')}
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-900">{t('saturdayToThursday')}</span>
                    <span className="text-amber-600 font-medium">9:00 ص - 6:00 م</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                    <span className="font-semibold text-gray-900">{t('friday')}</span>
                    <span className="text-red-600 font-medium">{t('closed')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                {t('sendMessage')}
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder={t('fullName')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                    placeholder={t('subject')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('message')}
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                    placeholder={t('message')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  📧 {t('sendMessageBtn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Main>
      </div>
    </PublicLayout>
  );
}
