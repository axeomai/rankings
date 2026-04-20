import { getCountries } from "@physics/backend/src/lib/rankings";
import RankingsClient from "@/components/RankingsClient";

export default function HomePage() {
  let countries: string[] = [];
  try {
    countries = getCountries();
  } catch {
    // DB not yet seeded
  }
  return <RankingsClient countries={countries} />;
}
