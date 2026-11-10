import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Hide the dev-only "N" badge: in either bottom corner it covered app UI
  // (the sidebar user menu, or the sticky Save button). Errors still show.
  devIndicators: false,
};

export default nextConfig;
