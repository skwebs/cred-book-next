import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep the existing CSS and client bundle behaviour stable during migration.
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['pg', 'bcryptjs', 'busboy', '@aws-sdk/client-s3'],
};

export default nextConfig;
