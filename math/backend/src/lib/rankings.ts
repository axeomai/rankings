import { sqlite } from "../db";

export interface FacultyResult {
  id: number;
  name: string;
  openalexId: string;
  orcid: string | null;
  score: number;
  numPapers: number;
  areas: Record<string, number>;
}

export interface InstitutionResult {
  id: number;
  openalexId: string;
  displayName: string;
  country: string;
  region: string;
  score: number;
  numFaculty: number;
  faculty: FacultyResult[];
}

export interface RankingsQuery {
  areas?: string[];
  country?: string;
  region?: string;
  yearFrom?: number;
  yearTo?: number;
  minPapers?: number; // hide faculty with fewer publications (in selected window)
}

export function getRankings(query: RankingsQuery = {}): InstitutionResult[] {
  const {
    areas,
    country,
    region,
    yearFrom = 1970,
    yearTo = 2025,
    minPapers = 1,
  } = query;

  const areaFilter = areas && areas.length > 0
    ? `AND p.area IN (${areas.map(() => "?").join(",")})`
    : "";
  const areaParams = areas && areas.length > 0 ? areas : [];

  const countryFilter = country ? "AND i.country = ?" : "";
  const regionFilter  = region  ? "AND i.region = ?"  : "";
  const geoParams: string[] = [];
  if (country) geoParams.push(country);
  if (region)  geoParams.push(region);

  const facultyRows = sqlite.prepare(`
    SELECT
      f.id           AS faculty_id,
      f.name         AS faculty_name,
      f.openalex_id  AS faculty_oa,
      f.orcid,
      i.id           AS inst_id,
      i.openalex_id  AS inst_oa,
      i.display_name AS inst_display,
      i.country,
      i.region,
      COALESCE(SUM(p.score), 0)  AS score,
      COALESCE(COUNT(p.id), 0)   AS num_papers
    FROM faculty f
    JOIN institutions i ON f.inst_id = i.id
    LEFT JOIN publications p
      ON p.faculty_id = f.id
      AND p.year BETWEEN ? AND ?
      ${areaFilter}
    WHERE 1=1
      ${countryFilter}
      ${regionFilter}
    GROUP BY f.id
    HAVING num_papers >= ?
    ORDER BY score DESC
  `).all(yearFrom, yearTo, ...areaParams, ...geoParams, minPapers) as Array<{
    faculty_id: number;
    faculty_name: string;
    faculty_oa: string;
    orcid: string | null;
    inst_id: number;
    inst_oa: string;
    inst_display: string;
    country: string;
    region: string;
    score: number;
    num_papers: number;
  }>;

  const areaBreakdownRows = sqlite.prepare(`
    SELECT
      f.id        AS faculty_id,
      p.area,
      SUM(p.score) AS area_score
    FROM faculty f
    JOIN institutions i ON f.inst_id = i.id
    JOIN publications p ON p.faculty_id = f.id
    WHERE p.year BETWEEN ? AND ?
      ${areaFilter}
      ${countryFilter}
      ${regionFilter}
    GROUP BY f.id, p.area
  `).all(yearFrom, yearTo, ...areaParams, ...geoParams) as Array<{
    faculty_id: number;
    area: string;
    area_score: number;
  }>;

  const areaByFaculty: Record<number, Record<string, number>> = {};
  for (const row of areaBreakdownRows) {
    if (!areaByFaculty[row.faculty_id]) areaByFaculty[row.faculty_id] = {};
    areaByFaculty[row.faculty_id][row.area] = row.area_score;
  }

  const instMap = new Map<number, InstitutionResult>();
  for (const row of facultyRows) {
    if (!instMap.has(row.inst_id)) {
      instMap.set(row.inst_id, {
        id: row.inst_id,
        openalexId: row.inst_oa,
        displayName: row.inst_display,
        country: row.country,
        region: row.region,
        score: 0,
        numFaculty: 0,
        faculty: [],
      });
    }
    const inst = instMap.get(row.inst_id)!;
    if (row.score > 0) {
      inst.score += row.score;
      inst.numFaculty += 1;
    }
    inst.faculty.push({
      id: row.faculty_id,
      name: row.faculty_name,
      openalexId: row.faculty_oa,
      orcid: row.orcid,
      score: row.score,
      numPapers: row.num_papers,
      areas: areaByFaculty[row.faculty_id] ?? {},
    });
  }

  return Array.from(instMap.values())
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((inst) => ({
      ...inst,
      faculty: inst.faculty.sort((a, b) => b.score - a.score),
    }));
}

export function getCountries(): string[] {
  const rows = sqlite.prepare(
    `SELECT DISTINCT country FROM institutions ORDER BY country`
  ).all() as Array<{ country: string }>;
  return rows.map((r) => r.country);
}

export function getRegions(): string[] {
  const rows = sqlite.prepare(
    `SELECT DISTINCT region FROM institutions ORDER BY region`
  ).all() as Array<{ region: string }>;
  return rows.map((r) => r.region);
}
