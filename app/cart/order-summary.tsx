'use client';
import { OrderSummarySection } from '@/components/shopping-cart/order-summary-section';
import { ProceedToCheckout } from './proceed-to-checkout';

export function OrderSummary({
  freeDelivery,
}: {
  freeDelivery: boolean;
}) {
  return (
    <OrderSummarySection
      freeDelivery={freeDelivery}
      proceedToCheckout={<ProceedToCheckout color="blue" />}
    />
  );
}
