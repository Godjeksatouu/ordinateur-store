import { FreeDeliveryBanner } from '@/components/banners/free-delivery-banner';

export function FreeDelivery(props: { show: boolean }) {
  if (!props.show) return null;

  return <FreeDeliveryBanner />;
}
