import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { FreeDelivery } from '@/app/free-delivery';
import { ClientOnly } from '@/components/client-only';

export async function generateStaticParams() {
  return [];
}

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{
    code: string;
  }>;
}) {
  return (
    <div className="bg-white">
      <FreeDelivery show={true} />
      <Navigation />
      {props.children}
      <Footer />
      <ClientOnly>
        <WhatsAppButton />
      </ClientOnly>
    </div>
  );
}
