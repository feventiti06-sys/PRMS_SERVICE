/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Server Actions are enabled by default in Next.js 14+
  },
}

module.exports = nextConfig