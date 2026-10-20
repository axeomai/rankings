import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountries } from "@/lib/rankings";
import { DISCIPLINES, isDisciplineId, latestYear } from "@/lib/disciplines";
import { parseFilters } from "@/lib/filters";
import RankingsClient from "@/components/RankingsClient";
import type { CountryInfo } from "@/components/CountryFilter";

type Params = Promise<{ discipline: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function paramSource(params: Record<string, string | string[] | undefined>) {
  return {
    get(name: string) {
      const v = params[name];
      return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
    },
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = (await params).discipline;
  if (!isDisciplineId(id)) return {};
  const discipline = DISCIPLINES[id];
  return {
    title: `${discipline.title} Rankings · STEM Rankings`,
    description: `${discipline.title} departments ranked by publications in selective venues.`,
  };
}

/** stemrankings.org/<mathematics | physics | computer-science>, with the filters in the query string. */
export default async function DisciplinePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const id = (await params).discipline;
  if (!isDisciplineId(id)) notFound();
  const discipline = DISCIPLINES[id];
  const latest = latestYear();

  let countries: CountryInfo[] = [];
  try {
    countries = await getCountries(discipline.schema);
  } catch {
    // The schema is not built yet; the filter still offers every known country.
  }

  return (
    <RankingsClient
      key={discipline.id}
      disciplineId={discipline.id}
      countries={countries}
      initialFilters={parseFilters(paramSource(await searchParams), discipline, latest)}
      latestYear={latest}
    />
  );
}
