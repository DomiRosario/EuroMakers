import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import Layout from "~/components/Layout";
import { getAllSoftware, getAllCountries, type Software } from "~/lib/software";
import SoftwareGrid from "~/components/SoftwareGrid";
import SoftwareFilters from "~/components/SoftwareFilters";
import { getCountryCode } from "~/lib/countries";
import { CATEGORIES, type Category } from "~/lib/categories";
import { useState } from "react";
import { RiCloseLine, RiFilter3Line } from "react-icons/ri";
import { buildSocialMeta } from "~/lib/meta";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface LoaderData {
  software: Software[];
  categories: Category[];
  countries: Country[];
  categoryCounts: Record<string, number>;
  countryCounts: Record<string, number>;
}

const normalizeCategoryId = (categoryId: string) =>
  categoryId.toLowerCase().replace(/[^a-z0-9-]/g, "-");

export async function loader() {
  const [software, countryNames] = await Promise.all([
    getAllSoftware(),
    getAllCountries(),
  ]);

  // Use predefined categories instead of generating from software data
  const categories = CATEGORIES;

  // Deduplicate countries and sort them
  const uniqueCountryNames = Array.from(new Set(countryNames)).sort();
  const countries: Country[] = uniqueCountryNames.map((name) => ({
    id: name.toLowerCase(),
    name,
    code: getCountryCode(name),
  }));

  const categoryCounts = software.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeCategoryId(item.categoryId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const countryCounts = software.reduce<Record<string, number>>((acc, item) => {
    const key = item.country.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return json<LoaderData>({
    software,
    categories,
    countries,
    categoryCounts,
    countryCounts,
  });
}

export const meta: MetaFunction = () =>
  buildSocialMeta({
    title: "European Software Directory | EuroMakers",
    description:
      "Browse and compare trusted software built in Europe across productivity, security, cloud, AI, and more.",
    path: "/software",
  });

export default function SoftwarePage() {
  const { software, categories, countries, categoryCounts, countryCounts } =
    useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const selectedCategory = searchParams.get("category") || undefined;
  const selectedCountry = searchParams.get("country") || undefined;
  const searchQuery = searchParams.get("search") || "";

  const filteredSoftware = software.filter((item) => {
    if (
      selectedCategory &&
      normalizeCategoryId(item.categoryId) !== selectedCategory
    )
      return false;
    if (
      selectedCountry &&
      item.country.toLowerCase() !== selectedCountry.toLowerCase()
    )
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryDisplayName.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleFilterChange = (filters: {
    category?: string;
    country?: string;
    search?: string;
  }) => {
    const newParams = new URLSearchParams();
    if (filters.category) newParams.set("category", filters.category);
    if (filters.country) newParams.set("country", filters.country);
    if (filters.search?.trim()) newParams.set("search", filters.search.trim());
    setSearchParams(newParams, { replace: true });
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedCountry || searchQuery,
  );
  const selectedCategoryName = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)?.name ||
      selectedCategory
    : undefined;
  const selectedCountryName = selectedCountry
    ? countries.find((country) => country.id === selectedCountry)?.name ||
      selectedCountry
    : undefined;
  const clearAllFilters = () => handleFilterChange({});

  return (
    <Layout>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex flex-col gap-4">
                {/* Title and Stats Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">
                      European Software Directory
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Discover and explore software solutions developed across
                      Europe
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <span className="text-lg font-medium">
                      {filteredSoftware.length} Software{" "}
                      {filteredSoftware.length !== 1 ? "Solutions" : "Solution"}
                    </span>
                  </div>
                </div>

                {/* Mobile/Tablet Search and Filter Row */}
                <div className="flex lg:hidden flex-row gap-4 items-center">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search software..."
                      className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 text-gray-900 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-euBlue focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) =>
                        handleFilterChange({
                          category: selectedCategory,
                          country: selectedCountry,
                          search: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-euBlue text-white whitespace-nowrap"
                  >
                    <RiFilter3Line size={20} />
                    <span>Filters</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 lg:hidden">
                    {filteredSoftware.length} result
                    {filteredSoftware.length === 1 ? "" : "s"}
                  </span>
                  {selectedCategoryName && (
                    <button
                      type="button"
                      onClick={() =>
                        handleFilterChange({
                          category: undefined,
                          country: selectedCountry,
                          search: searchQuery,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-euBlue text-xs font-medium"
                    >
                      {selectedCategoryName}
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  )}
                  {selectedCountryName && (
                    <button
                      type="button"
                      onClick={() =>
                        handleFilterChange({
                          category: selectedCategory,
                          country: undefined,
                          search: searchQuery,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-euBlue text-xs font-medium"
                    >
                      {selectedCountryName}
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        handleFilterChange({
                          category: selectedCategory,
                          country: selectedCountry,
                          search: "",
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-euBlue text-xs font-medium"
                    >
                      &quot;{searchQuery}&quot;
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className={`text-xs font-medium underline-offset-2 ${
                      hasActiveFilters
                        ? "text-red-600 hover:text-red-700 hover:underline"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!hasActiveFilters}
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Filters Panel - Desktop */}
              <div className="hidden lg:block col-span-3 bg-gray-50 rounded-lg p-4 lg:p-6 h-fit sticky top-[calc(var(--navbar-height)+1rem)] min-w-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                  <button
                    onClick={clearAllFilters}
                    className={`text-sm font-medium flex items-center gap-1 ${
                      hasActiveFilters
                        ? "text-red-600 hover:text-red-700"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!hasActiveFilters}
                  >
                    Clear all
                  </button>
                </div>
                <SoftwareFilters
                  categories={categories}
                  countries={countries}
                  selectedCategory={selectedCategory}
                  selectedCountry={selectedCountry}
                  searchQuery={searchQuery}
                  categoryCounts={categoryCounts}
                  countryCounts={countryCounts}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Filters Panel - Mobile/Tablet */}
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filter options"
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
                  isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Overlay */}
                <button
                  className="absolute inset-0 bg-black bg-opacity-50 w-full h-full"
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters overlay"
                />

                {/* Panel */}
                <div
                  role="document"
                  className={`absolute right-0 top-0 h-full w-[85%] max-w-md bg-white transform transition-transform duration-300 ${
                    isFilterOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Filters</h2>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            clearAllFilters();
                            setIsFilterOpen(false);
                          }}
                          className={`text-sm font-medium ${
                            hasActiveFilters
                              ? "text-red-600 hover:text-red-700"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!hasActiveFilters}
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label="Close filters"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <SoftwareFilters
                      categories={categories}
                      countries={countries}
                      selectedCategory={selectedCategory}
                      selectedCountry={selectedCountry}
                      searchQuery={searchQuery}
                      categoryCounts={categoryCounts}
                      countryCounts={countryCounts}
                      onFilterChange={(filters) => {
                        handleFilterChange({
                          ...filters,
                          search: filters.search ?? searchQuery,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Software Grid */}
              <div className="col-span-12 lg:col-span-9">
                {filteredSoftware.length > 0 ? (
                  <SoftwareGrid software={filteredSoftware} />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      No software found
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Try removing a filter or using a broader search term.
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="btn btn-eu"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
