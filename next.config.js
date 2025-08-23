/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // Commented out to allow dynamic routes with locale
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
    domains: ["localhost", "ordinateurstore.ma"], // Keep for backward compatibility
    unoptimized: true, // For better compatibility with production deployments
  },
  // Enable strict mode for better error catching
  reactStrictMode: true,

  // Optimize bundling for production
  experimental: {
    optimizePackageImports: ['motion', '@heroicons/react'],
  },

  typescript: {
    // ❌ WARNING: This will allow production builds to succeed even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ❌ This will ignore eslint errors during builds too
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
