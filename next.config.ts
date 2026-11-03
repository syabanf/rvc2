import type { NextConfig } from "next";

/* Static export: `out/` is the Capacitor webDir and the deployable PWA.
   trailingSlash emits /photos/index.html so every route works on any static host. */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
