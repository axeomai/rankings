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

export interface InstitutionSummary {
  id: number;
  openalexId: string;
  displayName: string;
  countryCode: string | null;
  country: string;
  region: string;
  score: number;
  numFaculty: number;
}

export interface RankingsQuery {
  areas?: string[];
  country?: string;
  region?: string;
  yearFrom?: number;
  yearTo?: number;
  minPapers?: number;
}

export async function getRankings(schema: string, q: RankingsQuery = {}): Promise<InstitutionSummary[]> {
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

  // Aggregate directly at institution level
  const instResult = await query(schema, `
    SELECT
      i.id           AS inst_id,
      i.openalex_id  AS inst_oa,
      i.display_name AS inst_display,
      i.country_code AS country_code,
      i.country,
      i.region,
      COALESCE(SUM(fs.score), 0) AS score,
      COUNT(*)                   AS num_faculty
    FROM (
      SELECT
        f.id AS faculty_id,
        f.inst_id,
        COALESCE(SUM(p.score), 0) AS score,
        COALESCE(COUNT(p.id), 0)  AS num_papers
      FROM faculty f
      LEFT JOIN publications p
        ON p.faculty_id = f.id
        AND p.year BETWEEN ${$yearFrom} AND ${$yearTo}
        ${areaFilter}
      GROUP BY f.id, f.inst_id
      HAVING COALESCE(COUNT(p.id), 0) >= ${$minPapers}
    ) fs
    JOIN institutions i ON fs.inst_id = i.id
    WHERE fs.score > 0
      ${countryFilter}
      ${regionFilter}
    GROUP BY i.id, i.openalex_id, i.display_name, i.country_code, i.country, i.region
    HAVING COALESCE(SUM(fs.score), 0) > 0
    ORDER BY score DESC
  `, params);

  return instResult.rows.map((row: {
    inst_id: number;
    inst_oa: string;
    inst_display: string;
    country_code: string | null;
    country: string;
    region: string;
    score: number;
    num_faculty: number;
  }) => ({
    id: row.inst_id,
    openalexId: row.inst_oa,
    displayName: row.inst_display,
    countryCode: row.country_code,
    country: row.country,
    region: row.region,
    score: Number(row.score),
    numFaculty: Number(row.num_faculty),
  }));
}

export async function getFacultyForInstitution(
  schema: string,
  instId: number,
  query_: { areas?: string[]; yearFrom?: number; yearTo?: number }
): Promise<FacultyResult[]> {
  const { areas, yearFrom = 1970, yearTo = 2025 } = query_;

  let paramIdx = 1;
  const params: (string | number)[] = [];

  const $instId   = `$${paramIdx++}`; params.push(instId);
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

  // Faculty scores
  const facultyResult = await query(schema, `
    SELECT
      f.id           AS faculty_id,
      f.name         AS faculty_name,
      f.openalex_id  AS faculty_oa,
      f.orcid,
      COALESCE(SUM(p.score), 0)  AS score,
      COALESCE(COUNT(p.id), 0)   AS num_papers
    FROM faculty f
    LEFT JOIN publications p
      ON p.faculty_id = f.id
      AND p.year BETWEEN ${$yearFrom} AND ${$yearTo}
      ${areaFilter}
    WHERE f.inst_id = ${$instId}
    GROUP BY f.id, f.name, f.openalex_id, f.orcid
    HAVING COALESCE(SUM(p.score), 0) > 0
    ORDER BY score DESC
  `, params);

  // Area breakdown
  let paramIdx2 = 1;
  const params2: (string | number)[] = [];

  const $instId2   = `$${paramIdx2++}`; params2.push(instId);
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

  const areaResult = await query(schema, `
    SELECT
      f.id        AS faculty_id,
      p.area,
      SUM(p.score) AS area_score
    FROM faculty f
    JOIN publications p ON p.faculty_id = f.id
    WHERE f.inst_id = ${$instId2}
      AND p.year BETWEEN ${$yearFrom2} AND ${$yearTo2}
      ${areaFilter2}
    GROUP BY f.id, p.area
  `, params2);

  const areaByFaculty: Record<number, Record<string, number>> = {};
  for (const row of areaResult.rows as Array<{ faculty_id: number; area: string; area_score: number }>) {
    if (!areaByFaculty[row.faculty_id]) areaByFaculty[row.faculty_id] = {};
    areaByFaculty[row.faculty_id][row.area] = Number(row.area_score);
  }

  return facultyResult.rows.map((row: {
    faculty_id: number;
    faculty_name: string;
    faculty_oa: string;
    orcid: string | null;
    score: number;
    num_papers: number;
  }) => ({
    id: row.faculty_id,
    name: row.faculty_name,
    openalexId: row.faculty_oa,
    orcid: row.orcid,
    score: Number(row.score),
    numPapers: Number(row.num_papers),
    areas: areaByFaculty[row.faculty_id] ?? {},
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
