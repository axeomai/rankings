import { NextRequest, NextResponse } from "next/server";
import { getRankings, getCountries, getRegions, getFacultyForInstitution } from "@/lib/rankings";
import { DISCIPLINES, FIRST_YEAR, getAllAreaIds, isDisciplineId, latestYear } from "@/lib/disciplines";

export const dynamic = "force-dynamic";

function intParam(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** GET /api/rankings/<mathematics | physics | computer-science>?areas=…&yearFrom=…&yearTo=… */
export async function GET(req: NextRequest, { params }: { params: Promise<{ discipline: string }> }) {
  const id = (await params).discipline;
  if (!isDisciplineId(id)) return NextResponse.json({ error: "Unknown discipline" }, { status: 404 });
  const discipline = DISCIPLINES[id];
  const schema = discipline.schema;
  const { searchParams } = req.nextUrl;

  // Unknown areas are dropped. With no `areas` parameter every area counts; an empty one means none do.
  const known = getAllAreaIds(discipline);
  const areasParam = searchParams.get("areas");
  const areas = areasParam === null ? known : areasParam.split(",").filter((a) => known.includes(a));
  const latest = latestYear();
  const yearFrom = intParam(searchParams.get("yearFrom"), FIRST_YEAR, FIRST_YEAR, latest);
  const yearTo = intParam(searchParams.get("yearTo"), latest, FIRST_YEAR, latest);
  const minPapers = intParam(searchParams.get("minPapers"), 1, 1, 10_000);
  const country = searchParams.get("country") || undefined;
  const region = searchParams.get("region") || undefined;

  try {
    if (searchParams.get("meta") === "1") {
      const [countries, regions] = await Promise.all([getCountries(schema), getRegions(schema)]);
      return NextResponse.json({ countries, regions });
    }

    if (areas.length === 0 || yearFrom > yearTo) return NextResponse.json([]);

    const facultyParam = searchParams.get("faculty");
    if (facultyParam !== null) {
      const instId = Number.parseInt(facultyParam, 10);
      if (!Number.isSafeInteger(instId) || instId < 1) {
        return NextResponse.json({ error: "Invalid institution" }, { status: 400 });
      }
      return NextResponse.json(await getFacultyForInstitution(schema, instId, { areas, yearFrom, yearTo }));
    }

    return NextResponse.json(await getRankings(schema, { areas, country, region, yearFrom, yearTo, minPapers }));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to compute rankings" }, { status: 500 });
  }
}
