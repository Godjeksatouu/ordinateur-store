'use client';

import { AnimatePresence } from 'motion';

export function ShoppingCartList({ children }: { children: React.ReactNode }) {
  return (
    <ul role="list" className="-my-6 divide-y divide-gray-200">
      <AnimatePresence mode="popLayout" initial={false}>
        {children}
      </AnimatePresence>
    </ul>
  );
}
