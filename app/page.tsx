'use client';

import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { HydrationSafe } from '@/components/hydration-safe';
import { useTranslations } from '@/hooks/use-translations';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts, Product } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import {
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Small inline icons for features
function IconMemory({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 7v10M17 7v10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 5v2M8 5v2M12 5v2M16 5v2M20 5v2M4 17v2M8 17v2M12 17v2M16 17v2M20 17v2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function IconStorage({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="13" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconScreen({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 20h8M10 16v4M14 16v4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function IconBattery({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="4" y="9" width="10" height="6" rx="1" fill="currentColor"/>
      <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
    </svg>
  );
}
function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white">
      <span className="text-primary">
        {icon}
      </span>
      <span className="text-sm md:text-base font-medium leading-tight">{label}</span>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function Page() {
  const { t } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
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
        <div suppressHydrationWarning>
          {/* Hero Section - Slider */}
          <div className="relative h-[75vh] md:h-[85vh] overflow-hidden" suppressHydrationWarning>
          {/* Per-slide gradient backgrounds to match branding */}
          <div className="absolute inset-0" suppressHydrationWarning>
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
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={idx !== currentSlide}

              >
                <div className="max-w-7xl mx-auto h-full flex flex-col sm:flex-row items-center justify-between px-4 py-8 sm:py-12">
                  {/* Left: Text */}
                  <div className="text-white max-w-xl order-2 sm:order-1 text-center sm:text-left">
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
                  <div className="relative w-full sm:w-1/2 h-[30vh] sm:h-[45vh] order-1 sm:order-2 block mb-4 sm:mb-0">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority={idx === currentSlide}
                      unoptimized
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
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
        {/* Categories Section */}
        <section className="py-6 bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
              {/* Laptops Card */}
              <Link href="/categories/laptops" className="group block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" suppressHydrationWarning>
                  <div className="aspect-[3/2] relative" suppressHydrationWarning>
                    <img
                      src="/images/c1.png"
                      alt="Laptops"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to a gradient background if image doesn't exist
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                      }}
                    />
                  </div>
                </div>
              </Link>

              {/* Accessoires Card */}
              <Link href="/categories/accessoires" className="group block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" suppressHydrationWarning>
                  <div className="aspect-[3/2] relative" suppressHydrationWarning>
                    <img
                      src="/images/c2.png"
                      alt="Accessoires"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to a gradient background if image doesn't exist
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 bg-white">
          <Main>
            <div className="text-center mb-8" suppressHydrationWarning>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                {t('featuredCollection')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                {t('featuredCollectionDesc')}
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" suppressHydrationWarning></div>
            </div>
            {loading ? (
              <div className="text-center py-12" suppressHydrationWarning>
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" suppressHydrationWarning></div>
                <p className="mt-4 text-gray-600 text-lg">{t('loading')}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" suppressHydrationWarning>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12" suppressHydrationWarning>
                <div className="text-gray-400 mb-4" suppressHydrationWarning>
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg">{t('noProducts')}</p>
              </div>
            )}
          </Main>
        </section>

        {/* Services Section */}
        <section className="bg-gradient-to-br from-gray-50 to-slate-100 py-12" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="text-center mb-8" suppressHydrationWarning>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                {t('ourServices')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('ourServicesDesc')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" suppressHydrationWarning>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100" suppressHydrationWarning>
                <div className="flex items-center justify-center mb-6" suppressHydrationWarning>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg" suppressHydrationWarning>
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('smartWatch')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('smartWatchDesc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100" suppressHydrationWarning>
                <div className="flex items-center justify-center mb-6" suppressHydrationWarning>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg" suppressHydrationWarning>
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('fastDelivery')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('fastDeliveryDesc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100" suppressHydrationWarning>
                <div className="flex items-center justify-center mb-6" suppressHydrationWarning>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg" suppressHydrationWarning>
                    <CurrencyDollarIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('cashOnDelivery')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('cashOnDeliveryDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-white py-12" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="text-center mb-8" suppressHydrationWarning>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                {t('ourLocation')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                {t('visitUsHelp')}
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" suppressHydrationWarning></div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100" suppressHydrationWarning>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3326.6504174004017!2d-7.646460524306609!3d33.510471273365795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDMwJzM3LjciTiA3wrAzOCczOC4wIlc!5e0!3m2!1sen!2sma!4v1755531883255!5m2!1sen!2sma"
                width="100%"
                height="500"
                style={{border:0}}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-80 md:h-[500px] lg:h-[600px]"
              />
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
