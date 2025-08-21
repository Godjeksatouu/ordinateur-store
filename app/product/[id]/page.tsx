'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { getProductById, Product } from '@/lib/products';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/use-translations';
import { API_BASE_URL } from '@/lib/config';
import { FacebookPixel } from '@/lib/facebook-pixel';

import { useCurrency } from '@/components/currency-context';
interface OrderForm {
  fullName: string;
  phoneNumber: string;
  city: string;
  address: string;
  email?: string;
  paymentMethod?: string;
  codePromo?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const { t, locale } = useTranslations();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
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
  const [promoDebounceTimer, setPromoDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const { format } = useCurrency();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct || null);
        setFinalPrice(fetchedProduct?.new_price || 0);

        // Track Facebook Pixel view content event
        if (fetchedProduct) {
          FacebookPixel.viewContent(fetchedProduct.new_price, currency, {
            content_ids: [fetchedProduct.id.toString()],
            content_name: fetchedProduct.name,
            content_type: 'product'
          });
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, currency]);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payment-methods`);
        const data = await response.json();
        setPaymentMethods(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        setPaymentMethods([]);
      }
    };

    loadPaymentMethods();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (promoDebounceTimer) {
        clearTimeout(promoDebounceTimer);
      }
    };
  }, [promoDebounceTimer]);

  if (loading) {
    return (
      <PublicLayout>
        <Main>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600">{t('loadingProduct')}</p>
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 mb-2">{t('orderSuccess')}</h2>
            <p className="text-gray-600">{t('thankYou')}</p>
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
            <p className="text-gray-500 text-lg">{t('productNotFound')}</p>
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

    // If promo code field is changed, validate it with debouncing
    if (field === 'codePromo') {
      // Clear existing timer
      if (promoDebounceTimer) {
        clearTimeout(promoDebounceTimer);
      }

      if (value.trim() === '') {
        setPromoValidation(null);
        calculateFinalPrice(product?.new_price || 0, 0, orderForm.paymentMethod);
        setPromoDebounceTimer(null);
      } else {
        // Set new timer for validation
        const timer = setTimeout(() => {
          validatePromoCode(value.trim());
        }, 500); // 500ms delay
        setPromoDebounceTimer(timer);
      }
    }

    // If payment method is changed, recalculate price
    if (field === 'paymentMethod') {
      const promoDiscount = promoValidation?.isValid ?
        (promoValidation.discountType === 'percentage' ?
          (product?.new_price || 0) * (promoValidation.discount / 100) :
          promoValidation.discount) : 0;
      calculateFinalPrice(product?.new_price || 0, promoDiscount, value);
    }
  };

  const calculateFinalPrice = (basePrice: number, promoDiscount: number, paymentMethod?: string) => {
    let finalPrice = basePrice - promoDiscount;

    // Apply payment method discount
    if (paymentMethod) {
      const selectedPaymentMethod = paymentMethods.find(pm => pm.name === paymentMethod);
      if (selectedPaymentMethod && selectedPaymentMethod.discount_amount > 0) {
        if (selectedPaymentMethod.discount_type === 'percentage') {
          finalPrice = Math.max(0, finalPrice - (finalPrice * selectedPaymentMethod.discount_amount / 100));
        } else {
          finalPrice = Math.max(0, finalPrice - selectedPaymentMethod.discount_amount);
        }
      }
    }

    setFinalPrice(finalPrice);
  };

  const validatePromoCode = async (code: string) => {
    if (!code || !product) return;

    setIsValidatingPromo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/promos/validate`, {
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

        if (discountType === 'percentage') {
          discountAmount = (product.new_price * discount) / 100;
        } else {
          discountAmount = discount;
        }

        setPromoValidation({
          isValid: true,
          message: t('promoCodeValid', { amount: discountAmount.toLocaleString() }),
          discount: discount,
          discountType: discountType
        });

        calculateFinalPrice(product.new_price, discountAmount, orderForm.paymentMethod);
      } else {
        setPromoValidation({
          isValid: false,
          message: data.message || t('promoCodeInvalid'),
          discount: 0,
          discountType: 'percentage'
        });
        calculateFinalPrice(product.new_price, 0, orderForm.paymentMethod);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoValidation({
        isValid: false,
        message: t('promoCodeError'),
        discount: 0,
        discountType: 'percentage'
      });
      calculateFinalPrice(product.new_price, 0, orderForm.paymentMethod);
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
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
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
          productName: product.name,
          language: locale,
          finalPrice: finalPrice,
          originalPrice: product.new_price,
          discount: promoValidation?.isValid ?
            (promoValidation.discountType === 'percentage' ?
              (product.new_price * promoValidation.discount / 100) :
              promoValidation.discount) : 0,
          quantity: 1,
          categoryId: null, // Will be implemented when categories are linked to products
          currency: currency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Track Facebook Pixel purchase event
        FacebookPixel.purchase(finalPrice, currency, {
          content_ids: [product.id.toString()],
          content_name: product.name,
          content_type: 'product',
          num_items: 1
        });

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
                        src={product.images && product.images.length > 0 ? `${API_BASE_URL}${product.images[activeIndex]}` : '/images/1.png'}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        unoptimized
                      />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-[#6188a4] to-[#262a2f] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {t('newBadge')}
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
                            src={`${API_BASE_URL}${src}`}
                            alt={`صورة ${i + 1}`}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 20vw, 10vw"
                            unoptimized
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
                      {mounted ? format(product.old_price) : `${product.old_price.toLocaleString()} DH`}
                    </div>
                  )}
                  {promoValidation?.isValid && finalPrice !== product.new_price ? (
                    <div className="flex flex-col">
                      <div className="text-lg text-gray-500 line-through">
                        {mounted ? format(product.new_price) : `${product.new_price.toLocaleString()} DH`}
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {mounted ? format(finalPrice) : `${finalPrice.toLocaleString()} DH`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-[#6188a4]">
                      {mounted ? format(finalPrice) : `${finalPrice.toLocaleString()} DH`}
                    </div>
                  )}
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {t('available')}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 rounded-full mr-3" style={{background: 'linear-gradient(to bottom, #3a4956, #3a4956)'}}></span>
                  {t('technicalSpecs')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.ram && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">{t('ram')}</span>
                      <span className="text-lg font-semibold text-gray-900">{product.ram}</span>
                    </div>
                  )}
                  {product.storage && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">{t('storage')}</span>
                      <span className="text-lg font-semibold text-gray-900">{product.storage}</span>
                    </div>
                  )}
                  {product.screen && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">{t('screen')}</span>
                      <span className="text-lg font-semibold text-gray-900">{product.screen}</span>
                    </div>
                  )}
                  {product.processor && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">{t('graphics')}</span>
                      <span className="text-lg font-semibold text-gray-900">{product.processor}</span>
                    </div>
                  )}
                  {product.os && (
                    <div className="bg-gray-50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-300">
                      <span className="text-sm text-gray-600 block">{t('os')}</span>
                      <span className="text-lg font-semibold text-gray-900">{product.os}</span>
                    </div>
                  )}

                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 rounded-full mr-3" style={{background: 'linear-gradient(to bottom, #3a4956, #3a4956)'}}></span>
                  {t('description')}
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{product.description || t('noDescription')}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {!showOrderForm ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="w-full text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{background: 'linear-gradient(to right, #3a4956, #2a3440)'}}
                    >
                      🛒 {t('orderNowBtn')}
                    </button>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="text-green-600 text-2xl mb-1">✓</div>
                        <div className="text-sm text-green-800 font-semibold">{t('oneYearWarranty')}</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-blue-600 text-2xl mb-1">🚚</div>
                        <div className="text-sm text-blue-800 font-semibold">{t('freeDelivery')}</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="text-purple-600 text-2xl mb-1">💵</div>
                        <div className="text-sm text-purple-800 font-semibold">{t('cashOnDeliveryShort')}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('customerInfo')}</h3>
                      <p className="text-gray-600">{t('fillDetails')}</p>
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
                            {t('phoneNumber')}
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
                            placeholder={t('phoneExample')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('city')}
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={orderForm.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white"
                          placeholder={t('cityPlaceholder')}
                        />
                      </div>

                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                              {t('detailedAddress')}
                            </label>
                            <textarea
                              id="address"
                              required
                              rows={4}
                              value={orderForm.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-[#adb8c1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6188a4] focus:border-[#6188a4] transition-all duration-300 bg-[#fdfefd] hover:bg-white resize-none"
                              placeholder={t('addressPlaceholder')}
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                              {t('email')}
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
                            {t('paymentMethods')}
                          </label>
                          <div className={`grid grid-cols-1 md:grid-cols-2 ${paymentMethods.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                            {paymentMethods.map((pm) => (
                              <label key={pm.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${orderForm.paymentMethod === pm.name ? 'border-[#6188a4] bg-[#adb8c1]/20' : 'border-[#adb8c1] bg-[#fdfefd] hover:bg-white'}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={pm.name}
                                  checked={orderForm.paymentMethod === pm.name}
                                  onChange={() => handleInputChange('paymentMethod', pm.name)}
                                  className="mt-1 h-5 w-5 text-[#6188a4] border-[#adb8c1] focus:ring-[#6188a4]"
                                />
                                <div>
                                  <div className="font-semibold text-gray-900">{pm.name_ar || pm.name}</div>
                                  <div className="text-sm text-gray-600">{pm.description_ar || pm.description}</div>
                                  {pm.discount_amount > 0 && (
                                    <div className="text-xs text-green-700 mt-1">
                                      {t('automaticDiscount')}: -{pm.discount_amount}{pm.discount_type === 'percentage' ? '%' : ' درهم'}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            id="marketingConsent"
                            type="checkbox"
                            checked={marketingConsent}
                            onChange={(e) => setMarketingConsent(e.target.checked)}
                            className="mt-1 h-5 w-5 text-[#6188a4] border-[#adb8c1] rounded focus:ring-[#6188a4]"
                            required
                          />
                          <label htmlFor="marketingConsent" className="text-gray-700">
                            {t('marketingConsent')}
                          </label>
                        </div>

                        {/* Dynamic Price Display */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-2">{t('priceDetails')}</div>
                          <div className="space-y-2">
                            {/* Original Price */}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{t('originalPrice')}:</span>
                              <span className="text-sm font-medium">
                                {mounted ? format(product.new_price) : `${product.new_price.toLocaleString()} DH`}
                              </span>
                            </div>

                            {/* Promo Code Discount */}
                            {promoValidation?.isValid && (
                              <div className="flex justify-between items-center text-green-600">
                                <span className="text-sm">خصم كود التخفيض:</span>
                                <span className="text-sm font-medium">
                                  -{mounted ? format(promoValidation.discountType === 'percentage' ?
                                    (product.new_price * promoValidation.discount / 100) :
                                    promoValidation.discount) : `${(promoValidation.discountType === 'percentage' ?
                                    (product.new_price * promoValidation.discount / 100) :
                                    promoValidation.discount).toLocaleString()} DH`}
                                </span>
                              </div>
                            )}

                            {/* Payment Method Discount */}
                            {orderForm.paymentMethod && (() => {
                              const selectedPaymentMethod = paymentMethods.find(pm => pm.name === orderForm.paymentMethod);
                              if (selectedPaymentMethod && selectedPaymentMethod.discount_amount > 0) {
                                return (
                                  <div className="flex justify-between items-center text-green-600">
                                    <span className="text-sm">خصم {selectedPaymentMethod.name_ar || selectedPaymentMethod.name}:</span>
                                    <span className="text-sm font-medium">
                                      -{selectedPaymentMethod.discount_type === 'percentage' ? `${selectedPaymentMethod.discount_amount}%` : (mounted ? format(selectedPaymentMethod.discount_amount) : `${selectedPaymentMethod.discount_amount.toLocaleString()} DH`)}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Divider */}
                            {(promoValidation?.isValid || (orderForm.paymentMethod && paymentMethods.find(pm => pm.name === orderForm.paymentMethod)?.discount_amount > 0)) && (
                              <hr className="border-gray-200" />
                            )}

                            {/* Final Price */}
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-gray-900">{t('finalTotal')}:</span>
                              <span className="text-xl font-bold text-[#6188a4]">
                                {mounted ? format(finalPrice) : `${finalPrice.toLocaleString()} DH`}
                              </span>
                            </div>

                            {/* Savings Summary */}
                            {finalPrice !== product.new_price && (
                              <div className="text-sm text-green-700 font-medium bg-green-50 p-2 rounded">
                                وفرت: {(product.new_price - finalPrice).toLocaleString()} {t('currency')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          {t('orderButton')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOrderForm(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={productId} />
      </Main>
      </div>
    </PublicLayout>
  );
}

// Reviews Component
function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews?product_id=${productId}`);
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">جاري تحميل المراجعات...</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ آراء العملاء</h2>
          <p className="text-gray-600">لا توجد مراجعات لهذا المنتج بعد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">⭐ آراء العملاء</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <span className="text-lg font-semibold text-gray-700">
              {averageRating.toFixed(1)} من 5
            </span>
            <span className="text-gray-500">({reviews.length} مراجعة)</span>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{review.name || 'عميل'}</span>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
              )}

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {review.photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={`${API_BASE_URL}${photo}`}
                      alt={`Review photo ${index + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}