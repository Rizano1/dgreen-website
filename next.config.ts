import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>/, so the Pages workflow sets
// PAGES_BASE_PATH=/dgreen-website. Local dev leaves it empty and runs at /.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // plain static files for GitHub Pages (written to /out)
  output: "export",
  trailingSlash: true,
  basePath,
  // files in /public are not prefixed automatically outside next/image, so expose it to the app
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
