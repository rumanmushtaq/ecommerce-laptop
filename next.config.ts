import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships modern ESM; let Next compile it alongside our code
  transpilePackages: ['three'],
  images: { unoptimized: true },
}

export default nextConfig
