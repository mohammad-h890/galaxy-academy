import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages
  output: isGitHubPages ? 'export' : undefined,
  // Use basePath only when building specifically for GitHub Pages
  basePath: isGitHubPages ? '/galaxy-academy' : '',
  trailingSlash: isGitHubPages ? true : false,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
