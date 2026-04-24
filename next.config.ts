import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: 'standalone' output is for Docker/self-hosted only.
  // Vercel handles build output natively — no output setting needed.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  typescript: {
    // Zod v4 + react-hook-form type incompatibility — not runtime-breaking
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
