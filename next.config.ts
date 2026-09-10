import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita sobrepor as ações inferiores no preview mobile durante desenvolvimento.
  devIndicators: false,
};

export default nextConfig;
