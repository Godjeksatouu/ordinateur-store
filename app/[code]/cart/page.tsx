import { OrderSummary } from '@/app/[code]/cart/order-summary';
import { Main } from '@/components/main';
import { ShoppingCart } from '@/components/shopping-cart/shopping-cart';
import {
  productFlags,
  showFreeDeliveryBannerFlag,
} from '@/flags';

export default async function CartPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const freeDeliveryBanner = await showFreeDeliveryBannerFlag(
    code,
    productFlags,
  );

  return (
    <Main>
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        <ShoppingCart />
        <OrderSummary
          freeDelivery={freeDeliveryBanner}
        />
      </div>
    </Main>
  );
}
