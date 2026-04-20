import { getCountries } from "@math/backend/src/lib/rankings";
import RankingsClient from "../components/RankingsClient";

export default function HomePage() {
  let countries: string[] = [];
  try {
    countries = getCountries();
  } catch {
    // DB not yet seeded — start with empty list, client will still render
  }

  return <RankingsClient countries={countries} />;
}
