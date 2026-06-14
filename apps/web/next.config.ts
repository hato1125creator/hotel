import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@smart-guesthouse/db',
    '@smart-guesthouse/email',
    '@smart-guesthouse/stripe',
    '@smart-guesthouse/ui',
  ],
}

export default nextConfig
