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
  description_ar?: string;
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
    return await response.json();
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
    return await response.json();
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
    (product.description && product.description.toLowerCase().includes(lowercaseQuery)) ||
    (product.description_ar && product.description_ar.includes(query))
  );
}
