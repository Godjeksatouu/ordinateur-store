export interface Product {
  id: string;
  name: string;
  ram: string;
  storage: string;
  graphics: string;
  os: string;
  processor?: string;
  old_price: number;
  new_price: number;
  images: string[];
  main_images?: string[];
  optional_images?: string[];
  description?: string;
  promo_code?: string | null;
  promo_type?: 'percentage' | 'fixed' | null;
  created_at?: string;
  updated_at?: string;
}

// API functions to fetch products from backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    // Normalize numeric fields and arrays
    return (data || []).map((p: any) => ({
      ...p,
      old_price: p?.old_price != null ? Number(p.old_price) : 0,
      new_price: p?.new_price != null ? Number(p.new_price) : 0,
      images: Array.isArray(p?.images) ? p.images : [],
      main_images: Array.isArray(p?.main_images) ? p.main_images : undefined,
      optional_images: Array.isArray(p?.optional_images) ? p.optional_images : undefined,
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const p = await response.json();
    if (!p) return undefined;
    return {
      ...p,
      old_price: p?.old_price != null ? Number(p.old_price) : 0,
      new_price: p?.new_price != null ? Number(p.new_price) : 0,
      images: Array.isArray(p?.images) ? p.images : [],
      main_images: Array.isArray(p?.main_images) ? p.main_images : undefined,
      optional_images: Array.isArray(p?.optional_images) ? p.optional_images : undefined,
    } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
}

export function sortProductsByPrice(products: Product[], order: 'asc' | 'desc' = 'asc'): Product[] {
  return [...products].sort((a, b) => {
    return order === 'asc' ? a.new_price - b.new_price : b.new_price - a.new_price;
  });
}

export function searchProducts(products: Product[], query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    (product.description && product.description.toLowerCase().includes(lowercaseQuery))
  );
}
