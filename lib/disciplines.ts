/**
 * A venue whose papers count toward an area. The ingest script finds its
 * OpenAlex source by `openalexId` when given, else by `issn`, else by an exact
 * match on `openalexName` (for conference proceedings without an ISSN), and
 * prints what it resolved so the ID can be pinned here.
 */
export interface Journal {
  openalexId?: string;
  issn?: string;
  /** Exact OpenAlex display name, for venues that have neither an ID nor an ISSN listed. */
  openalexName?: string;
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
  /** Also the discipline's path on the site: stemrankings.org/<id>. */
  id: string;
  title: string;
  subtitle: string;
  /** One line for the navigation menu and the home page. */
  description: string;
  schema: string;
  areaGroups: AreaGroup[];
}

const MATHEMATICS_AREA_GROUPS: AreaGroup[] = [
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

// Computer science publishes mostly in conferences. Where a conference's
// proceedings appear as a journal with an ISSN (NeurIPS, PVLDB, PACMPL, PACMMOD,
// PACMSE, PoPETs, TCHES, POMACS, PACMHCI) it is listed by ISSN; the flagship
// conferences without one are matched by their OpenAlex display name. None of
// these carry a pinned OpenAlex ID yet: run the ingest script with --resolve to
// print the IDs it finds, then pin them here.
const COMPUTER_SCIENCE_AREA_GROUPS: AreaGroup[] = [
  {
    id: "ai",
    displayName: "AI",
    areas: [
      {
        id: "ml",
        displayName: "Machine learning",
        journals: [
          { issn: "1049-5258", displayName: "Advances in Neural Information Processing Systems (NeurIPS)", url: "https://neurips.cc/" },
          { openalexName: "International Conference on Machine Learning", displayName: "International Conference on Machine Learning (ICML)", url: "https://icml.cc/" },
          { openalexName: "International Conference on Learning Representations", displayName: "International Conference on Learning Representations (ICLR)", url: "https://iclr.cc/" },
          { issn: "1532-4435", displayName: "Journal of Machine Learning Research", url: "https://www.jmlr.org/" },
          { issn: "2835-8856", displayName: "Transactions on Machine Learning Research", url: "https://jmlr.org/tmlr/" },
        ],
      },
      {
        id: "vision",
        displayName: "Computer vision",
        journals: [
          { openalexName: "Computer Vision and Pattern Recognition", displayName: "Computer Vision and Pattern Recognition (CVPR)", url: "https://cvpr.thecvf.com/" },
          { openalexName: "International Conference on Computer Vision", displayName: "International Conference on Computer Vision (ICCV)", url: "https://iccv.thecvf.com/" },
          { issn: "0162-8828", displayName: "IEEE Transactions on Pattern Analysis and Machine Intelligence", url: "https://www.computer.org/csdl/journal/tp" },
          { issn: "0920-5691", displayName: "International Journal of Computer Vision", url: "https://link.springer.com/journal/11263" },
        ],
      },
      {
        id: "nlp",
        displayName: "Natural language processing",
        journals: [
          { openalexName: "Annual Meeting of the Association for Computational Linguistics", displayName: "Annual Meeting of the ACL", url: "https://www.aclweb.org/" },
          { openalexName: "Empirical Methods in Natural Language Processing", displayName: "Empirical Methods in NLP (EMNLP)", url: "https://www.aclweb.org/" },
          { issn: "2307-387X", displayName: "Transactions of the ACL", url: "https://transacl.org/" },
          { issn: "0891-2017", displayName: "Computational Linguistics", url: "https://direct.mit.edu/coli" },
        ],
      },
      {
        id: "ai-general",
        displayName: "Artificial intelligence",
        journals: [
          { openalexName: "Proceedings of the AAAI Conference on Artificial Intelligence", displayName: "AAAI Conference on Artificial Intelligence", url: "https://aaai.org/" },
          { openalexName: "International Joint Conference on Artificial Intelligence", displayName: "International Joint Conference on AI (IJCAI)", url: "https://www.ijcai.org/" },
          { issn: "0004-3702", displayName: "Artificial Intelligence", url: "https://www.sciencedirect.com/journal/artificial-intelligence" },
          { issn: "1076-9757", displayName: "Journal of Artificial Intelligence Research", url: "https://www.jair.org/" },
        ],
      },
    ],
  },
  {
    id: "systems",
    displayName: "Systems",
    areas: [
      {
        id: "databases",
        displayName: "Databases",
        journals: [
          { issn: "2836-6573", displayName: "Proceedings of the ACM on Management of Data (SIGMOD)", url: "https://dl.acm.org/journal/pacmmod" },
          { issn: "2150-8097", displayName: "Proceedings of the VLDB Endowment", url: "https://www.vldb.org/pvldb/" },
          { issn: "0362-5915", displayName: "ACM Transactions on Database Systems", url: "https://dl.acm.org/journal/tods" },
          { issn: "1066-8888", displayName: "The VLDB Journal", url: "https://link.springer.com/journal/778" },
        ],
      },
      {
        id: "networking",
        displayName: "Networking & measurement",
        journals: [
          { issn: "1063-6692", displayName: "IEEE/ACM Transactions on Networking", url: "https://dl.acm.org/journal/ton" },
          { issn: "2476-1249", displayName: "Proceedings of the ACM on Measurement and Analysis of Computing Systems (SIGMETRICS)", url: "https://dl.acm.org/journal/pomacs" },
        ],
      },
      {
        id: "systems-os",
        displayName: "Operating systems & architecture",
        journals: [
          { issn: "0734-2071", displayName: "ACM Transactions on Computer Systems", url: "https://dl.acm.org/journal/tocs" },
          { issn: "1544-3566", displayName: "ACM Transactions on Architecture and Code Optimization", url: "https://dl.acm.org/journal/taco" },
          { issn: "0018-9340", displayName: "IEEE Transactions on Computers", url: "https://www.computer.org/csdl/journal/tc" },
        ],
      },
      {
        id: "security",
        displayName: "Security & cryptography",
        journals: [
          { openalexName: "IEEE Symposium on Security and Privacy", displayName: "IEEE Symposium on Security and Privacy", url: "https://www.ieee-security.org/" },
          { openalexName: "Computer and Communications Security", displayName: "ACM Conference on Computer and Communications Security (CCS)", url: "https://www.sigsac.org/ccs.html" },
          { issn: "2299-0984", displayName: "Proceedings on Privacy Enhancing Technologies", url: "https://petsymposium.org/" },
          { issn: "0933-2790", displayName: "Journal of Cryptology", url: "https://link.springer.com/journal/145" },
          { issn: "2569-2925", displayName: "IACR Transactions on Cryptographic Hardware and Embedded Systems", url: "https://tches.iacr.org/" },
          { issn: "1556-6013", displayName: "IEEE Transactions on Information Forensics and Security", url: "https://signalprocessingsociety.org/publications-resources/ieee-transactions-information-forensics-and-security" },
        ],
      },
      {
        id: "pl",
        displayName: "Programming languages",
        journals: [
          { issn: "2475-1421", displayName: "Proceedings of the ACM on Programming Languages (POPL, PLDI, OOPSLA, ICFP)", url: "https://dl.acm.org/journal/pacmpl" },
          { issn: "0164-0925", displayName: "ACM Transactions on Programming Languages and Systems", url: "https://dl.acm.org/journal/toplas" },
        ],
      },
      {
        id: "se",
        displayName: "Software engineering",
        journals: [
          { issn: "2994-970X", displayName: "Proceedings of the ACM on Software Engineering (FSE)", url: "https://dl.acm.org/journal/pacmse" },
          { openalexName: "International Conference on Software Engineering", displayName: "International Conference on Software Engineering (ICSE)", url: "https://www.icse-conferences.org/" },
          { issn: "0098-5589", displayName: "IEEE Transactions on Software Engineering", url: "https://www.computer.org/csdl/journal/ts" },
          { issn: "1049-331X", displayName: "ACM Transactions on Software Engineering and Methodology", url: "https://dl.acm.org/journal/tosem" },
        ],
      },
    ],
  },
  {
    id: "theory",
    displayName: "Theory",
    areas: [
      {
        id: "algorithms",
        displayName: "Algorithms & complexity",
        journals: [
          { openalexName: "Symposium on the Theory of Computing", displayName: "Symposium on Theory of Computing (STOC)", url: "https://acm-stoc.org/" },
          { openalexName: "Foundations of Computer Science", displayName: "Foundations of Computer Science (FOCS)", url: "https://focs.computer.org/" },
          { openalexName: "Symposium on Discrete Algorithms", displayName: "Symposium on Discrete Algorithms (SODA)", url: "https://www.siam.org/conferences-events/siam-conferences/soda" },
          { issn: "0004-5411", displayName: "Journal of the ACM", url: "https://dl.acm.org/journal/jacm" },
          { issn: "0097-5397", displayName: "SIAM Journal on Computing", url: "https://epubs.siam.org/journal/smjcat" },
          { issn: "1549-6325", displayName: "ACM Transactions on Algorithms", url: "https://dl.acm.org/journal/talg" },
          { issn: "1016-3328", displayName: "Computational Complexity", url: "https://link.springer.com/journal/37" },
        ],
      },
      {
        id: "info-theory",
        displayName: "Information theory",
        journals: [
          { issn: "0018-9448", displayName: "IEEE Transactions on Information Theory", url: "https://www.itsoc.org/publications/transactions" },
        ],
      },
    ],
  },
  {
    id: "interdisciplinary",
    displayName: "Interdisciplinary",
    areas: [
      {
        id: "graphics",
        displayName: "Graphics & visualization",
        journals: [
          { issn: "0730-0301", displayName: "ACM Transactions on Graphics (SIGGRAPH)", url: "https://dl.acm.org/journal/tog" },
          { issn: "1077-2626", displayName: "IEEE Transactions on Visualization and Computer Graphics", url: "https://www.computer.org/csdl/journal/tg" },
        ],
      },
      {
        id: "hci",
        displayName: "Human-computer interaction",
        journals: [
          { openalexName: "Human Factors in Computing Systems", displayName: "ACM CHI Conference on Human Factors in Computing Systems", url: "https://chi.acm.org/" },
          { issn: "2573-0142", displayName: "Proceedings of the ACM on Human-Computer Interaction (CSCW)", url: "https://dl.acm.org/journal/pacmhci" },
          { issn: "1073-0516", displayName: "ACM Transactions on Computer-Human Interaction", url: "https://dl.acm.org/journal/tochi" },
        ],
      },
      {
        id: "robotics",
        displayName: "Robotics",
        journals: [
          { issn: "1552-3098", displayName: "IEEE Transactions on Robotics", url: "https://www.ieee-ras.org/publications/t-ro" },
          { issn: "0278-3649", displayName: "International Journal of Robotics Research", url: "https://journals.sagepub.com/home/ijr" },
        ],
      },
    ],
  },
];

export const DISCIPLINES: Record<string, Discipline> = {
  mathematics: {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "A metrics-based ranking of mathematics departments by author-fractional publication counts in selective journals. Inspired by CSRankings.",
    description: "Algebra, analysis, geometry, number theory, probability, and more.",
    schema: "mathematics",
    areaGroups: MATHEMATICS_AREA_GROUPS,
  },
  physics: {
    id: "physics",
    title: "Physics",
    subtitle: "A metrics-based ranking of physics departments by author-fractional publication counts in selective journals. Inspired by CSRankings.",
    description: "High energy, condensed matter, astrophysics, quantum information, and more.",
    schema: "physics",
    areaGroups: PHYSICS_AREA_GROUPS,
  },
  "computer-science": {
    id: "computer-science",
    title: "Computer Science",
    subtitle: "A metrics-based ranking of computer science departments by author-fractional publication counts at selective conferences and journals. Inspired by CSRankings.",
    description: "AI, systems, theory, and interdisciplinary areas, conferences included.",
    schema: "computer_science",
    areaGroups: COMPUTER_SCIENCE_AREA_GROUPS,
  },
};

export const DEFAULT_DISCIPLINE = "mathematics";

/** Whether `id` names a discipline (an own key, so "constructor" and friends are not). */
export function isDisciplineId(id: string | null | undefined): id is string {
  return !!id && Object.prototype.hasOwnProperty.call(DISCIPLINES, id);
}

/** The earliest and latest publication years the rankings cover. */
export const FIRST_YEAR = 1970;
export function latestYear(): number {
  return new Date().getFullYear();
}

/** Flat helpers derived from area groups */
export function getAllAreaIds(discipline: Discipline): string[] {
  return discipline.areaGroups.flatMap((g) => g.areas.map((a) => a.id));
}

export function getAllJournals(discipline: Discipline): Journal[] {
  return discipline.areaGroups.flatMap((g) => g.areas.flatMap((a) => a.journals));
}
