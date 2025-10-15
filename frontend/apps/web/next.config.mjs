/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ['@rps/core', '@rps/solana-client']
};

export default nextConfig;

