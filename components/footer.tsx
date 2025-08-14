import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const navigation = [
  'الصفحة الرئيسية',
  'حول المتجر',
  'الشروط والأحكام',
  'سياسة الشحن والإرجاع',
  'سياسة الخصوصية',
  'الأسئلة الشائعة',
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">متجر الحاسوب</h3>
                  <p className="text-amber-400 font-medium">أفضل أجهزة الكمبيوتر المحمولة</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                نحن متخصصون في توفير أحدث وأفضل أجهزة الكمبيوتر المحمولة بأعلى معايير الجودة وأفضل الأسعار في السوق.
              </p>


            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">روابط سريعة</h4>
              <ul className="space-y-3">
                {navigation.slice(0, 4).map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <span className="text-white">📞</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">الهاتف</p>
                    <p className="text-white font-medium">+212 661-585396</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">البريد الإلكتروني</p>
                    <p className="text-white font-medium">info@laptopstore.ma</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <span className="text-white">📍</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">العنوان</p>
                    <p className="text-white font-medium">الدار البيضاء، المغرب</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} متجر الحاسوب. جميع الحقوق محفوظة.
            </p>

            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                سياسة الخصوصية
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                الشروط والأحكام
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300">
                سياسة الإرجاع
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
