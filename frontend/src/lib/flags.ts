// Complete ISO 3166-1 alpha-2 country table.
//
// Source of truth: a single `COUNTRIES` array. From it we derive:
//   - CODE_TO_NAME : ISO code (uppercase) -> canonical display name
//   - NAME_TO_CODE : display name & common aliases (case-insensitive) -> code
//
// Includes user-assigned codes that are widely supported in practice
// (e.g. "XK" for Kosovo).

interface CountryEntry {
  /** ISO 3166-1 alpha-2 code, uppercase. */
  code: string;
  /** Canonical English display name. */
  name: string;
  /** Common alternative spellings/aliases that should resolve to this code. */
  aliases?: string[];
}

const COUNTRIES: CountryEntry[] = [
  { code: "AD", name: "Andorra" },
  { code: "AE", name: "United Arab Emirates", aliases: ["UAE"] },
  { code: "AF", name: "Afghanistan" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AI", name: "Anguilla" },
  { code: "AL", name: "Albania" },
  { code: "AM", name: "Armenia" },
  { code: "AO", name: "Angola" },
  { code: "AQ", name: "Antarctica" },
  { code: "AR", name: "Argentina" },
  { code: "AS", name: "American Samoa" },
  { code: "AT", name: "Austria" },
  { code: "AU", name: "Australia" },
  { code: "AW", name: "Aruba" },
  { code: "AX", name: "Åland Islands", aliases: ["Aland Islands"] },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BA", name: "Bosnia and Herzegovina", aliases: ["Bosnia"] },
  { code: "BB", name: "Barbados" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BG", name: "Bulgaria" },
  { code: "BH", name: "Bahrain" },
  { code: "BI", name: "Burundi" },
  { code: "BJ", name: "Benin" },
  { code: "BL", name: "Saint Barthélemy", aliases: ["Saint Barthelemy"] },
  { code: "BM", name: "Bermuda" },
  { code: "BN", name: "Brunei", aliases: ["Brunei Darussalam"] },
  { code: "BO", name: "Bolivia" },
  { code: "BQ", name: "Caribbean Netherlands", aliases: ["Bonaire"] },
  { code: "BR", name: "Brazil" },
  { code: "BS", name: "Bahamas" },
  { code: "BT", name: "Bhutan" },
  { code: "BV", name: "Bouvet Island" },
  { code: "BW", name: "Botswana" },
  { code: "BY", name: "Belarus" },
  { code: "BZ", name: "Belize" },
  { code: "CA", name: "Canada" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  {
    code: "CD",
    name: "DR Congo",
    aliases: [
      "Democratic Republic of the Congo",
      "Congo (Kinshasa)",
      "Congo, Democratic Republic of the",
    ],
  },
  { code: "CF", name: "Central African Republic" },
  {
    code: "CG",
    name: "Republic of the Congo",
    aliases: ["Congo", "Congo (Brazzaville)", "Congo-Brazzaville"],
  },
  { code: "CH", name: "Switzerland" },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    aliases: ["Cote d'Ivoire", "Ivory Coast"],
  },
  { code: "CK", name: "Cook Islands" },
  { code: "CL", name: "Chile" },
  { code: "CM", name: "Cameroon" },
  {
    code: "CN",
    name: "China",
    aliases: ["People's Republic of China", "PRC", "Mainland China"],
  },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "CU", name: "Cuba" },
  { code: "CV", name: "Cabo Verde", aliases: ["Cape Verde"] },
  { code: "CW", name: "Curaçao", aliases: ["Curacao"] },
  { code: "CX", name: "Christmas Island" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia", aliases: ["Czech Republic"] },
  { code: "DE", name: "Germany" },
  { code: "DJ", name: "Djibouti" },
  { code: "DK", name: "Denmark" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "DZ", name: "Algeria" },
  { code: "EC", name: "Ecuador" },
  { code: "EE", name: "Estonia" },
  { code: "EG", name: "Egypt" },
  { code: "EH", name: "Western Sahara" },
  { code: "ER", name: "Eritrea" },
  { code: "ES", name: "Spain" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FJ", name: "Fiji" },
  { code: "FK", name: "Falkland Islands" },
  { code: "FM", name: "Micronesia" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GB", name: "United Kingdom", aliases: ["UK", "Great Britain", "Britain"] },
  { code: "GD", name: "Grenada" },
  { code: "GE", name: "Georgia" },
  { code: "GF", name: "French Guiana" },
  { code: "GG", name: "Guernsey" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GL", name: "Greenland" },
  { code: "GM", name: "Gambia" },
  { code: "GN", name: "Guinea" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "GR", name: "Greece" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "GT", name: "Guatemala" },
  { code: "GU", name: "Guam" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HK", name: "Hong Kong" },
  { code: "HM", name: "Heard Island and McDonald Islands" },
  { code: "HN", name: "Honduras" },
  { code: "HR", name: "Croatia" },
  { code: "HT", name: "Haiti" },
  { code: "HU", name: "Hungary" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel / Occupied Palestine", aliases: ["Israel"] },
  { code: "IM", name: "Isle of Man" },
  { code: "IN", name: "India" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "IQ", name: "Iraq" },
  { code: "IR", name: "Iran" },
  { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" },
  { code: "JE", name: "Jersey" },
  { code: "JM", name: "Jamaica" },
  { code: "JO", name: "Jordan" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "KH", name: "Cambodia" },
  { code: "KI", name: "Kiribati" },
  { code: "KM", name: "Comoros" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "KP", name: "North Korea", aliases: ["Korea, North", "DPRK"] },
  {
    code: "KR",
    name: "South Korea",
    aliases: ["Korea", "Republic of Korea", "Korea, South"],
  },
  { code: "KW", name: "Kuwait" },
  { code: "KY", name: "Cayman Islands" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "LA", name: "Laos" },
  { code: "LB", name: "Lebanon" },
  { code: "LC", name: "Saint Lucia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LK", name: "Sri Lanka" },
  { code: "LR", name: "Liberia" },
  { code: "LS", name: "Lesotho" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "LV", name: "Latvia" },
  { code: "LY", name: "Libya" },
  { code: "MA", name: "Morocco" },
  { code: "MC", name: "Monaco" },
  { code: "MD", name: "Moldova" },
  { code: "ME", name: "Montenegro" },
  { code: "MF", name: "Saint Martin" },
  { code: "MG", name: "Madagascar" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MK", name: "North Macedonia", aliases: ["Macedonia"] },
  { code: "ML", name: "Mali" },
  { code: "MM", name: "Myanmar", aliases: ["Burma"] },
  { code: "MN", name: "Mongolia" },
  { code: "MO", name: "Macao", aliases: ["Macau"] },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MS", name: "Montserrat" },
  { code: "MT", name: "Malta" },
  { code: "MU", name: "Mauritius" },
  { code: "MV", name: "Maldives" },
  { code: "MW", name: "Malawi" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "MZ", name: "Mozambique" },
  { code: "NA", name: "Namibia" },
  { code: "NC", name: "New Caledonia" },
  { code: "NE", name: "Niger" },
  { code: "NF", name: "Norfolk Island" },
  { code: "NG", name: "Nigeria" },
  { code: "NI", name: "Nicaragua" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NP", name: "Nepal" },
  { code: "NR", name: "Nauru" },
  { code: "NU", name: "Niue" },
  { code: "NZ", name: "New Zealand" },
  { code: "OM", name: "Oman" },
  { code: "PA", name: "Panama" },
  { code: "PE", name: "Peru" },
  { code: "PF", name: "French Polynesia" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "PL", name: "Poland" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "PN", name: "Pitcairn Islands", aliases: ["Pitcairn"] },
  { code: "PR", name: "Puerto Rico" },
  {
    code: "PS",
    name: "Palestine",
    aliases: ["State of Palestine", "Palestinian Territory", "Palestinian Territories"],
  },
  { code: "PT", name: "Portugal" },
  { code: "PW", name: "Palau" },
  { code: "PY", name: "Paraguay" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion", aliases: ["Reunion"] },
  { code: "RO", name: "Romania" },
  { code: "RS", name: "Serbia" },
  { code: "RU", name: "Russia", aliases: ["Russian Federation"] },
  { code: "RW", name: "Rwanda" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SC", name: "Seychelles" },
  { code: "SD", name: "Sudan" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "SH", name: "Saint Helena" },
  { code: "SI", name: "Slovenia" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SK", name: "Slovakia" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SM", name: "San Marino" },
  { code: "SN", name: "Senegal" },
  { code: "SO", name: "Somalia" },
  { code: "SR", name: "Suriname" },
  { code: "SS", name: "South Sudan" },
  { code: "ST", name: "São Tomé and Príncipe", aliases: ["Sao Tome and Principe"] },
  { code: "SV", name: "El Salvador" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SY", name: "Syria" },
  { code: "SZ", name: "Eswatini", aliases: ["Swaziland"] },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TD", name: "Chad" },
  { code: "TF", name: "French Southern Territories" },
  { code: "TG", name: "Togo" },
  { code: "TH", name: "Thailand" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TK", name: "Tokelau" },
  { code: "TL", name: "Timor-Leste", aliases: ["East Timor"] },
  { code: "TM", name: "Turkmenistan" },
  { code: "TN", name: "Tunisia" },
  { code: "TO", name: "Tonga" },
  { code: "TR", name: "Turkey", aliases: ["Türkiye", "Turkiye"] },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TV", name: "Tuvalu" },
  { code: "TW", name: "Taiwan" },
  { code: "TZ", name: "Tanzania" },
  { code: "UA", name: "Ukraine" },
  { code: "UG", name: "Uganda" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  {
    code: "US",
    name: "United States",
    aliases: ["USA", "United States of America", "U.S.", "U.S.A."],
  },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VA", name: "Vatican City", aliases: ["Holy See"] },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "VE", name: "Venezuela" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "VN", name: "Vietnam", aliases: ["Viet Nam"] },
  { code: "VU", name: "Vanuatu" },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "WS", name: "Samoa" },
  // User-assigned code, but in widespread practical use (incl. flagcdn).
  { code: "XK", name: "Kosovo" },
  { code: "YE", name: "Yemen" },
  { code: "YT", name: "Mayotte" },
  { code: "ZA", name: "South Africa" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

/** ISO 3166-1 alpha-2 code (uppercase) -> canonical display name. */
const CODE_TO_NAME: Record<string, string> = {};
/** Lowercased name (canonical or alias) -> ISO code (lowercase). */
const NAME_TO_CODE: Record<string, string> = {};

for (const entry of COUNTRIES) {
  const upper = entry.code.toUpperCase();
  const lower = entry.code.toLowerCase();
  CODE_TO_NAME[upper] = entry.name;
  NAME_TO_CODE[entry.name.toLowerCase()] = lower;
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      const key = alias.toLowerCase();
      if (!(key in NAME_TO_CODE)) NAME_TO_CODE[key] = lower;
    }
  }
}

const ISO_CODE_RE = /^[A-Za-z]{2}$/;

/**
 * If `country` looks like a raw ISO 3166-1 alpha-2 code (e.g. "PS", "XK"),
 * return the canonical display name. Otherwise return the input unchanged
 * (after trimming).
 *
 * This is a frontend-side patch for institutions whose country wasn't
 * mapped on ingest and got the bare ISO code stored as the display name.
 */
export function displayCountryName(
  country: string | null | undefined
): string {
  if (!country) return "";
  const trimmed = country.trim();
  if (ISO_CODE_RE.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    return CODE_TO_NAME[upper] ?? trimmed;
  }
  return trimmed;
}

/**
 * Resolve an ISO 3166-1 alpha-2 code (lowercase) for a country.
 * Accepts an explicit code if available, otherwise falls back to a
 * lookup by display name (canonical or alias). Returns `null` if the
 * country can't be resolved.
 */
export function countryCodeFor(
  country: string | null | undefined,
  explicitCode?: string | null
): string | null {
  if (explicitCode) return explicitCode.toLowerCase();
  if (!country) return null;
  const trimmed = country.trim();
  if (!trimmed) return null;
  // Already an ISO code?
  if (ISO_CODE_RE.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    if (upper in CODE_TO_NAME) return upper.toLowerCase();
  }
  return NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

/**
 * Returns the URL for a flag image (SVG) hosted on flagcdn.com,
 * or `null` if the country can't be resolved.
 *

 */
export function flagUrlFor(
  country: string | null | undefined,
  explicitCode?: string | null
): string | null {
  const code = countryCodeFor(country, explicitCode);
  if (!code) return null;

  return `https://flagcdn.com/${code}.svg`;
}

/**
 * Returns a special emoji override for a country, or `null` if no override
 * applies. Used to substitute the visual representation entirely.
 */
export function flagEmojiOverrideFor(
  _country: string | null | undefined,
  _explicitCode?: string | null
): string | null {
  return null;
}

/**
 * Full list of known countries (canonical name + ISO code), sorted
 * alphabetically by display name. Useful for building selectors that
 * should include countries even when they have no rows in the DB.
 */
export const ALL_COUNTRIES: ReadonlyArray<{ code: string; name: string }> =
  COUNTRIES.map((c) => ({ code: c.code, name: c.name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
