/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export", // Commented out to allow dynamic routes with locale
  images: {
    domains: ["localhost"],
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
