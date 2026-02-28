export function getCountryCode(country: string): string {
  // If it's already a 2-letter code (most likely a valid ISO code)
  if (country.length === 2) {
    return country;
  }

  // Handle special cases
  const countryMap: Record<string, string> = {
    Austria: "AT",
    Belgium: "BE",
    Bulgaria: "BG",
    Croatia: "HR",
    Cyprus: "CY",
    "Czech Republic": "CZ",
    Denmark: "DK",
    Estonia: "EE",
    EU: "EU",
    "European Union": "EU",
    Finland: "FI",
    France: "FR",
    Germany: "DE",
    Greece: "GR",
    Hungary: "HU",
    Ireland: "IE",
    Italy: "IT",
    Latvia: "LV",
    Lithuania: "LT",
    Luxembourg: "LU",
    Malta: "MT",
    "Multiple EU Countries": "EU",
    Netherlands: "NL",
    Norway: "NO",
    Poland: "PL",
    Portugal: "PT",
    Romania: "RO",
    Slovakia: "SK",
    Slovenia: "SI",
    Spain: "ES",
    Sweden: "SE",
    Switzerland: "CH",
    UK: "GB",
    "United Kingdom": "GB",
    Ukraine: "UA",
  };

  return countryMap[country] || country;
}
