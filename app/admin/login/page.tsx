'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [productsCreds, setProductsCreds] = useState({ email: '', password: '' });
  const [ordersCreds, setOrdersCreds] = useState({ email: '', password: '' });
  const [superCreds, setSuperCreds] = useState({ email: '', password: '' });

  const [loading, setLoading] = useState<{[k:string]: boolean}>({ products: false, orders: false, super: false });
  const [error, setError] = useState<{[k:string]: string}>({ products: '', orders: '', super: '' });

  const router = useRouter();

  const loginForRole = async (
    creds: { email: string; password: string },
    expectedRole: 'product_manager' | 'gestion_commandes' | 'super_admin',
    key: 'products' | 'orders' | 'super'
  ) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: '' }));

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(prev => ({ ...prev, [key]: data.error || 'فشل في تسجيل الدخول' }));
        return;
      }

      // Ensure the logged-in account matches the expected role for this section
      if (data?.user?.role !== expectedRole) {
        setError(prev => ({ ...prev, [key]: 'هذا الحساب غير مطابق لهذا الدور' }));
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      router.push('/admin');
    } catch (err) {
      setError(prev => ({ ...prev, [key]: 'خطأ في الاتصال بالخادم' }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center" suppressHydrationWarning={true}>
      <div className="max-w-7xl w-full p-6 md:p-8" suppressHydrationWarning={true}>
        <div className="text-center mb-12" suppressHydrationWarning={true}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">تسجيل دخول الإدارة</h2>
          <p className="text-lg text-gray-600">اختر دورك وسجّل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-stretch" suppressHydrationWarning={true}>
          {/* Product Manager Login */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:border-blue-200" suppressHydrationWarning={true}>
            <div className="flex items-center mb-6" suppressHydrationWarning={true}>
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3" suppressHydrationWarning={true}></div>
              <h3 className="text-2xl font-bold text-gray-900">Product Manager</h3>
            </div>
            <div className="space-y-5 flex-1 flex flex-col" suppressHydrationWarning={true}>
              <div suppressHydrationWarning={true}>
                <label className="block text-base font-medium text-gray-700 mb-3">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={productsCreds.email}
                  onChange={(e) => setProductsCreds({ ...productsCreds, email: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
                  placeholder="products@example.com"
                />
              </div>
              <div suppressHydrationWarning={true}>
                <label className="block text-base font-medium text-gray-700 mb-3">كلمة المرور</label>
                <input
                  type="password"
                  value={productsCreds.password}
                  onChange={(e) => setProductsCreds({ ...productsCreds, password: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
                  placeholder="********"
                />
              </div>
              {error.products && <p className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">{error.products}</p>}
              <button
                onClick={() => loginForRole(productsCreds, 'product_manager', 'products')}
                disabled={loading.products}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
              >
                {loading.products ? 'جاري الدخول...' : 'تسجيل الدخول كـ Product Manager'}
              </button>
            </div>
          </div>

          {/* Gestion Commandes Login */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:border-green-200" suppressHydrationWarning={true}>
            <div className="flex items-center mb-6" suppressHydrationWarning={true}>
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3" suppressHydrationWarning={true}></div>
              <h3 className="text-2xl font-bold text-gray-900">Gestion Commandes</h3>
            </div>
            <div className="space-y-5 flex-1 flex flex-col" suppressHydrationWarning={true}>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={ordersCreds.email}
                  onChange={(e) => setOrdersCreds({ ...ordersCreds, email: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-base"
                  placeholder="orders@example.com"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">كلمة المرور</label>
                <input
                  type="password"
                  value={ordersCreds.password}
                  onChange={(e) => setOrdersCreds({ ...ordersCreds, password: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-base"
                  placeholder="********"
                />
              </div>
              {error.orders && <p className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">{error.orders}</p>}
              <button
                onClick={() => loginForRole(ordersCreds, 'gestion_commandes', 'orders')}
                disabled={loading.orders}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
              >
                {loading.orders ? 'جاري الدخول...' : 'تسجيل الدخول كـ Gestion Commandes'}
              </button>
            </div>
          </div>

          {/* Super Admin Login */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:border-amber-200" suppressHydrationWarning={true}>
            <div className="flex items-center mb-6" suppressHydrationWarning={true}>
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-3" suppressHydrationWarning={true}></div>
              <h3 className="text-2xl font-bold text-gray-900">Super Admin</h3>
            </div>
            <div className="space-y-5 flex-1 flex flex-col" suppressHydrationWarning={true}>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={superCreds.email}
                  onChange={(e) => setSuperCreds({ ...superCreds, email: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-base"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">كلمة المرور</label>
                <input
                  type="password"
                  value={superCreds.password}
                  onChange={(e) => setSuperCreds({ ...superCreds, password: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-base"
                  placeholder="********"
                />
              </div>
              {error.super && <p className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">{error.super}</p>}
              <button
                onClick={() => loginForRole(superCreds, 'super_admin', 'super')}
                disabled={loading.super}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
              >
                {loading.super ? 'جاري الدخول...' : 'تسجيل الدخول كـ Super Admin'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-12 p-6 bg-gray-50 rounded-xl" suppressHydrationWarning={true}>
          <p className="font-semibold text-gray-700 mb-3">بيانات الدخول الافتراضية:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" suppressHydrationWarning={true}>
            <div className="bg-white p-3 rounded-lg border border-blue-100" suppressHydrationWarning={true}>
              <p className="font-medium text-blue-600">Product Manager</p>
              <p>products@example.com</p>
              <p>products123</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100" suppressHydrationWarning={true}>
              <p className="font-medium text-green-600">Gestion Commandes</p>
              <p>orders@example.com</p>
              <p>orders123</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100" suppressHydrationWarning={true}>
              <p className="font-medium text-amber-600">Super Admin</p>
              <p>admin@example.com</p>
              <p>admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
