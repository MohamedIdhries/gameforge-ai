import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude character-device files that Turbopack cannot read in this environment.
  // .mcp.json is a char device (not a regular file) in the CI sandbox.
  outputFileTracingExcludes: {
    '*': ['.mcp.json'],
  },
};

export default nextConfig;
