/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@smart-guesthouse/db',
    '@smart-guesthouse/email',
    '@smart-guesthouse/stripe',
    '@smart-guesthouse/ui',
  ],
}

export default nextConfig
