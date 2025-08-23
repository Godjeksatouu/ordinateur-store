'use client';

import { getCart } from '@/lib/actions';
import { ShoppingCartList } from './shopping-cart-list';
import { EmptyShoppingCartItem, ShoppingCartItem } from './shopping-cart-item';

function ShoppingCartContent() {
  const { items } = getCart();
  return (
    <ShoppingCartList>
      {items.length === 0 ? (
        <EmptyShoppingCartItem />
      ) : (
        items.map((item) => (
          <ShoppingCartItem
            key={[item.id, item.color, item.size].join('/')}
            item={item}
          />
        ))
      )}
    </ShoppingCartList>
  );
}

export function ShoppingCart() {
  return (
    <section className="lg:col-span-7">
      <div className="mx-auto max-w-2xl px-0 lg:max-w-none">
        <h1 className="text-xl font-medium text-gray-900 mb-8">
          سلة التسوق
        </h1>

        <div className="border-t border-gray-200 pt-8">
          <div className="flow-root">
            <ShoppingCartContent />
          </div>
        </div>
      </div>
    </section>
  );
}
