import "server-only";
import { query } from "./db";
import { FIRST_YEAR, latestYear } from "./disciplines";

/** Builds numbered placeholders ($1, $2, ...) alongside their values. */
class Params {
  values: (string | number)[] = [];
  add(value: string | number): string {
    this.values.push(value);
    return `$${this.values.length}`;
  }
  /** `AND <column> IN (...)` for a non-empty list, else nothing. */
  inList(column: string, list: string[] | undefined): string {
    if (!list || list.length === 0) return "";
    return `AND ${column} IN (${list.map((v) => this.add(v)).join(",")})`;
  }
}

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
    yearFrom = FIRST_YEAR,
    yearTo = latestYear(),
    minPapers = 1,
  } = q;

  const p = new Params();
  const $yearFrom = p.add(yearFrom);
  const $yearTo = p.add(yearTo);
  const areaFilter = p.inList("p.area", areas);
  const countryFilter = country ? `AND i.country = ${p.add(country)}` : "";
  const regionFilter = region ? `AND i.region = ${p.add(region)}` : "";
  const $minPapers = p.add(minPapers);

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
  `, p.values);

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
  const { areas, yearFrom = FIRST_YEAR, yearTo = latestYear() } = query_;

  // Both queries take the same parameters in the same order.
  const p = new Params();
  const $instId = p.add(instId);
  const $yearFrom = p.add(yearFrom);
  const $yearTo = p.add(yearTo);
  const areaFilter = p.inList("p.area", areas);

  const [facultyResult, areaResult] = await Promise.all([
    query(schema, `
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
    `, p.values),
    query(schema, `
      SELECT
        f.id        AS faculty_id,
        p.area,
        SUM(p.score) AS area_score
      FROM faculty f
      JOIN publications p ON p.faculty_id = f.id
      WHERE f.inst_id = ${$instId}
        AND p.year BETWEEN ${$yearFrom} AND ${$yearTo}
        ${areaFilter}
      GROUP BY f.id, p.area
    `, p.values),
  ]);

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
