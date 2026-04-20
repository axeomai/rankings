import { NextRequest, NextResponse } from "next/server";
import { getRankings, getCountries, getRegions } from "@math/backend/src/lib/rankings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const areasParam = searchParams.get("areas");
  const areas = areasParam ? areasParam.split(",").filter(Boolean) : [];
  const country = searchParams.get("country") ?? undefined;
  const region = searchParams.get("region") ?? undefined;
  const yearFrom = parseInt(searchParams.get("yearFrom") ?? "1970", 10);
  const yearTo   = parseInt(searchParams.get("yearTo")   ?? "2025", 10);
  const minPapers = parseInt(searchParams.get("minPapers") ?? "1", 10);

  if (searchParams.get("meta") === "1") {
    return NextResponse.json({
      countries: getCountries(),
      regions: getRegions(),
    });
  }

  try {
    const rankings = getRankings({ areas, country, region, yearFrom, yearTo, minPapers });
    return NextResponse.json(rankings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to compute rankings" }, { status: 500 });
  }
}
