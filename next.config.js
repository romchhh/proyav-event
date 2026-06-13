/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
    serverActions: {
      allowedOrigins: ['secure.wayforpay.com'],
    },
  },
}
module.exports = nextConfig
