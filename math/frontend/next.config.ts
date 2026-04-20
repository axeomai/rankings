import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@math/backend"],
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
