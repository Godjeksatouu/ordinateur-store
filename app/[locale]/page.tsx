import ClientPage from './_page';

// Generate static params for static export
export async function generateStaticParams() {
  return [
    { locale: 'ar' },
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'es' }
  ];
}


export default function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  return <ClientPage {...props} />;
}