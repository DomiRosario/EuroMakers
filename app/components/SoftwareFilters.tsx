import type { Category } from "~/lib/categories";
import { CATEGORY_ICONS } from "~/lib/categories";
import { RiApps2Line, RiSearch2Line } from "react-icons/ri";
import * as Flag from "country-flag-icons/react/3x2";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface SoftwareFiltersProps {
  categories: Category[];
  countries: Country[];
  selectedCategory?: string;
  selectedCountry?: string;
  searchQuery: string;
  categoryCounts?: Record<string, number>;
  countryCounts?: Record<string, number>;
  onFilterChange: (filters: {
    category?: string;
    country?: string;
    search?: string;
  }) => void;
}

const getFlagComponent = (countryCode: string) => {
  const flagMap = Flag as unknown as Record<
    string,
    React.ComponentType<{
      className?: string;
      title?: string;
    }>
  >;
  const FlagComponent = flagMap[countryCode] as React.ComponentType<{
    className?: string;
    title?: string;
  }>;
  return FlagComponent ? (
    <FlagComponent className="w-full h-full" title={countryCode} />
  ) : null;
};

export default function SoftwareFilters({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  searchQuery,
  categoryCounts,
  countryCounts,
  onFilterChange,
}: SoftwareFiltersProps) {
  // Helper function to get the icon for a category
  const getCategoryIcon = (categoryId: string) => {
    const normalizedId = categoryId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    return CATEGORY_ICONS[normalizedId] || RiApps2Line;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Desktop Only */}
      <div className="hidden md:block">
        <h3 className="text-sm font-medium text-gray-700 mb-1.5">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search software..."
            className="w-full px-3 py-1.5 pl-8 bg-white border border-gray-300 text-gray-900 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-euBlue focus:border-transparent text-sm"
            value={searchQuery}
            onChange={(e) =>
              onFilterChange({
                category: selectedCategory,
                country: selectedCountry,
                search: e.target.value,
              })
            }
          />
          <RiSearch2Line className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1.5">Categories</h3>
        <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            const isSelected = selectedCategory === category.id;
            const count = categoryCounts?.[category.id] ?? 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    category: isSelected ? undefined : category.id,
                    country: selectedCountry,
                    search: searchQuery,
                  })
                }
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-all ${
                  isSelected
                    ? "bg-blue-50 text-euBlue"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  size={16}
                  className={isSelected ? "text-euBlue" : "text-gray-500"}
                />
                <span className="font-medium truncate flex-1 text-left">
                  {category.name}
                </span>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    isSelected
                      ? "bg-white text-euBlue"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1.5">Countries</h3>
        <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
          {countries.map((country) => {
            const isSelected = selectedCountry === country.id;
            const count = countryCounts?.[country.id] ?? 0;
            return (
              <button
                key={country.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    country: isSelected ? undefined : country.id,
                    category: selectedCategory,
                    search: searchQuery,
                  })
                }
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all ${
                  isSelected
                    ? "bg-blue-50 text-euBlue font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 overflow-hidden rounded">
                  {getFlagComponent(country.code)}
                </div>
                <span className="font-medium truncate flex-1 text-left">
                  {country.name}
                </span>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    isSelected
                      ? "bg-white text-euBlue"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
