import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Template thumbnails in /public/templates are already small, pre-sized JPEGs, so they're served
  // as-is (no image-optimisation quota used on Vercel, and the site also works as static files).
  images: { unoptimized: true },
};

export default nextConfig;
