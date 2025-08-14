import { Main } from '@/components/main';
import Image from 'next/image';
import { laptops } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import {
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default async function Page(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="Hero"
          width={1920}
          height={1080}
          className="h-full w-full object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
      </div>

      {/* Featured Text Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            تجربة أحسن حاسوب تنتظرك
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            نقدم لك أفضل أجهزة الكمبيوتر المحمولة بأحدث التقنيات وأعلى معايير الجودة
          </p>
        </div>
      </div>

      {/* Products Section */}
      <Main>
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              مجموعتنا المميزة
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {laptops.map((laptop) => (
              <ProductCard key={laptop.id} product={laptop} />
            ))}
          </div>
        </div>
      </Main>

      {/* New 3 Cards Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">اكتشف عالم جديد من الذكاء</h4>
              <p className="text-gray-600">اجعل كل يوم أفضل مع ساعة ذكية مبتكرة!</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                  <TruckIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">التوصيل السريع</h4>
              <p className="text-gray-600">خدمة التوصيل السريع في جميع انحاء المدن</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">خدمة الدفع عند الاستلام</h4>
              <p className="text-gray-600">التسوق اون لاين من المتجر ودفع المال عند التوصيل.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
