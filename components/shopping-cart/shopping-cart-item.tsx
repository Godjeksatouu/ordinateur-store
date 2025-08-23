'use client';
import { CartItem } from '@/components/utils/cart-types';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
// import { motion } from 'motion';
import { ShoppingCartRemoveButton } from './shopping-cart-remove-button';
import Link from 'next/link';
import { useCurrency } from '@/components/currency-context';

export function EmptyShoppingCartItem() {
  return (
    <li className="py-6 text-center text-gray-500">
      سلة التسوق فارغة.{' '}
      <Link href="/" className="text-blue-600 hover:text-blue-500">
        متابعة التسوق
      </Link>
    </li>
  );
}

export function ShoppingCartItem({ item }: { item: CartItem }) {
  const { format } = useCurrency();
  const standardPrice = 45000; // Standard laptop price in DH

  return (
    <li className="flex py-6">
      <div className="flex-shrink-0 size-24 overflow-hidden rounded-md border border-gray-200">
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>حاسوب محمول</h3>
            <p className="ml-4">{format(standardPrice)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {item.color}, {item.size}
          </p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500">الكمية {item.quantity}</p>
          <div className="flex">
            <ShoppingCartRemoveButton item={item} />
          </div>
        </div>
      </div>
    </li>
  );
}
