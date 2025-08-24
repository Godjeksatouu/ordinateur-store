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
  const [imageLoaded, setImageLoaded] = useState(false);
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

  // Check if this is an accessory (accessories don't have RAM/storage/processor)
  const isAccessory = !product.ram && !product.storage && !product.processor;

  // Get the first available image from main_images, images, or optional_images
  const getFirstImage = () => {
    if (product.main_images && product.main_images.length > 0) {
      return product.main_images[0];
    }
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.optional_images && product.optional_images.length > 0) {
      return product.optional_images[0];
    }
    return null;
  };

  const firstImage = getFirstImage();

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#6188a4]/30 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
            -{discountPercentage}%
          </div>
        </div>
      )}

      {/* Product Image Container - Fixed aspect ratio */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Image Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        {firstImage ? (
          <Image
            src={`${API_BASE_URL}${firstImage}`}
            alt={product.name}
            fill
            className={`object-cover object-center transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            priority={false}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
            <ShoppingBagIcon className="h-8 w-8 text-gray-400 mb-2" />
            <div className="text-xs text-gray-600 font-medium line-clamp-2">{product.name}</div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Product Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Compact Specifications - Only show key specs on mobile */}
        {!isAccessory && (
          <div className="hidden sm:flex flex-wrap gap-1 mb-2">
            {product.ram && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {product.ram}
              </span>
            )}
            {product.storage && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {product.storage}
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto space-y-2">
          {/* Price Display */}
          <div className="space-y-1">
            {hasDiscount && (
              <div className="text-xs text-gray-500 line-through">
                {mounted ? format(product.old_price) : `${product.old_price.toLocaleString()} DH`}
              </div>
            )}
            <div className="text-lg font-bold text-[#6188a4]">
              {mounted ? format(product.new_price) : `${product.new_price.toLocaleString()} DH`}
            </div>
          </div>

          {/* Action Button - Compact for mobile */}
          <Link
            href={locale === 'ar' ? `/product/${product.id}` : `/${locale}/product/${product.id}`}
            className="w-full bg-[#6188a4] hover:bg-[#262a2f] text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-center block"
            prefetch={true}
          >
            {showPrice ? t('orderNow') : t('buyNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
