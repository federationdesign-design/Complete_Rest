import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every WordPress URL ends in a slash; keep them identical.
  trailingSlash: true,
};

export default nextConfig;
