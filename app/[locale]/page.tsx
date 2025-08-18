'use client';

import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { HydrationSafe } from '@/components/hydration-safe';
import Image from 'next/image';
import { fetchProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { useTranslations } from '@/hooks/use-translations';
import {
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// Feature icons for slider
function IconMemory({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );
}

function IconStorage({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4-1.79 4-4M4 7h16m-1 4H5m14 4H5" />
    </svg>
  );
}

function IconScreen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconBattery({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h16a1 1 0 011 1v4zM6 21h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
    </svg>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/90">
      <div className="text-white/80">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const { t } = useTranslations();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero slider data
  const slides = [
    {
      image: '/images/1.png',
      title: 'HP EliteBook 840 G5',
      subtitle: 'Core i5-8350U',
    },
    {
      image: '/images/2.png',
      title: 'HP EliteBook 840 G6',
      subtitle: 'Core i5-8365U',
    },
    {
      image: '/images/3.png',
      title: 'HP EliteBook 840 G7',
      subtitle: 'Core i5-10310U',
    },
    {
      image: '/images/4.png',
      title: 'HP EliteBook 840 G8',
      subtitle: 'Core i5-1145G7',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-advance every 5s (only on client)
  useEffect(() => {
    if (!isClient) return;

    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length, isClient]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <PublicLayout>
      <HydrationSafe>
        <div>
          {/* Hero Section - Slider */}
          <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          {/* Per-slide gradient backgrounds to match branding */}
          <div className="absolute inset-0">
            {slides.map((_, idx) => (
              <div
                key={`bg-${idx}`}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={idx !== currentSlide}
              >
                <div className={`w-full h-full ${
                  idx === 0 ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-black' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' :
                  idx === 2 ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black' :
                              'bg-gradient-to-br from-gray-900 via-neutral-800 to-black'
                }`} />
              </div>
            ))}
          </div>

          {/* Slides */}
          <div className="absolute inset-0">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden={idx !== currentSlide}
              >
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
                  {/* Left: Text */}
                  <div className="text-white max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-base md:text-xl text-gray-200 mb-5 text-center mx-auto">
                      {slide.subtitle}
                    </p>

                    {/* Features grid: 2x2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Feature icon={<IconMemory className="h-5 w-5" />} label={t("slider.ram")} />
                      <Feature icon={<IconStorage className="h-5 w-5" />} label={t("slider.ssd")} />
                      <Feature
                        icon={<IconScreen className="h-5 w-5" />}
                        label={
                          idx === 2 ? t("slider.screenTouch") : t("slider.screenFHD")
                        }
                      />
                      <Feature icon={<IconBattery className="h-5 w-5" />} label={t("slider.battery")} />
                    </div>
                  </div>
                  {/* Right: Image */}
                  <div className="relative w-1/2 h-[50vh] hidden sm:block">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority={idx === currentSlide}
                    />
                  </div>
                </div>
                {/* Subtle background vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Controls - Only render on client */}
          {isClient && (
            <>
              <button
                aria-label="Previous slide"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-md transition"
              >
                ‹
              </button>
              <button
                aria-label="Next slide"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-md transition"
              >
                ›
              </button>

              {/* Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 w-8 rounded-full transition-all ${
                      i === currentSlide ? 'bg-primary w-10' : 'bg-white/40'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        </div>
      </HydrationSafe>

      <div>
        {/* Featured Text Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              {t('heroTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <Main>
          <div className="py-20">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t('featuredCollection')}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">{t('noProducts')}</p>
                </div>
              )}
            </div>
          </div>
        </Main>

        {/* New 3 Cards Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('smartWatch')}</h4>
                <p className="text-gray-600">{t('smartWatchDesc')}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('fastDelivery')}</h4>
                <p className="text-gray-600">{t('fastDeliveryDesc')}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                    <CurrencyDollarIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('cashOnDelivery')}</h4>
                <p className="text-gray-600">{t('cashOnDeliveryDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                موقعنا
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto"></div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3326.6504174004017!2d-7.646460524306609!3d33.510471273365795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDMwJzM3LjciTiA3wrAzOCczOC4wIlc!5e0!3m2!1sen!2sma!4v1755531883255!5m2!1sen!2sma"
                width="100%"
                height="600"
                style={{border:0}}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-96 md:h-[600px]"
              />
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
