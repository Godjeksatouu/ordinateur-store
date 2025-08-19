"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/hooks/use-translations';
import { Product } from '@/lib/products';
import { API_BASE_URL } from '@/lib/config';

interface Props {
  product: Product;
  showCTA?: boolean;
}

export default function ProductCardModern({ product, showCTA = true }: Props) {
  const { t, locale } = useTranslations();
  const hasDiscount = !!product.old_price && product.old_price > product.new_price;
  const discountPct = hasDiscount
    ? Math.round(((product.old_price! - product.new_price) / product.old_price!) * 100)
    : 0;

  return (
    <article className="group relative rounded-2xl border border-muted/40 bg-light shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-3 end-3 z-10">
          <span className="inline-flex items-center rounded-full bg-primary text-light px-2.5 py-1 text-xs font-bold tracking-wide shadow">
            -{discountPct}%
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted/20">
        {product.images?.[0] ? (
          <Image
            src={`${API_BASE_URL}${product.images[0]}`}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-dark/60">
            <span className="text-sm">{t('imageNotAvailable')}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base md:text-lg font-bold text-dark group-hover:text-primary line-clamp-2 mb-2">
          {product.name}
        </h3>

        <dl className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-4">
          {product.ram && (
            <div className="rounded-lg bg-muted/20 p-2">
              <dt className="text-dark/70">{t('ram')}</dt>
              <dd className="font-semibold text-dark">{product.ram}</dd>
            </div>
          )}
          {product.storage && (
            <div className="rounded-lg bg-muted/20 p-2">
              <dt className="text-dark/70">{t('storage')}</dt>
              <dd className="font-semibold text-dark">{product.storage}</dd>
            </div>
          )}
          {product.processor && (
            <div className="rounded-lg bg-muted/20 p-2 col-span-2">
              <dt className="text-dark/70">{t('processor')}</dt>
              <dd className="font-semibold text-dark truncate">{product.processor}</dd>
            </div>
          )}
        </dl>

        {/* Pricing */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            {product.old_price && product.old_price > 0 && (
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-dark/60 line-through">
                  {product.old_price.toLocaleString()} {t('currency')}
                </div>
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  -{Math.round(((product.old_price - product.new_price) / product.old_price) * 100)}%
                </div>
              </div>
            )}
            <div className="text-lg md:text-xl font-extrabold text-primary">
              {product.new_price.toLocaleString()} <span className="text-xs text-dark/70">{t('currency')}</span>
            </div>
            {product.old_price && product.old_price > 0 && (
              <div className="text-xs text-green-600 font-medium mt-1">
                {t('youSaved')}: {(product.old_price - product.new_price).toLocaleString()} {t('currency')}
              </div>
            )}
          </div>

          {showCTA && (
            <Link
              href={locale === 'ar' ? `/product/${product.id}` : `/${locale}/product/${product.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-light shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-light hover:brightness-95"
            >
              {t('orderNow')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

