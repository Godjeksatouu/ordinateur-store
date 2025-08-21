import { API_BASE_URL } from './config';

export interface Accessoire {
  id: string;
  name: string;
  old_price: number;
  new_price: number;
  description?: string;
  category_id?: number;
  images: string[];
  main_images?: string[];
  optional_images?: string[];
  created_at?: string;
  updated_at?: string;
}

// API functions to fetch accessoires from backend
export async function fetchAccessoires(): Promise<Accessoire[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessoires`);
    if (!response.ok) {
      throw new Error('Failed to fetch accessoires');
    }
    const data = await response.json();
    // Normalize numeric fields and arrays
    return (data || []).map((a: any) => ({
      ...a,
      old_price: a?.old_price != null ? Number(a.old_price) : 0,
      new_price: a?.new_price != null ? Number(a.new_price) : 0,
      images: Array.isArray(a?.images) ? a.images : [],
      main_images: Array.isArray(a?.main_images) ? a.main_images : undefined,
      optional_images: Array.isArray(a?.optional_images) ? a.optional_images : undefined,
    })) as Accessoire[];
  } catch (error) {
    console.error('Error fetching accessoires:', error);
    return [];
  }
}

export async function getAccessoireById(id: string): Promise<Accessoire | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accessoires/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch accessoire');
    }
    const a = await response.json();
    if (!a) return undefined;
    return {
      ...a,
      old_price: a?.old_price != null ? Number(a.old_price) : 0,
      new_price: a?.new_price != null ? Number(a.new_price) : 0,
      images: Array.isArray(a?.images) ? a.images : [],
      main_images: Array.isArray(a?.main_images) ? a.main_images : undefined,
      optional_images: Array.isArray(a?.optional_images) ? a.optional_images : undefined,
    } as Accessoire;
  } catch (error) {
    console.error('Error fetching accessoire:', error);
    return undefined;
  }
}

export function sortAccessoiresByPrice(accessoires: Accessoire[], order: 'asc' | 'desc' = 'asc'): Accessoire[] {
  return [...accessoires].sort((a, b) => {
    return order === 'asc' ? a.new_price - b.new_price : b.new_price - a.new_price;
  });
}

export function searchAccessoires(accessoires: Accessoire[], query: string): Accessoire[] {
  const lowercaseQuery = query.toLowerCase();
  return accessoires.filter(accessoire =>
    accessoire.name.toLowerCase().includes(lowercaseQuery) ||
    (accessoire.description && accessoire.description.toLowerCase().includes(lowercaseQuery))
  );
}
