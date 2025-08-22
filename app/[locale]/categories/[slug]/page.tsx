'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { ProductCard } from '@/components/product-card';
import { fetchProducts, Product } from '@/lib/products';
import { fetchAccessoires, Accessoire } from '@/lib/accessoires';
import { useTranslations } from '@/hooks/use-translations';
import { API_BASE_URL } from '@/lib/config';

export default function LocalizedCategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [accessoires, setAccessoires] = useState<Accessoire[]>([]);
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

        // Handle accessoires category specially
        if (slug.toLowerCase() === 'accessoires') {
          // Fetch accessoires instead of products
          const accs = await fetchAccessoires();
          setAccessoires(accs);
          setProducts([]); // Clear products
        } else {
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
          setAccessoires([]); // Clear accessoires
        }
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
      <div className="min-h-screen bg-gradient-to-br from-[#fdfefd] to-[#adb8c1]/20">
        <Main>
          <div className="py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#6188a4] to-[#262a2f] rounded-full mb-6">
                <span className="text-3xl text-white">📱</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#262a2f] mb-4">
                {category?.name || t('category')}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#6188a4] to-[#262a2f] mx-auto rounded-full"></div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[#adb8c1]/20 bg-white p-3 shadow-sm">
                    <div className="skeleton rounded-xl h-48 mb-4" />
                    <div className="space-y-2">
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-4 rounded w-1/2" />
                      <div className="skeleton h-6 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 || accessoires.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={`product-${product.id}`} product={product} />
                ))}
                {accessoires.map((accessoire) => (
                  <ProductCard key={`accessoire-${accessoire.id}`} product={accessoire as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#adb8c1]/20 rounded-full mb-4">
                  <span className="text-2xl text-[#adb8c1]">📦</span>
                </div>
                <p className="text-[#adb8c1] text-lg">{t('noProductsInCategory')}</p>
                <p className="text-[#adb8c1]/70 text-sm mt-2">{t('checkBackLater')}</p>
              </div>
            )}
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}
