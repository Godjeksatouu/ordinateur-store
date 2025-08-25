"use client";

import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { HydrationSafe } from '@/components/hydration-safe';
import Image from 'next/image';
import { fetchProducts } from '@/lib/products';
import { fetchAccessoires, Accessoire } from '@/lib/accessoires';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t } = useTranslations();
  const [products, setProducts] = useState<any[]>([]);
  const [accessoires, setAccessoires] = useState<Accessoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

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
        const [fetchedProducts, fetchedAccessoires] = await Promise.all([
          fetchProducts(),
          fetchAccessoires()
        ]);
        setProducts(fetchedProducts);
        setAccessoires(fetchedAccessoires);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Combine products and accessories for display
  const allItems = [...products, ...accessoires];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentItems = allItems.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(allItems.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to products section
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PublicLayout>
      <HydrationSafe>
        <div>
          {/* Hero Section - Slider */}
          <div className="relative h-[75vh] md:h-[85vh] overflow-hidden">
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

      {/* Categories Section */}
      <section className="py-12 bg-gradient-to-br from-[#fdfefd] to-[#adb8c1]/20">
        <div className="px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#262a2f] mb-4">{t('browseCategories')}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#6188a4] to-[#262a2f] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
            {/* Laptops Card */}
            <Link href="/categories/laptops" className="group block">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-[#adb8c1]/20" suppressHydrationWarning>
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

      <div>

        {/* Featured Products Section */}
        <section id="products-section" className="py-16 lg:py-20 bg-white">
          <Main>
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full mb-6">
                <span className="text-2xl text-white">⭐</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#262a2f] mb-4 tracking-tight">
                {t('featuredCollection')}
              </h2>
              <p className="text-lg text-[#adb8c1] max-w-2xl mx-auto mb-6">
                {t('featuredCollectionDesc')}
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-[#6188a4] to-[#262a2f] mx-auto rounded-full"></div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="skeleton rounded-xl h-48 mb-4" />
                    <div className="space-y-2">
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-4 rounded w-1/2" />
                      <div className="skeleton h-6 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentItems.map((item) => (
                    <ProductCard key={item.id} product={item as any} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2" suppressHydrationWarning>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t('previous')}
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t('next')}
                    </button>
                  </div>
                )}

                {/* Products Count Info */}
                <div className="mt-6 text-center text-gray-600" suppressHydrationWarning>
                  <p>
                    {t('showingProducts', {
                      start: indexOfFirstProduct + 1,
                      end: Math.min(indexOfLastProduct, allItems.length),
                      total: allItems.length
                    })}
                  </p>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
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
        <section className="bg-gradient-to-br from-gray-50 to-slate-100 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                {t('ourServices')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('ourServicesDesc')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('smartWatch')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('smartWatchDesc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('fastDelivery')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('fastDeliveryDesc')}</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg">
                    <CurrencyDollarIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{t('cashOnDelivery')}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{t('cashOnDeliveryDesc')}</p>
              </div>
            </div>
          </div>
        </section>


      </div>
    </PublicLayout>
  );
}
