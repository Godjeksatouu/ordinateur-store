'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/products';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

export function ProductCard({ product, showPrice = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslations();

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          مميز
        </div>
      </div>

      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <Image
              src={`http://localhost:5000${product.images[0]}`}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mb-3" />
              <div className="text-sm text-gray-500 font-medium">{product.name}</div>
              <div className="text-xs text-gray-400 mt-1">صورة غير متوفرة</div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 group-hover:text-amber-500 transition-all duration-300 transform group-hover:scale-110 mb-3" />
            <div className="text-sm text-gray-500 font-medium">{product.name}</div>
            <div className="text-xs text-gray-400 mt-1">صورة غير متوفرة</div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Fallback icon for failed images */}
        {product.images && product.images.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ShoppingBagIcon className="h-12 w-12 text-white/80" />
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Product Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300 leading-tight">
          {product.name}
        </h3>

        {/* Specifications */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t('ram')}:</span>
            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
              {product.ram}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t('storage')}:</span>
            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
              {product.storage}
            </span>
          </div>
          {product.processor && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('processor')}:</span>
              <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                {product.processor}
              </span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-4 w-4 text-amber-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-600 mr-2">(4.9)</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          {product.old_price && product.old_price > 0 && (
            <div className="text-sm text-gray-500 line-through">
              {product.old_price.toLocaleString()} {t('currency')}
            </div>
          )}
          <div className="text-2xl font-bold text-amber-600">
            {product.new_price.toLocaleString()} <span className="text-sm text-gray-500 mr-1">{t('currency')}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/product/${product.id}`}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold text-center block transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
          prefetch={true}
        >
          {showPrice ? t('orderNow') : t('buyNow')}
        </Link>
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-amber-400 transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
}
