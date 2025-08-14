import { proceedToCheckoutColorFlag } from '@/flags';
import { OrderSummarySection } from '@/components/shopping-cart/order-summary-section';
import { ProceedToCheckout } from './proceed-to-checkout';

export async function OrderSummary({
  freeDelivery,
}: {
  freeDelivery: boolean;
}) {
  // This is a fast feature flag so we don't suspend on it
  const proceedToCheckoutColor = await proceedToCheckoutColorFlag();

  return (
    <OrderSummarySection
      freeDelivery={freeDelivery}
      proceedToCheckout={<ProceedToCheckout color={proceedToCheckoutColor} />}
    />
  );
}
