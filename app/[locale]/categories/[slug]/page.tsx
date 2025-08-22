'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { ProductCard } from '@/components/product-card';
import { fetchProducts, Product } from '@/lib/products';
import { useTranslations } from '@/hooks/use-translations';
import { API_BASE_URL } from '@/lib/config';

export default function LocalizedCategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const cats = await res.json();

        // Find category by slug (case-insensitive)
        let cat = null;
        if (Array.isArray(cats)) {
          cat = cats.find((c: any) =>
            String(c.slug || '').toLowerCase() === slug.toLowerCase() ||
            String(c.name || '').toLowerCase() === slug.toLowerCase()
          );
        }
        setCategory(cat || { name: slug.charAt(0).toUpperCase() + slug.slice(1) });

        // Fetch all products and filter by category
        const prods = await fetchProducts();
        let filteredProducts = prods;

        if (cat && cat.id) {
          // Filter products by category_id
          filteredProducts = prods.filter((product: Product) => product.category_id === cat.id);
        } else {
          // Fallback: filter by product name containing the category slug
          filteredProducts = prods.filter((product: Product) =>
            product.name.toLowerCase().includes(slug.toLowerCase())
          );
        }

        setProducts(filteredProducts);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Main>
          <div className="py-20">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {category?.name || t('category')}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded"></div>
            </div>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-600">{t('loadingProducts')}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600">{t('noProductsInCategory')}</p>
              </div>
            )}
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}
