import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the Electron desktop shell spawn a self-contained server
  // (.next/standalone) as a child process instead of needing the full
  // node_modules tree or a separate `next start` invocation.
  output: "standalone",
};

export default nextConfig;
