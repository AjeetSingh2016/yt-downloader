import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/download',
        destination: '/app/api/download/route.js'
      }
    ];
  }
    
};

export default nextConfig;
