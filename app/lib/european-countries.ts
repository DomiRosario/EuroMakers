const EUROPEAN_COUNTRY_LIST = [
  "Albania",
  "Andorra",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
  "Multiple EU Countries",
  "European Union",
  "EU",
];

export const EUROPEAN_COUNTRIES = new Set(
  EUROPEAN_COUNTRY_LIST.map((country) => country.toLowerCase()),
);

export function normalizeCountry(value: string): string {
  return value.trim().toLowerCase();
}

export function isEuropeanCountry(value: string): boolean {
  return EUROPEAN_COUNTRIES.has(normalizeCountry(value));
}

export const EUROPEAN_COUNTRY_VALUES = EUROPEAN_COUNTRY_LIST;
