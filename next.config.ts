import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    '.space.z.ai',
    '.vercel.app',
    '.now.sh',
  ],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
