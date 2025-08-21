'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';
import { useCurrency } from './currency-context';
import { API_BASE_URL } from '@/lib/config';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

export function ProductCard({ product, showPrice = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, locale } = useTranslations();
  const { format } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate discount percentage
  const hasDiscount = product.old_price && product.old_price > product.new_price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.old_price - product.new_price) / product.old_price) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 hover:border-[#6188a4]/40 h-full flex flex-col p-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-[#fdfefd] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{discountPercentage}%
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#fdfefd] to-[#adb8c1]/10 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <Image
              src={`${API_BASE_URL}${product.images[0]}`}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
              onError={(e) => {
                // Hide the broken image and show fallback
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {/* Fallback for broken images */}
            <div className="image-fallback absolute inset-0 flex-col items-center justify-center text-center p-4 hidden">
              <ShoppingBagIcon className="h-12 w-12 text-[#adb8c1] mb-2" />
              <div className="text-sm text-[#262a2f] font-medium">{product.name}</div>
              <div className="text-xs text-[#adb8c1] mt-1">{t('imageNotAvailable')}</div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <ShoppingBagIcon className="h-12 w-12 text-[#adb8c1] group-hover:text-[#6188a4] transition-all duration-300 transform group-hover:scale-110 mb-2" />
            <div className="text-sm text-[#262a2f] font-medium">{product.name}</div>
            <div className="text-xs text-[#adb8c1] mt-1">{t('imageNotAvailable')}</div>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Product Title */}
        <h3 className="text-lg font-bold text-[#262a2f] mb-3 group-hover:text-[#6188a4] transition-colors duration-300 leading-tight line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Specifications - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-[#fdfefd] border border-[#adb8c1]/20 rounded-lg p-2">
            <div className="text-[#adb8c1] text-xs font-medium">{t('ram')}</div>
            <div className="font-bold text-[#262a2f] text-sm">{product.ram}</div>
          </div>
          <div className="bg-[#fdfefd] border border-[#adb8c1]/20 rounded-lg p-2">
            <div className="text-[#adb8c1] text-xs font-medium">{t('storage')}</div>
            <div className="font-bold text-[#262a2f] text-sm">{product.storage}</div>
          </div>
          {product.processor && (
            <div className="bg-[#fdfefd] border border-[#adb8c1]/20 rounded-lg p-2 col-span-2">
              <div className="text-[#adb8c1] text-xs font-medium">{t('processor')}</div>
              <div className="font-bold text-[#262a2f] text-xs leading-tight">{product.processor}</div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="mb-4">
            {hasDiscount && (
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-[#adb8c1] line-through">
                  {mounted ? format(product.old_price) : `${product.old_price.toLocaleString()} DH`}
                </div>
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{discountPercentage}%
                </div>
              </div>
            )}
            <div className="text-2xl font-bold text-[#6188a4]">
              {mounted ? format(product.new_price) : `${product.new_price.toLocaleString()} DH`}
            </div>
            {hasDiscount && (
              <div className="text-xs text-green-600 font-medium mt-1">
                {t('youSaved')}: {mounted ? format(product.old_price - product.new_price) : `${(product.old_price - product.new_price).toLocaleString()} DH`}
              </div>
            )}
          </div>

          {/* Action Button */}
          <Link
            href={locale === 'ar' ? `/product/${product.id}` : `/${locale}/product/${product.id}`}
            className="w-full bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-[#fdfefd] hover:from-[#262a2f] hover:to-[#6188a4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6188a4] focus:ring-offset-[#fdfefd] px-6 py-3 rounded-xl font-bold text-center block transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
            prefetch={true}
          >
            {showPrice ? t('orderNow') : t('buyNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
