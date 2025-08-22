import { API_BASE_URL } from './config';

// Cache for failed product requests to avoid repeated 404s
const failedProductCache = new Set<string>();
const productCache = new Map<string, Product>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface Product {
  id: string;
  name: string;
  ram: string;
  storage: string;
  screen?: string;
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
    // Check if this product ID has already failed recently
    if (failedProductCache.has(id)) {
      return undefined;
    }

    // Check cache first
    const cached = productCache.get(id);
    const cacheTime = cacheExpiry.get(id);
    if (cached && cacheTime && Date.now() < cacheTime) {
      return cached;
    }

    // Try to fetch from products first
    let product = await fetchFromEndpoint(`${API_BASE_URL}/api/products/${id}`, id);

    // If not found in products, try accessories
    if (!product) {
      product = await fetchFromEndpoint(`${API_BASE_URL}/api/accessoires/${id}`, id);
    }

    // If not found in either endpoint, cache the failure
    if (!product) {
      failedProductCache.add(id);
      // Remove from cache after 5 minutes in case product is added later
      setTimeout(() => failedProductCache.delete(id), CACHE_DURATION);
    }

    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
      }
    }

    // Re-throw the error so it can be handled by the calling component
    throw error;
  }
}

async function fetchFromEndpoint(url: string, id: string): Promise<Product | undefined> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        // Product not found at this endpoint
        return undefined;
      }
      console.error(`Failed to fetch from ${url}:`, response.status, response.statusText);
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const p = await response.json();

    // Check if the response contains an error (even with 200 status)
    if (p?.error) {
      return undefined;
    }

    if (!p || !p.id) {
      return undefined;
    }

    const product: Product = {
      ...p,
      old_price: p?.old_price != null ? Number(p.old_price) : 0,
      new_price: p?.new_price != null ? Number(p.new_price) : 0,
      images: Array.isArray(p?.images) ? p.images : [],
      main_images: Array.isArray(p?.main_images) ? p.main_images : undefined,
      optional_images: Array.isArray(p?.optional_images) ? p.optional_images : undefined,
    };

    // Cache the successful result
    productCache.set(id, product);
    cacheExpiry.set(id, Date.now() + CACHE_DURATION);

    return product;
  } catch (error) {
    // Don't log errors here, let the calling function handle them
    throw error;
  }
}

// Clear product cache (useful for admin operations)
export function clearProductCache(id?: string) {
  if (id) {
    productCache.delete(id);
    cacheExpiry.delete(id);
    failedProductCache.delete(id);
  } else {
    productCache.clear();
    cacheExpiry.clear();
    failedProductCache.clear();
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
