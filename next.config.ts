import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: true,
    eslint: {
        dirs: ['pages', 'components', 'hooks', 'lib', 'app'], // Linting for these directories
    },

};

export default nextConfig;


