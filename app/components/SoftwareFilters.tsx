import { useState } from "react";
import type { Category } from "~/lib/categories";
import { CATEGORY_ICONS } from "~/lib/categories";
import { RiApps2Line, RiSearch2Line, RiArrowDownSLine } from "react-icons/ri";
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
    React.ComponentType<{ className?: string; title?: string }>
  >;
  const FlagComponent = flagMap[countryCode];
  return FlagComponent ? (
    <FlagComponent className="w-full h-full" title={countryCode} />
  ) : null;
};

interface DropdownProps {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Dropdown({ label, value, open, onToggle, children }: DropdownProps) {
  const isActive = Boolean(value);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isActive ? "border-euBlue" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white text-sm hover:bg-gray-50 transition-colors ${
          open ? "border-b border-gray-200" : ""
        }`}
      >
        <span
          className={`truncate font-medium ${
            isActive ? "text-euBlue" : "text-gray-500"
          }`}
        >
          {value || label}
        </span>
        <RiArrowDownSLine
          className={`flex-shrink-0 w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${isActive ? "text-euBlue" : "text-gray-400"}`}
        />
      </button>

      {open && (
        <div className="max-h-60 overflow-y-auto bg-white">{children}</div>
      )}
    </div>
  );
}

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
  const [openSection, setOpenSection] = useState<"category" | "country" | null>(null);

  const toggleSection = (section: "category" | "country") =>
    setOpenSection((prev) => (prev === section ? null : section));

  const getCategoryIcon = (categoryId: string) => {
    const normalizedId = categoryId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    return CATEGORY_ICONS[normalizedId] || RiApps2Line;
  };

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : undefined;

  const selectedCountryData = selectedCountry
    ? countries.find((c) => c.id === selectedCountry)
    : undefined;

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

      {/* Categories Dropdown */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1.5">Category</h3>
        <Dropdown
          label="All Categories"
          value={selectedCategoryName || ""}
          open={openSection === "category"}
          onToggle={() => toggleSection("category")}
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            const count = categoryCounts?.[category.id] ?? 0;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onFilterChange({
                    category: isSelected ? undefined : category.id,
                    country: selectedCountry,
                    search: searchQuery,
                  });
                  setOpenSection(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  isSelected ? "text-euBlue font-medium bg-blue-50/60" : "text-gray-700"
                }`}
              >
                <Icon
                  size={15}
                  className={`flex-shrink-0 ${isSelected ? "text-euBlue" : "text-gray-400"}`}
                />
                <span className="flex-1 text-left truncate">{category.name}</span>
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                    isSelected
                      ? "bg-euBlue/10 text-euBlue"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Dropdown>
      </div>

      {/* Countries Dropdown */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1.5">Country</h3>
        <Dropdown
          label="All Countries"
          value={selectedCountryData?.name || ""}
          open={openSection === "country"}
          onToggle={() => toggleSection("country")}
        >
          {countries.map((country) => {
            const count = countryCounts?.[country.id] ?? 0;
            const isSelected = selectedCountry === country.id;
            return (
              <button
                key={country.id}
                type="button"
                onClick={() => {
                  onFilterChange({
                    country: isSelected ? undefined : country.id,
                    category: selectedCategory,
                    search: searchQuery,
                  });
                  setOpenSection(null);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  isSelected ? "text-euBlue font-medium bg-blue-50/60" : "text-gray-700"
                }`}
              >
                <div className="w-5 h-4 flex-shrink-0 overflow-hidden rounded-sm">
                  {getFlagComponent(country.code)}
                </div>
                <span className="flex-1 text-left truncate">{country.name}</span>
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                    isSelected
                      ? "bg-euBlue/10 text-euBlue"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
}
