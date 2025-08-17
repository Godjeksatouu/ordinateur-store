'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Main } from '@/components/main';
import { PublicLayout } from '@/components/public-layout';
import { ProductCard } from '@/components/product-card';
import { fetchProducts, Product } from '@/lib/products';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const cats = await res.json();
        const cat = Array.isArray(cats) ? cats.find((c: any) => String(c.slug || c.id) === slug) : null;
        setCategory(cat || null);

        // No product-category relation yet; show all for now (or could filter by name contains)
        const prods = await fetchProducts();
        setProducts(prods);
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
          <div className="py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{category?.name || 'الفئة'}</h1>
            {loading ? (
              <div className="text-center py-16">جاري التحميل...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as any} showPrice />
                ))}
              </div>
            )}
          </div>
        </Main>
      </div>
    </PublicLayout>
  );
}

