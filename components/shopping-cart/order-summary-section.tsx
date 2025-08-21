'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/use-translations';
import { useCurrency } from '@/components/currency-context';
import { CartItem } from '@/components/utils/cart-types';

function OrderSummaryFallback() {
  return (
    <div className="mt-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="h-5 w-12 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function OrderSummaryContentClient({
  subtotal,
  shipping,
  total,
  qualifyingForFreeDelivery,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  qualifyingForFreeDelivery: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const { format } = useCurrency();
  const { t } = useTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300">
        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{t('subtotal')}</p>
        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
          {mounted ? format(subtotal) : `${subtotal.toLocaleString()} DH`}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300">
        <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{t('shippingCost')}</p>
        {qualifyingForFreeDelivery ? (
          <p className="text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
            <span className="line-through font-normal">
              {mounted ? format(shipping) : `${shipping.toLocaleString()} DH`}
            </span>{' '}
            <span className="text-green-600 font-semibold">{t('free')}</span>
          </p>
        ) : (
          <p className="text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
            {mounted ? format(shipping) : `${shipping.toLocaleString()} DH`}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300">
        <div className="text-base font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">{t('total')}</div>
        <div className="text-base font-medium text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
          {mounted ? format(total) : `${total.toLocaleString()} DH`}
        </div>
      </div>
    </div>
  );
}

export function OrderSummarySection({
  freeDelivery,
  proceedToCheckout,
}: {
  freeDelivery: boolean;
  proceedToCheckout: React.ReactNode;
}) {
  const { t } = useTranslations();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, use empty cart since we're not implementing the full cart functionality
    setItems([]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="mt-16 rounded-lg bg-gray-50 px-6 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 hover:shadow-lg transition-all duration-300">
        <h2 className="text-lg font-medium text-gray-900 mb-6">{t('orderSummary')}</h2>
        <div className="mt-6">{proceedToCheckout}</div>
        <OrderSummaryFallback />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {t('or')}{' '}
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
            >
              {t('continueShopping')}
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const subtotal = items.length * 45000; // Assuming 45000 DH per laptop
  const qualifyingForFreeDelivery = freeDelivery && subtotal > 50000;
  const shippingCost = 2000;
  const shipping = qualifyingForFreeDelivery ? 0 : shippingCost;
  const total = subtotal + shipping;

  return (
    <section className="mt-16 rounded-lg bg-gray-50 px-6 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 hover:shadow-lg transition-all duration-300">
      <h2 className="text-lg font-medium text-gray-900 mb-6 group hover:text-gray-700 transition-colors duration-300">{t('orderSummary')}</h2>

      <div className="mt-6 group hover:scale-[1.02] transition-transform duration-300">{proceedToCheckout}</div>

      <OrderSummaryContentClient
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        qualifyingForFreeDelivery={qualifyingForFreeDelivery}
      />

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {t('or')}{' '}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500 hover:scale-105 transition-all duration-300 inline-block"
          >
            {t('continueShopping')}
          </Link>
        </p>
      </div>
    </section>
  );
}
