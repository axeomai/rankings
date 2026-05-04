import { NextRequest, NextResponse } from "next/server";
import { getRankings, getCountries, getRegions, getFacultyForInstitution } from "@rankings/backend/src/lib/rankings";
import { DISCIPLINES, DEFAULT_DISCIPLINE } from "@rankings/backend/src/lib/disciplines";

export const dynamic = "force-dynamic";

function schemaFromRequest(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";
  const subdomain = host.split(":")[0].split(".")[0];
  const discipline = DISCIPLINES[subdomain] ?? DISCIPLINES[DEFAULT_DISCIPLINE];
  return discipline.schema;
}

export async function GET(req: NextRequest) {
  const schema = schemaFromRequest(req);
  const { searchParams } = req.nextUrl;

  const areasParam = searchParams.get("areas");
  const areas = areasParam ? areasParam.split(",").filter(Boolean) : [];
  const country = searchParams.get("country") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const yearFrom = parseInt(searchParams.get("yearFrom") ?? "1970", 10);
  const yearTo = parseInt(searchParams.get("yearTo") ?? "2025", 10);
  const minPapers = parseInt(searchParams.get("minPapers") ?? "1", 10);

  if (searchParams.get("meta") === "1") {
    return NextResponse.json({
      countries: await getCountries(schema),
      regions: await getRegions(schema),
    });
  }

  const facultyParam = searchParams.get("faculty");
  if (facultyParam) {
    try {
      const instId = parseInt(facultyParam, 10);
      const faculty = await getFacultyForInstitution(schema, instId, { areas, yearFrom, yearTo });
      return NextResponse.json(faculty);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
    }
  }

  try {
    const rankings = await getRankings(schema, { areas, country, region, yearFrom, yearTo, minPapers });
    return NextResponse.json(rankings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to compute rankings" }, { status: 500 });
  }
}
