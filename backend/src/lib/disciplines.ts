export interface Journal {
  openalexId: string;
  issn: string;
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

export interface Discipline {
  id: string;
  title: string;
  subtitle: string;
  schema: string;
  areaGroups: AreaGroup[];
}

const MATH_AREA_GROUPS: AreaGroup[] = [
  {
    id: "flagship",
    displayName: "Flagship Journals",
    areas: [
      {
        id: "flagship",
        displayName: "Top-tier (all fields)",
        journals: [
          { openalexId: "S45918994",  issn: "0003-486X", displayName: "Annals of Mathematics", url: "https://annals.math.princeton.edu/" },
          { openalexId: "S113542759", issn: "0001-5962", displayName: "Acta Mathematica", url: "https://acta.math.se/" },
          { openalexId: "S98347115",  issn: "0020-9910", displayName: "Inventiones Mathematicae", url: "https://www.springer.com/journal/222" },
          { openalexId: "S130224168", issn: "0894-0347", displayName: "Journal of the AMS", url: "https://www.ams.org/jams" },
          { openalexId: "S25010850",  issn: "0073-8301", displayName: "Publications Mathématiques de l'IHÉS", url: "https://link.springer.com/journal/10240" },
        ],
      },
    ],
  },
  {
    id: "algebra",
    displayName: "Algebra",
    areas: [
      {
        id: "algebra",
        displayName: "Algebra",
        journals: [
          { openalexId: "S66563395",  issn: "0010-437X", displayName: "Compositio Mathematica", url: "https://www.cambridge.org/core/journals/compositio-mathematica" },
          { openalexId: "S62223294",  issn: "0075-4102", displayName: "Crelle's Journal", url: "https://www.degruyter.com/journal/key/crll/html" },
          { openalexId: "S184147796", issn: "0021-8693", displayName: "Journal of Algebra", url: "https://www.sciencedirect.com/journal/journal-of-algebra" },
          { openalexId: "S167509673", issn: "1056-3911", displayName: "Journal of Algebraic Geometry", url: "https://www.ams.org/jag" },
        ],
      },
    ],
  },
  {
    id: "analysis",
    displayName: "Analysis",
    areas: [
      {
        id: "analysis",
        displayName: "Analysis",
        journals: [
          { openalexId: "S67718071",  issn: "0021-7670", displayName: "Journal d'Analyse Mathématique", url: "https://www.springer.com/journal/11854" },
          { openalexId: "S192217950", issn: "0025-5831", displayName: "Mathematische Annalen", url: "https://www.springer.com/journal/208" },
          { openalexId: "S16719760",  issn: "0213-2230", displayName: "Revista Matemática Iberoamericana", url: "https://ems.press/journals/rmi" },
          { openalexId: "S54953690",  issn: "0022-1236", displayName: "Journal of Functional Analysis", url: "https://www.sciencedirect.com/journal/journal-of-functional-analysis" },
        ],
      },
    ],
  },
  {
    id: "geometry",
    displayName: "Geometry & Topology",
    areas: [
      {
        id: "geometry",
        displayName: "Geometry & Topology",
        journals: [
          { openalexId: "S23326474",  issn: "0022-040X", displayName: "Journal of Differential Geometry", url: "https://projecteuclid.org/journals/journal-of-differential-geometry" },
          { openalexId: "S84214272",  issn: "1016-443X", displayName: "Geometric and Functional Analysis (GAFA)", url: "https://www.springer.com/journal/39" },
          { openalexId: "S50220091",  issn: "1364-0380", displayName: "Geometry & Topology", url: "https://msp.org/gt/" },
        ],
      },
    ],
  },
  {
    id: "number-theory",
    displayName: "Number Theory",
    areas: [
      {
        id: "number-theory",
        displayName: "Number Theory",
        journals: [
          { openalexId: "S171170845", issn: "0012-7094", displayName: "Duke Mathematical Journal", url: "https://projecteuclid.org/journals/duke-mathematical-journal" },
          { openalexId: "S184416969", issn: "1937-0652", displayName: "Algebra & Number Theory", url: "https://msp.org/ant/" },
          { openalexId: "S111381568", issn: "1073-7928", displayName: "International Mathematics Research Notices", url: "https://academic.oup.com/imrn" },
          { openalexId: "S40813394",  issn: "0022-314X", displayName: "Journal of Number Theory", url: "https://www.sciencedirect.com/journal/journal-of-number-theory" },
        ],
      },
    ],
  },
  {
    id: "probability",
    displayName: "Probability",
    areas: [
      {
        id: "probability",
        displayName: "Probability",
        journals: [
          { openalexId: "S40212770",  issn: "0091-1798", displayName: "Annals of Probability", url: "https://projecteuclid.org/journals/annals-of-probability" },
          { openalexId: "S105693234", issn: "0178-8051", displayName: "Probability Theory and Related Fields", url: "https://www.springer.com/journal/440" },
          { openalexId: "S9093621",   issn: "1050-5164", displayName: "Annals of Applied Probability", url: "https://projecteuclid.org/journals/annals-of-applied-probability" },
          { openalexId: "S181633058", issn: "1083-6489", displayName: "Electronic Journal of Probability", url: "https://projecteuclid.org/journals/electronic-journal-of-probability" },
        ],
      },
    ],
  },
  {
    id: "pde-applied",
    displayName: "PDE & Applied",
    areas: [
      {
        id: "pde",
        displayName: "PDE & Mathematical Physics",
        journals: [
          { openalexId: "S134818455", issn: "0010-3640", displayName: "Communications on Pure and Applied Mathematics", url: "https://onlinelibrary.wiley.com/journal/10970312" },
          { openalexId: "S136982523", issn: "0003-9527", displayName: "Archive for Rational Mechanics and Analysis", url: "https://www.springer.com/journal/205" },
          { openalexId: "S100601982", issn: "0010-3616", displayName: "Communications in Mathematical Physics", url: "https://www.springer.com/journal/220" },
          { openalexId: "S88235189",  issn: "1435-9855", displayName: "Journal of the European Mathematical Society", url: "https://ems.press/journals/jems" },
        ],
      },
    ],
  },
  {
    id: "combinatorics",
    displayName: "Combinatorics",
    areas: [
      {
        id: "combinatorics",
        displayName: "Combinatorics",
        journals: [
          { openalexId: "S72366220",   issn: "0209-9683", displayName: "Combinatorica", url: "https://www.springer.com/journal/493" },
          { openalexId: "S128556326",  issn: "0097-3165", displayName: "Journal of Combinatorial Theory, Series A", url: "https://www.sciencedirect.com/journal/journal-of-combinatorial-theory-series-a" },
          { openalexId: "S2939117604", issn: "0095-8956", displayName: "Journal of Combinatorial Theory, Series B", url: "https://www.sciencedirect.com/journal/journal-of-combinatorial-theory-series-b" },
          { openalexId: "S122441808",  issn: "0001-8708", displayName: "Advances in Mathematics", url: "https://www.sciencedirect.com/journal/advances-in-mathematics" },
        ],
      },
    ],
  },
];

const PHYSICS_AREA_GROUPS: AreaGroup[] = [
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
          { openalexId: "S4210190737", issn: "1550-7998", displayName: "Physical Review D (pre-2010)", url: "https://journals.aps.org/prd/" },
          { openalexId: "S4210210554", issn: "2470-0010", displayName: "Physical Review D", url: "https://journals.aps.org/prd/" },
          { openalexId: "S187585107",  issn: "1029-8479", displayName: "Journal of High Energy Physics", url: "https://www.springer.com/journal/13130" },
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
          { openalexId: "S4210174675", issn: "2469-9950", displayName: "Physical Review B", url: "https://journals.aps.org/prb/" },
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
        displayName: "Quantum Information",
        journals: [
          { openalexId: "S164566984",  issn: "2469-9926", displayName: "Physical Review A", url: "https://journals.aps.org/pra/" },
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
          { openalexId: "S158241587", issn: "0022-2488", displayName: "Journal of Mathematical Physics", url: "https://aip.scitation.org/journal/jmp" },
        ],
      },
    ],
  },
];

export const DISCIPLINES: Record<string, Discipline> = {
  math: {
    id: "math",
    title: "Mathematics",
    subtitle: "A metrics-based ranking of mathematics departments by author-fractional publication counts in selective journals. Inspired by CSRankings.",
    schema: "math",
    areaGroups: MATH_AREA_GROUPS,
  },
  physics: {
    id: "physics",
    title: "Physics",
    subtitle: "A metrics-based ranking of physics departments by author-fractional publication counts in selective journals. Inspired by CSRankings.",
    schema: "physics",
    areaGroups: PHYSICS_AREA_GROUPS,
  },
};

export const DEFAULT_DISCIPLINE = "math";

/** Flat helpers derived from area groups */
export function getAllAreaIds(discipline: Discipline): string[] {
  return discipline.areaGroups.flatMap((g) => g.areas.map((a) => a.id));
}

export function getAllJournals(discipline: Discipline): Journal[] {
  return discipline.areaGroups.flatMap((g) => g.areas.flatMap((a) => a.journals));
}
