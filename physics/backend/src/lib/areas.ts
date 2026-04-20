export interface Journal {
  openalexId: string;   // OpenAlex source id, e.g. "S24807848"
  issn: string;         // primary ISSN
  displayName: string;
  url?: string;
}

export interface Area {
  id: string;
  displayName: string;
  journals: Journal[];
}

export interface AreaGroup {
  id: string;
  displayName: string;
  areas: Area[];
}

export const AREA_GROUPS: AreaGroup[] = [
  {
    id: "flagship",
    displayName: "Flagship Journals",
    areas: [
      {
        id: "flagship",
        displayName: "Top-tier (all fields)",
        journals: [
          { openalexId: "S24807848",  issn: "0031-9007", displayName: "Physical Review Letters", url: "https://journals.aps.org/prl/" },
          { openalexId: "S73260565",  issn: "0034-6861", displayName: "Reviews of Modern Physics", url: "https://journals.aps.org/rmp/" },
          { openalexId: "S156274416", issn: "1745-2473", displayName: "Nature Physics", url: "https://www.nature.com/nphys/" },
        ],
      },
    ],
  },
  {
    id: "hep",
    displayName: "High Energy Physics",
    areas: [
      {
        id: "hep",
        displayName: "High Energy Physics",
        journals: [
          { openalexId: "S4210190737", issn: "0556-2821", displayName: "Physical Review D (pre-2010)", url: "https://journals.aps.org/prd/" },
          { openalexId: "S4210210554", issn: "1550-7998", displayName: "Physical Review D", url: "https://journals.aps.org/prd/" },
          { openalexId: "S187585107",  issn: "1029-8479", displayName: "Journal of High Energy Physics", url: "https://link.springer.com/journal/13130" },
          { openalexId: "S4210194812", issn: "0550-3213", displayName: "Nuclear Physics B", url: "https://www.sciencedirect.com/journal/nuclear-physics-b" },
          { openalexId: "S173952182",  issn: "0370-2693", displayName: "Physics Letters B", url: "https://www.sciencedirect.com/journal/physics-letters-b" },
        ],
      },
    ],
  },
  {
    id: "condmat",
    displayName: "Condensed Matter",
    areas: [
      {
        id: "condmat",
        displayName: "Condensed Matter",
        journals: [
          { openalexId: "S4210174675", issn: "0163-1829", displayName: "Physical Review B", url: "https://journals.aps.org/prb/" },
          { openalexId: "S137042341",  issn: "2160-3308", displayName: "Physical Review X", url: "https://journals.aps.org/prx/" },
          { openalexId: "S4210240247", issn: "2643-1564", displayName: "Physical Review Research", url: "https://journals.aps.org/prresearch/" },
          { openalexId: "S4210221747", issn: "2397-4648", displayName: "npj Quantum Materials", url: "https://www.nature.com/npjquantmats/" },
        ],
      },
    ],
  },
  {
    id: "astrophysics",
    displayName: "Astrophysics & Cosmology",
    areas: [
      {
        id: "astrophysics",
        displayName: "Astrophysics & Cosmology",
        journals: [
          { openalexId: "S1980519",    issn: "0004-637X", displayName: "Astrophysical Journal", url: "https://iopscience.iop.org/journal/0004-637X" },
          { openalexId: "S195663288",  issn: "0035-8711", displayName: "Monthly Notices of the RAS", url: "https://academic.oup.com/mnras" },
          { openalexId: "S205231332",  issn: "0004-6361", displayName: "Astronomy & Astrophysics", url: "https://www.aanda.org/" },
          { openalexId: "S4210175824", issn: "2041-8205", displayName: "Astrophysical Journal Letters", url: "https://iopscience.iop.org/journal/2041-8205" },
        ],
      },
    ],
  },
  {
    id: "quantum",
    displayName: "Quantum Information",
    areas: [
      {
        id: "quantum",
        displayName: "Quantum Information & Computing",
        journals: [
          { openalexId: "S164566984",  issn: "1050-2947", displayName: "Physical Review A", url: "https://journals.aps.org/pra/" },
          { openalexId: "S4210226432", issn: "2521-327X", displayName: "Quantum", url: "https://quantum-journal.org/" },
          { openalexId: "S4210177720", issn: "2058-9565", displayName: "Quantum Science and Technology", url: "https://iopscience.iop.org/journal/2058-9565" },
          { openalexId: "S2738600312", issn: "2056-6387", displayName: "npj Quantum Information", url: "https://www.nature.com/npjqi/" },
        ],
      },
    ],
  },
  {
    id: "math-phys",
    displayName: "Mathematical Physics",
    areas: [
      {
        id: "math-phys",
        displayName: "Mathematical Physics",
        journals: [
          { openalexId: "S100601982", issn: "0010-3616", displayName: "Communications in Mathematical Physics", url: "https://www.springer.com/journal/220" },
          { openalexId: "S27783554",  issn: "1424-0637", displayName: "Annales Henri Poincaré", url: "https://www.springer.com/journal/23" },
          { openalexId: "S99746170",  issn: "0377-9017", displayName: "Letters in Mathematical Physics", url: "https://www.springer.com/journal/11005" },
          { openalexId: "S158241587", issn: "0022-2488", displayName: "Journal of Mathematical Physics", url: "https://pubs.aip.org/aip/jmp" },
        ],
      },
    ],
  },
];

// Flat map: openalex source id -> area id
export const JOURNAL_TO_AREA: Record<string, string> = {};
for (const group of AREA_GROUPS) {
  for (const area of group.areas) {
    for (const journal of area.journals) {
      JOURNAL_TO_AREA[journal.openalexId] = area.id;
    }
  }
}

export const ALL_JOURNALS: Journal[] = AREA_GROUPS.flatMap((g) =>
  g.areas.flatMap((a) => a.journals)
);

export const ALL_AREA_IDS = AREA_GROUPS.flatMap((g) => g.areas.map((a) => a.id));
