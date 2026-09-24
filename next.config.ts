import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // Use basePath only when building specifically for GitHub Pages
  basePath: isGitHubPages ? '/galaxy-academy' : '',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
