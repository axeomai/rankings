import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@physics/backend"],
  serverExternalPackages: ["better-sqlite3"],
  env: {
    PHYSICS_DB_PATH: path.join(__dirname, "../backend/physicsrankings.db"),
  },
};

export default nextConfig;
