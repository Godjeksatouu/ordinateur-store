import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { FreeDelivery } from '@/app/free-delivery';
import { HydrationSafe } from '@/components/hydration-safe';
import { CurrencyProvider } from '@/components/currency-context';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white" suppressHydrationWarning>
      <CurrencyProvider>
        <HydrationSafe>
          <FreeDelivery show={true} />
        </HydrationSafe>
        <HydrationSafe>
          <Navigation />
        </HydrationSafe>
        <div suppressHydrationWarning>
          {children}
        </div>
        <HydrationSafe>
          <Footer />
        </HydrationSafe>
        <HydrationSafe>
          <WhatsAppButton />
        </HydrationSafe>
      </CurrencyProvider>
    </div>
  );
}
