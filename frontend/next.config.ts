import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rankings/backend"],
  serverExternalPackages: ["pg"],
};

export default nextConfig;
