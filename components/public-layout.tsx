import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { FreeDelivery } from '@/app/free-delivery';
import { HydrationSafe } from '@/components/hydration-safe';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white" suppressHydrationWarning>
      <HydrationSafe>
        <FreeDelivery show={true} />
      </HydrationSafe>
      <HydrationSafe>
        <Navigation />
      </HydrationSafe>
      {children}
      <HydrationSafe>
        <Footer />
      </HydrationSafe>
      <HydrationSafe>
        <WhatsAppButton />
      </HydrationSafe>
    </div>
  );
}
