'use client';

import React, { useState, useEffect } from 'react';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { fetchProducts, Product } from '@/lib/products';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export default function LaptopsPage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            حاسوب
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            اكتشف مجموعتنا الحصرية من أجهزة الكمبيوتر المحمولة عالية الأداء
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mt-8"></div>
        </div>
      </div>

      <Main>
        <div className="py-20">
          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <p className="mt-2 text-gray-600">جاري تحميل المنتجات...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={`http://localhost:5000${product.images[0]}`}
                      alt={product.name_ar}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBagIcon className="h-20 w-20 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Link
                        href={`/product/${product.id}`}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-center block hover:bg-gray-100 transition-colors duration-200"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>

                  {/* Fallback icon for failed images */}
                  {product.images && product.images.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ShoppingBagIcon className="h-12 w-12 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
                    {product.name_ar}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>الذاكرة:</span>
                      <span className="font-semibold">{product.ram}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>التخزين:</span>
                      <span className="font-semibold">{product.storage}</span>
                    </div>
                    {product.graphics && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>كرت الشاشة:</span>
                        <span className="font-semibold text-xs">{product.graphics}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {product.old_price && product.old_price > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        {product.old_price.toLocaleString()} دج
                      </div>
                    )}
                    <div className="text-2xl font-bold text-amber-600">
                      {product.new_price.toLocaleString()}
                      <span className="text-sm text-gray-500 mr-1">دج</span>
                    </div>
                    
                    <Link
                      href={`/product/${product.id}`}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      اطلب الآن
                    </Link>
                  </div>
                </div>

                {/* Premium Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    مميز
                  </div>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                لم تجد ما تبحث عنه؟
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                تواصل معنا وسنساعدك في العثور على الجهاز المثالي لاحتياجاتك
              </p>
              <Link
                href="/contact"
                className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </Main>
      </div>
    </PublicLayout>
  );
}
