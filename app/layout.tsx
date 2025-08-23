import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ClientOnly } from '@/components/client-only';
import Script from 'next/script';

import './globals.css';

export const metadata: Metadata = {
  title: 'Magasin d\'Ordinateurs - Les Meilleurs Ordinateurs Portables',
  description: 'Magasin spécialisé dans la vente d\'ordinateurs portables HP EliteBook aux meilleurs prix',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Facebook Pixel - Updated to latest version */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            // Initialize with enhanced configuration for Attribution Reporting
            fbq('init', '1384749272279226', {
              external_id: 'ordinateur_store_' + Date.now()
            });
            fbq('track', 'PageView');

            // Enhanced privacy and attribution settings
            fbq('set', 'autoConfig', false, '1384749272279226');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}}
               src="https://www.facebook.com/tr?id=1384749272279226&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <ClientOnly>
          <Toaster />
        </ClientOnly>
      </body>
    </html>
  );
}
