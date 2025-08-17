'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { getProductById, Product } from '@/lib/products';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';

interface OrderForm {
  fullName: string;
  phoneNumber: string;
  city: string;
  address: string;
  email?: string;
  paymentMethod?: 'Cashplus' | 'Virement bancaire' | '';
  codePromo?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const { t } = useTranslations();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct || null);
        setFinalPrice(fetchedProduct?.new_price || 0);
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
    address: '',
    email: '',
    paymentMethod: '',
    codePromo: ''
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [promoValidation, setPromoValidation] = useState<{
    isValid: boolean;
    message: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);

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

  if (orderSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-green-100">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 mb-2">تم إرسال طلبك بنجاح! سنتواصل معك قريباً.</h2>
            <p className="text-gray-600">شكراً لثقتك بنا</p>
          </div>
        </div>
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

    // If promo code field is changed, validate it
    if (field === 'codePromo') {
      if (value.trim() === '') {
        setPromoValidation(null);
        setFinalPrice(product?.new_price || 0);
      } else {
        validatePromoCode(value.trim());
      }
    }
  };

  const validatePromoCode = async (code: string) => {
    if (!code || !product) return;

    setIsValidatingPromo(true);
    try {
      const response = await fetch(`http://localhost:5000/api/promos/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          productId: product.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const discount = data.discount;
        const discountType = data.type;
        let discountAmount = 0;
        let newPrice = product.new_price;

        if (discountType === 'percentage') {
          discountAmount = (product.new_price * discount) / 100;
          newPrice = product.new_price - discountAmount;
        } else {
          discountAmount = discount;
          newPrice = Math.max(0, product.new_price - discount);
        }

        setPromoValidation({
          isValid: true,
          message: t('promoCodeValid', { amount: discountAmount.toLocaleString() }),
          discount: discount,
          discountType: discountType
        });
        setFinalPrice(newPrice);
      } else {
        setPromoValidation({
          isValid: false,
          message: data.message || t('promoCodeInvalid'),
          discount: 0,
          discountType: 'percentage'
        });
        setFinalPrice(product.new_price);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoValidation({
        isValid: false,
        message: t('promoCodeError'),
        discount: 0,
        discountType: 'percentage'
      });
      setFinalPrice(product.new_price);
    } finally {
      setIsValidatingPromo(false);
    }
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
          email: orderForm.email,
          paymentMethod: orderForm.paymentMethod,
          codePromo: orderForm.codePromo,
          productId: product.id,
          productName: product.name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderSuccess(true);
        setShowOrderForm(false);
        setOrderForm({
          fullName: '',
          phoneNumber: '',
          city: '',
          address: ''
        });
      } else {
        // show inline error later if needed
        console.error('Order submit failed');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
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
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                            activeIndex === i ? 'border-[#6188a4]' : 'border-transparent hover:border-[#adb8c1]'
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
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4">
                  {product.old_price && product.old_price > 0 && (
                    <div className="text-xl text-gray-500 line-through">
                      {product.old_price.toLocaleString()} دج
                    </div>
                  )}
                  {promoValidation?.isValid && finalPrice !== product.new_price ? (
                    <div className="flex flex-col">
                      <div className="text-lg text-gray-500 line-through">
                        {product.new_price.toLocaleString()} دج
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {finalPrice.toLocaleString()}
                        <span className="text-lg text-gray-500 mr-2">دج</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-[#6188a4]">
                      {finalPrice.toLocaleString()}
                      <span className="text-lg text-gray-500 mr-2">دج</span>
                    </div>
                  )}
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

                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full mr-3"></span>
                  الوصف
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
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
                            {t('fullName')}
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            required
                            value={orderForm.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white"
                            placeholder={t('fullName')}
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
                            className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white"
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
                          className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white"
                          placeholder="أدخل اسم المدينة"
                        />
                      </div>

                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white resize-none"
                              placeholder="أدخل عنوانك التفصيلي..."
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                              البريد الإلكتروني
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={orderForm.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white"
                              placeholder="example@email.com"
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <label htmlFor="codePromo" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('promoCodeOptional')}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="codePromo"
                              value={orderForm.codePromo}
                              onChange={(e) => handleInputChange('codePromo', e.target.value)}
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                                promoValidation?.isValid === true
                                  ? 'border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500'
                                  : promoValidation?.isValid === false
                                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                                  : 'border-[#adb8c1] bg-[#fdfefd] hover:bg-white focus:ring-[#6188a4] focus:border-[#6188a4]'
                              }`}
                              placeholder={t('promoCodePlaceholder')}
                              disabled={isValidatingPromo}
                            />
                            {isValidatingPromo && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6188a4]"></div>
                              </div>
                            )}
                          </div>
                          {promoValidation && (
                            <div className={`mt-2 text-sm ${promoValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {promoValidation.message}
                            </div>
                          )}
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            طرق الدفع
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${orderForm.paymentMethod === 'Cashplus' ? 'border-[#6188a4] bg-[#adb8c1]/20' : 'border-[#adb8c1] bg-[#fdfefd] hover:bg-white'}`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="Cashplus"
                                checked={orderForm.paymentMethod === 'Cashplus'}
                                onChange={() => handleInputChange('paymentMethod', 'Cashplus')}
                                className="mt-1 h-5 w-5 text-[#6188a4] border-[#adb8c1] focus:ring-[#6188a4]"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">Cashplus</div>
                                <div className="text-sm text-gray-600">RIB: 123 456 789 000 000 000 12</div>
                              </div>
                            </label>

                            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${orderForm.paymentMethod === 'Virement bancaire' ? 'border-[#6188a4] bg-[#adb8c1]/20' : 'border-[#adb8c1] bg-[#fdfefd] hover:bg-white'}`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="Virement bancaire"
                                checked={orderForm.paymentMethod === 'Virement bancaire'}
                                onChange={() => handleInputChange('paymentMethod', 'Virement bancaire')}
                                className="mt-1 h-5 w-5 text-[#6188a4] border-[#adb8c1] focus:ring-[#6188a4]"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">Virement bancaire</div>
                                <div className="text-sm text-gray-600">RIB: 987 654 321 000 000 000 34</div>
                                <div className="text-xs text-green-700 mt-1">خصم تلقائي: -100 درهم</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                          id="marketingConsent"
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-1 h-5 w-5 text-[#6188a4] border-[#adb8c1] rounded focus:ring-[#6188a4]"
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