'use server';

import { revalidatePath } from 'next/cache';
import { Cart, CartItem } from '@/components/utils/cart-types';

// Using local backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCart(): Promise<Cart> {
  // Return empty cart for now since we're using local backend
  return {
    items: [],
    total: 0
  };
}

export async function addToCart(item: CartItem) {
  // Cart functionality can be implemented with local storage or backend
  revalidatePath('/cart');
}

export async function removeFromCart(item: CartItem) {
  // Cart functionality can be implemented with local storage or backend
  revalidatePath('/cart');
}
