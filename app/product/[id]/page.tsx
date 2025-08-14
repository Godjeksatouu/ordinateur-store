'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { getProductById, Product } from '@/lib/products';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface OrderForm {
  fullName: string;
  phoneNumber: string;
  city: string;
  address: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    fullName: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [marketingConsent, setMarketingConsent] = useState(false);

  if (loading) {
    return (
      <PublicLayout>
        <Main>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600">جاري تحميل المنتج...</p>
          </div>
        </Main>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <Main>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">المنتج غير موجود</p>
          </div>
        </Main>
      </PublicLayout>
    );
  }

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!orderForm.fullName || !orderForm.phoneNumber || !orderForm.city || !orderForm.address) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (!marketingConsent) {
      alert('يرجى الموافقة على استقبال أحدث العروض والمنتجات عبر البريد الإلكتروني');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: orderForm.fullName,
          phoneNumber: orderForm.phoneNumber,
          city: orderForm.city,
          address: orderForm.address,
          productId: product.id,
          productName: product.name_ar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
        setShowOrderForm(false);
        setOrderForm({
          fullName: '',
          phoneNumber: '',
          city: '',
          address: ''
        });
      } else {
        alert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Main>
        <div className="py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Product Image */}
            <div className="mb-12 lg:mb-0">
              <div className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                  <div className="relative h-full w-full">
                    {/* Main Image with Zoom on Hover */}
                    <div className="h-full w-full overflow-hidden">
                      <Image
                        src={product.images && product.images.length > 0 ? `http://localhost:5000${product.images[activeIndex]}` : '/images/hero.png'}
                        alt={product.name_ar}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      جديد
                    </div>
                  </div>
                </div>

                {/* Thumbnails Slider */}
                {product.images && product.images.length > 1 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-5 gap-3">
                      {product.images.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                            activeIndex === i ? 'border-amber-500' : 'border-transparent hover:border-gray-200'
                          }`}
                          aria-label={`صورة ${i + 1}`}
                        >
                          <Image
                            src={`http://localhost:5000${src}`}
                            alt={`صورة ${i + 1}`}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 20vw, 10vw"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {product.name_ar}
                </h1>

                <div className="flex items-center space-x-4">
                  {product.old_price && product.old_price > 0 && (
                    <div className="text-xl text-gray-500 line-through">
                      {product.old_price.toLocaleString()} دج
                    </div>
                  )}
                  <div className="text-3xl font-bold text-amber-600">
                    {product.new_price.toLocaleString()}
                    <span className="text-lg text-gray-500 mr-2">دج</span>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    متوفر
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                  المواصفات التقنية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.ram && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">الذاكرة</span>
                      <span className="text-lg font-semibold text-gray-900">{product.ram}</span>
                    </div>
                  )}
                  {product.storage && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">التخزين</span>
                      <span className="text-lg font-semibold text-gray-900">{product.storage}</span>
                    </div>
                  )}
                  {product.screen && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">الشاشة</span>
                      <span className="text-lg font-semibold text-gray-900">{product.screen}</span>
                    </div>
                  )}
                  {product.graphics && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">كرت الشاشة</span>
                      <span className="text-lg font-semibold text-gray-900">{product.graphics}</span>
                    </div>
                  )}
                  {product.os && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">نظام التشغيل</span>
                      <span className="text-lg font-semibold text-gray-900">{product.os}</span>
                    </div>
                  )}
                  {product.specifications.processor && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300 md:col-span-2">
                      <span className="text-sm text-gray-600 block">المعالج</span>
                      <span className="text-lg font-semibold text-gray-900">{product.specifications.processor}</span>
                    </div>
                  )}
                  {product.specifications.display && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">الشاشة</span>
                      <span className="text-lg font-semibold text-gray-900">{product.specifications.display}</span>
                    </div>
                  )}
                  {product.specifications.graphics && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-amber-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">كرت الشاشة</span>
                      <span className="text-lg font-semibold text-gray-900">{product.specifications.graphics}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                  الوصف
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{product.descriptionArabic}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {!showOrderForm ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      🛒 اطلب الآن
                    </button>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="text-green-600 text-2xl mb-1">✓</div>
                        <div className="text-sm text-green-800 font-semibold">ضمان سنة</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-blue-600 text-2xl mb-1">🚚</div>
                        <div className="text-sm text-blue-800 font-semibold">توصيل مجاني</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="text-purple-600 text-2xl mb-1">💵</div>
                        <div className="text-sm text-purple-800 font-semibold">الدفع عند الاستلام</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">معلومات الزبون</h3>
                      <p className="text-gray-600">املأ البيانات التالية لإتمام طلبك</p>
                    </div>

                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                            اسمك بالكامل
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            required
                            value={orderForm.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>

                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={orderForm.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                            placeholder="مثال: 0612345678"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                          المدينة
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={orderForm.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                          placeholder="أدخل اسم المدينة"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                          العنوان التفصيلي
                        </label>
                        <textarea
                          id="address"
                          required
                          rows={4}
                          value={orderForm.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                          placeholder="أدخل عنوانك التفصيلي..."
                        />
                      </div>

                      <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                          id="marketingConsent"
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-1 h-5 w-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                          required
                        />
                        <label htmlFor="marketingConsent" className="text-gray-700">
                          أوافق على استقبال أحدث العروض والمنتجات عبر البريد الإلكتروني
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          اضغط هنا للطلب
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOrderForm(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
      </div>
    </PublicLayout>
  );
}