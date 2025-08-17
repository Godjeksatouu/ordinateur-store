'use client';

import React, { useState, useEffect } from 'react';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { fetchProducts, Product } from '@/lib/products';
import ProductCardModern from '@/components/product-card-modern';
import Link from 'next/link';
import { useTranslations } from '@/hooks/use-translations';

export default function LaptopsPage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslations();

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
      <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <div className="bg-dark text-light py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-light">
            {t('laptops')}
          </h1>
          <p className="text-base md:text-lg text-light/80 max-w-3xl mx-auto leading-relaxed">
            {t('laptopsDescription')}
          </p>
          <div className="w-24 h-1 bg-primary/80 mx-auto mt-6 rounded"></div>
        </div>
      </div>

      <Main>
        <div className="py-20">
          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">{t('loadingProducts')}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
              <ProductCardModern key={product.id} product={product} showCTA />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('noProducts')}</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="bg-dark rounded-2xl p-12 text-light">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('notFoundWhat')}
              </h2>
              <p className="text-lg text-light/80 mb-8 max-w-2xl mx-auto">
                {t('contactUsHelp')}
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary text-light hover:brightness-95 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t('contactUsButton')}
              </Link>
            </div>
          </div>
        </div>
      </Main>
      </div>
    </PublicLayout>
  );
}
