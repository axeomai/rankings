// Prints the disciplines (areas and venues) and the country table as JSON, so
// the Python ingest script reads the same configuration the site renders.
// Usage: npx tsx scripts/export_config.ts
import { DISCIPLINES } from "../lib/disciplines";
import { COUNTRIES } from "../lib/countries";

const countries = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, { name: c.name, region: c.region }])
);

process.stdout.write(JSON.stringify({ disciplines: DISCIPLINES, countries }));
