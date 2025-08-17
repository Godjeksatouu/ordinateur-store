'use client';

import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { HydrationSafe } from '@/components/hydration-safe';
import { useTranslations } from '@/hooks/use-translations';
import Image from 'next/image';
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
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
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
                      <Feature icon={<IconMemory className="h-5 w-5" />} label="16GB RAM" />
                      <Feature icon={<IconStorage className="h-5 w-5" />} label="256GB SSD" />
                      <Feature
                        icon={<IconScreen className="h-5 w-5" />}
                        label={
                          idx === 0 ? '14″ Full HD' :
                          idx === 1 ? '14″ Full HD' :
                          idx === 2 ? '14″ FHD TACTILE' :
                                       '14″ FHD (1920×1080)'
                        }
                      />
                      <Feature icon={<IconBattery className="h-5 w-5" />} label="Batterie jusqu’à 4 heures" />
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
              <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-600">{t('loading')}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">{t('noProducts')}</p>
              </div>
            )}
          </div>
        </Main>

        {/* 3-Image Grid Feature */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full md:h-[28rem] lg:h-[32rem]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Left: large image (2/3 width) */}
                <div className="relative md:col-span-2 h-64 md:h-full overflow-hidden rounded-2xl">
                  <Image
                    src="/images/f3.png"
                    alt="HP EliteBook - feature large"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                </div>
                {/* Right: two stacked images (1/3 width) */}
                <div className="md:col-span-1 grid grid-rows-2 gap-4 h-64 md:h-full" suppressHydrationWarning>
                  <div className="relative overflow-hidden rounded-2xl" suppressHydrationWarning>
                    <Image
                      src="/images/f1.png"
                      alt="Feature image 1"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl" suppressHydrationWarning>
                    <Image
                      src="/images/f2.png"
                      alt="Feature image 2"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* New 3 Cards Section */}
        <section className="bg-white py-16" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow" suppressHydrationWarning>
                <div className="flex items-center mb-4" suppressHydrationWarning>
                  <div className="bg-primary p-3 rounded-xl shadow-lg">
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('smartWatch')}</h4>
                <p className="text-gray-600">{t('smartWatchDesc')}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow" suppressHydrationWarning>
                <div className="flex items-center mb-4" suppressHydrationWarning>
                  <div className="bg-primary p-3 rounded-xl shadow-lg">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('fastDelivery')}</h4>
                <p className="text-gray-600">{t('fastDeliveryDesc')}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow" suppressHydrationWarning>
                <div className="flex items-center mb-4" suppressHydrationWarning>
                  <div className="bg-primary p-3 rounded-xl shadow-lg">
                    <CurrencyDollarIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{t('cashOnDelivery')}</h4>
                <p className="text-gray-600">{t('cashOnDeliveryDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
