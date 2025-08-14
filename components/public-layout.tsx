import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { FreeDelivery } from '@/app/free-delivery';
import { ClientOnly } from '@/components/client-only';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <FreeDelivery show={true} />
      <Navigation />
      {children}
      <Footer />
      <ClientOnly>
        <WhatsAppButton />
      </ClientOnly>
    </div>
  );
}
