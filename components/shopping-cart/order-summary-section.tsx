'use client';

import { getCart } from '@/lib/actions';
import Link from 'next/link';
import { Suspense } from 'react';
import { useTranslations } from '@/hooks/use-translations';

function OrderSummaryFallback() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
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
  const { t } = useTranslations();

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{t('subtotal')}</p>
        <p className="text-sm font-medium text-gray-900">
          {subtotal.toLocaleString()} {t('currency')}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600">{t('shippingCost')}</p>
        {qualifyingForFreeDelivery ? (
          <p className="text-sm font-medium text-gray-900">
            <span className="line-through font-normal">
              {shipping.toLocaleString()} {t('currency')}
            </span>{' '}
            {t('free')}
          </p>
        ) : (
          <p className="text-sm font-medium text-gray-900">
            {shipping.toLocaleString()} {t('currency')}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <p className="text-base font-medium text-gray-900">{t('total')}</p>
        <p className="text-base font-medium text-gray-900">
          {total.toLocaleString()} {t('currency')}
        </p>
      </div>
    </div>
  );
}

async function OrderSummaryContent({
  freeDelivery,
}: {
  freeDelivery: boolean;
}) {
  const { items } = await getCart();
  const subtotal = items.length * 45000; // Assuming 45000 DH per laptop
  const qualifyingForFreeDelivery = freeDelivery && subtotal > 50000;
  const shippingCost = 2000;
  const shipping = qualifyingForFreeDelivery ? 0 : shippingCost;
  const total = subtotal + shipping;

  return (
    <OrderSummaryContentClient
      subtotal={subtotal}
      shipping={shipping}
      total={total}
      qualifyingForFreeDelivery={qualifyingForFreeDelivery}
    />
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

  return (
    <section className="mt-16 rounded-lg bg-gray-50 px-6 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">{t('orderSummary')}</h2>

      <div className="mt-6">{proceedToCheckout}</div>

      <Suspense
        fallback={<OrderSummaryFallback />}
      >
        <OrderSummaryContent
          freeDelivery={freeDelivery}
        />
      </Suspense>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {t('or')}{' '}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('continueShopping')}
          </Link>
        </p>
      </div>
    </section>
  );
}
