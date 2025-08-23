/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ordinateurstore.ma',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'ordinateurstore.ma',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true, // For better compatibility with production deployments
  },
  // Enable strict mode for better error catching
  reactStrictMode: true,

  // Optimize bundling for production
  experimental: {
    optimizePackageImports: ['motion', '@heroicons/react'],
  },

  // Note: Removed experimental.ppr to fix searchParams._debugInfo hydration error
};

export default nextConfig;
