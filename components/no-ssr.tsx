import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Higher-order component to disable SSR for specific components
export function withNoSSR<P extends object>(Component: ComponentType<P>) {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
  });
}
