'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * A component that prevents hydration mismatches by only rendering children on the client side
 * after the component has mounted. This is useful for components that might be affected by
 * browser extensions or other client-side modifications.
 */
export function HydrationSafe({ children, fallback = null, className }: HydrationSafeProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}

/**
 * Higher-order component that wraps a component to make it hydration-safe
 */
export function withHydrationSafe<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function HydrationSafeComponent(props: P) {
    return (
      <HydrationSafe fallback={fallback}>
        <Component {...props} />
      </HydrationSafe>
    );
  };
}
