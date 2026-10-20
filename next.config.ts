import type { NextConfig } from "next";

// The site used to live on one subdomain per discipline; these were their host names.
const LEGACY_SUBDOMAINS: Record<string, string> = {
  math: "mathematics",
  physics: "physics",
  cs: "computer-science",
};

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Old links on those subdomains land on the discipline's path instead.
  async redirects() {
    return Object.entries(LEGACY_SUBDOMAINS).map(([host, id]) => ({
      source: "/",
      has: [{ type: "host" as const, value: `${host}\\.(?<domain>.+)` }],
      destination: `https://:domain/${id}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
