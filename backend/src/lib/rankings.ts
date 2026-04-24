import { query } from "../db";

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
  countryCode: string | null;
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
  minPapers?: number;
}

export async function getRankings(schema: string, q: RankingsQuery = {}): Promise<InstitutionResult[]> {
  const {
    areas,
    country,
    region,
    yearFrom = 1970,
    yearTo = 2025,
    minPapers = 1,
  } = q;

  let paramIdx = 1;
  const params: (string | number)[] = [];

  const $yearFrom = `$${paramIdx++}`; params.push(yearFrom);
  const $yearTo   = `$${paramIdx++}`; params.push(yearTo);

  let areaFilter = "";
  if (areas && areas.length > 0) {
    const placeholders = areas.map((a) => {
      const p = `$${paramIdx++}`;
      params.push(a);
      return p;
    });
    areaFilter = `AND p.area IN (${placeholders.join(",")})`;
  }

  let countryFilter = "";
  if (country) {
    countryFilter = `AND i.country = $${paramIdx++}`;
    params.push(country);
  }

  let regionFilter = "";
  if (region) {
    regionFilter = `AND i.region = $${paramIdx++}`;
    params.push(region);
  }

  const $minPapers = `$${paramIdx++}`; params.push(minPapers);

  const facultyResult = await query(schema, `
    SELECT
      f.id           AS faculty_id,
      f.name         AS faculty_name,
      f.openalex_id  AS faculty_oa,
      f.orcid,
      i.id           AS inst_id,
      i.openalex_id  AS inst_oa,
      i.display_name AS inst_display,
      i.country_code AS country_code,
      i.country,
      i.region,
      COALESCE(SUM(p.score), 0)  AS score,
      COALESCE(COUNT(p.id), 0)   AS num_papers
    FROM faculty f
    JOIN institutions i ON f.inst_id = i.id
    LEFT JOIN publications p
      ON p.faculty_id = f.id
      AND p.year BETWEEN ${$yearFrom} AND ${$yearTo}
      ${areaFilter}
    WHERE 1=1
      ${countryFilter}
      ${regionFilter}
    GROUP BY f.id, f.name, f.openalex_id, f.orcid,
             i.id, i.openalex_id, i.display_name, i.country_code, i.country, i.region
    HAVING COALESCE(COUNT(p.id), 0) >= ${$minPapers}
    ORDER BY score DESC
  `, params);

  const facultyRows = facultyResult.rows as Array<{
    faculty_id: number;
    faculty_name: string;
    faculty_oa: string;
    orcid: string | null;
    inst_id: number;
    inst_oa: string;
    inst_display: string;
    country_code: string | null;
    country: string;
    region: string;
    score: number;
    num_papers: number;
  }>;

  // Area breakdown query
  let paramIdx2 = 1;
  const params2: (string | number)[] = [];

  const $yearFrom2 = `$${paramIdx2++}`; params2.push(yearFrom);
  const $yearTo2   = `$${paramIdx2++}`; params2.push(yearTo);

  let areaFilter2 = "";
  if (areas && areas.length > 0) {
    const placeholders = areas.map((a) => {
      const p = `$${paramIdx2++}`;
      params2.push(a);
      return p;
    });
    areaFilter2 = `AND p.area IN (${placeholders.join(",")})`;
  }

  let countryFilter2 = "";
  if (country) {
    countryFilter2 = `AND i.country = $${paramIdx2++}`;
    params2.push(country);
  }

  let regionFilter2 = "";
  if (region) {
    regionFilter2 = `AND i.region = $${paramIdx2++}`;
    params2.push(region);
  }

  const areaResult = await query(schema, `
    SELECT
      f.id        AS faculty_id,
      p.area,
      SUM(p.score) AS area_score
    FROM faculty f
    JOIN institutions i ON f.inst_id = i.id
    JOIN publications p ON p.faculty_id = f.id
    WHERE p.year BETWEEN ${$yearFrom2} AND ${$yearTo2}
      ${areaFilter2}
      ${countryFilter2}
      ${regionFilter2}
    GROUP BY f.id, p.area
  `, params2);

  const areaBreakdownRows = areaResult.rows as Array<{
    faculty_id: number;
    area: string;
    area_score: number;
  }>;

  const areaByFaculty: Record<number, Record<string, number>> = {};
  for (const row of areaBreakdownRows) {
    if (!areaByFaculty[row.faculty_id]) areaByFaculty[row.faculty_id] = {};
    areaByFaculty[row.faculty_id][row.area] = Number(row.area_score);
  }

  const instMap = new Map<number, InstitutionResult>();
  for (const row of facultyRows) {
    const score = Number(row.score);
    const numPapers = Number(row.num_papers);

    if (!instMap.has(row.inst_id)) {
      instMap.set(row.inst_id, {
        id: row.inst_id,
        openalexId: row.inst_oa,
        displayName: row.inst_display,
        countryCode: row.country_code,
        country: row.country,
        region: row.region,
        score: 0,
        numFaculty: 0,
        faculty: [],
      });
    }
    const inst = instMap.get(row.inst_id)!;
    if (score > 0) {
      inst.score += score;
      inst.numFaculty += 1;
    }
    inst.faculty.push({
      id: row.faculty_id,
      name: row.faculty_name,
      openalexId: row.faculty_oa,
      orcid: row.orcid,
      score,
      numPapers,
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

export interface CountryInfo {
  code: string | null;
  name: string;
}

export async function getCountries(schema: string): Promise<CountryInfo[]> {
  const result = await query(
    schema,
    `SELECT DISTINCT country_code, country FROM institutions WHERE country != 'Unknown' ORDER BY country`
  );
  return result.rows.map((r: { country_code: string | null; country: string }) => ({
    code: r.country_code,
    name: r.country,
  }));
}

export async function getRegions(schema: string): Promise<string[]> {
  const result = await query(
    schema,
    `SELECT DISTINCT region FROM institutions WHERE region != 'Other' ORDER BY region`
  );
  return result.rows.map((r: { region: string }) => r.region);
}
