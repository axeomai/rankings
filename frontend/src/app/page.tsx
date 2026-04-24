import { getCountries } from "@rankings/backend/src/lib/rankings";
import { getDiscipline } from "@/lib/discipline";
import RankingsClient from "@/components/RankingsClient";
import type { CountryInfo } from "@/components/CountryFilter";

export default async function HomePage() {
  const discipline = await getDiscipline();
  let countries: CountryInfo[] = [];
  try {
    countries = await getCountries(discipline.schema);
  } catch {
    // DB not yet seeded
  }

  return (
    <RankingsClient
      countries={countries}
      disciplineId={discipline.id}
      title={discipline.title}
      subtitle={discipline.subtitle}
    />
  );
}
