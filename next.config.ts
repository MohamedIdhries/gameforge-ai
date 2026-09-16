import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude character-device files that Turbopack cannot read in this environment.
  // .mcp.json is a char device (not a regular file) in the CI sandbox.
  outputFileTracingExcludes: {
    '*': ['.mcp.json'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
