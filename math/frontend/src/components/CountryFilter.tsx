"use client";

const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Australasia",
];

interface CountryFilterProps {
  countries: string[];
  selectedRegion: string;
  selectedCountry: string;
  onRegionChange: (r: string) => void;
  onCountryChange: (c: string) => void;
}

export default function CountryFilter({
  countries,
  selectedRegion,
  selectedCountry,
  onRegionChange,
  onCountryChange,
}: CountryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-gray-600">Show:</span>

      {/* Region presets */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => { onRegionChange(""); onCountryChange(""); }}
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
            !selectedRegion && !selectedCountry
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Worldwide
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => { onRegionChange(r); onCountryChange(""); }}
            className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
              selectedRegion === r
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Country dropdown */}
      <select
        value={selectedCountry}
        onChange={(e) => { onCountryChange(e.target.value); onRegionChange(""); }}
        className="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">Country...</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
