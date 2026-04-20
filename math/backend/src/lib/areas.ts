export interface Journal {
  openalexId: string;   // OpenAlex source id, e.g. "S45918994"
  issn: string;         // primary ISSN (print)
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
