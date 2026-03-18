import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import Layout from "~/components/Layout";
import { getAllSoftware, getAllCountries, type Software } from "~/lib/software";
import SoftwareGrid from "~/components/SoftwareGrid";
import { getCountryCode } from "~/lib/countries";
import { CATEGORIES, type Category } from "~/lib/categories";
import { useState, useRef, useEffect } from "react";
import {
  RiLayoutGridLine,
  RiLayoutMasonryLine,
  RiArrowDownSLine,
  RiSearch2Line,
} from "react-icons/ri";
import { buildSocialMeta } from "~/lib/meta";
import type { ViewMode } from "~/components/SoftwareCard";

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

  const categories = CATEGORIES;

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
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [openTopFilter, setOpenTopFilter] = useState<"category" | "country" | null>(null);
  const topFilterRef = useRef<HTMLDivElement>(null);

  const selectedCategory = searchParams.get("category") || undefined;
  const selectedCountry = searchParams.get("country") || undefined;
  const searchQuery = searchParams.get("search") || "";

  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : undefined;
  const selectedCountryName = selectedCountry
    ? countries.find((c) => c.id === selectedCountry)?.name
    : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (topFilterRef.current && !topFilterRef.current.contains(e.target as Node)) {
        setOpenTopFilter(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const hasActiveFilters = Boolean(selectedCategory || selectedCountry || searchQuery);
  const clearAllFilters = () => handleFilterChange({});

  return (
    <Layout>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-7xl mx-auto">

            {/* Filter bar — desktop */}
            <div
              ref={topFilterRef}
              className="hidden lg:flex items-center gap-3 py-3 border-b border-gray-200 mb-6"
            >
              {/* Search */}
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search software..."
                  className="w-full px-3 py-2 pl-9 bg-white border border-gray-300 text-gray-900 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-euBlue focus:border-transparent text-sm"
                  value={searchQuery}
                  onChange={(e) =>
                    handleFilterChange({
                      category: selectedCategory,
                      country: selectedCountry,
                      search: e.target.value,
                    })
                  }
                />
                <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTopFilter((prev) =>
                      prev === "category" ? null : "category"
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm whitespace-nowrap transition-colors ${
                    selectedCategory
                      ? "border-euBlue text-euBlue font-medium"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {selectedCategoryName || "Category"}
                  <RiArrowDownSLine
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      openTopFilter === "category" ? "rotate-180" : ""
                    } ${selectedCategory ? "text-euBlue" : "text-gray-400"}`}
                  />
                </button>
                {openTopFilter === "category" && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = categoryCounts[cat.id] ?? 0;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            handleFilterChange({
                              category: isSelected ? undefined : cat.id,
                              country: selectedCountry,
                              search: searchQuery,
                            });
                            setOpenTopFilter(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            isSelected
                              ? "text-euBlue font-medium bg-blue-50/60"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="flex-1 text-left truncate">{cat.name}</span>
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
                  </div>
                )}
              </div>

              {/* Country dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTopFilter((prev) =>
                      prev === "country" ? null : "country"
                    )
                  }
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm whitespace-nowrap transition-colors ${
                    selectedCountry
                      ? "border-euBlue text-euBlue font-medium"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {selectedCountryName || "Country"}
                  <RiArrowDownSLine
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      openTopFilter === "country" ? "rotate-180" : ""
                    } ${selectedCountry ? "text-euBlue" : "text-gray-400"}`}
                  />
                </button>
                {openTopFilter === "country" && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                    {countries.map((country) => {
                      const isSelected = selectedCountry === country.id;
                      const count = countryCounts[country.id] ?? 0;
                      return (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            handleFilterChange({
                              country: isSelected ? undefined : country.id,
                              category: selectedCategory,
                              search: searchQuery,
                            });
                            setOpenTopFilter(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            isSelected
                              ? "text-euBlue font-medium bg-blue-50/60"
                              : "text-gray-700"
                          }`}
                        >
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
                  </div>
                )}
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 hover:text-red-600 hover:underline underline-offset-2 whitespace-nowrap"
                >
                  Clear all
                </button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Result count */}
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {filteredSoftware.length}{" "}
                {filteredSoftware.length === 1 ? "result" : "results"}
              </span>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  title="Card view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "cards"
                      ? "bg-white shadow text-euBlue"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <RiLayoutGridLine size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("rectangles")}
                  title="Rectangle view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "rectangles"
                      ? "bg-white shadow text-euBlue"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <RiLayoutMasonryLine size={18} />
                </button>
              </div>
            </div>

            {/* Mobile filters — search + dropdowns stacked at top */}
            <div className="lg:hidden mb-4 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search software..."
                  className="w-full px-3 py-2.5 pl-9 bg-white border border-gray-200 text-gray-900 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-euBlue focus:border-transparent text-sm"
                  value={searchQuery}
                  onChange={(e) =>
                    handleFilterChange({
                      category: selectedCategory,
                      country: selectedCountry,
                      search: e.target.value,
                    })
                  }
                />
                <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                {/* Category */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setOpenTopFilter((p) => p === "category" ? null : "category")}
                    className={`w-full flex items-center justify-between gap-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedCategory ? "border-euBlue text-euBlue" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="truncate">{selectedCategoryName || "Category"}</span>
                    <RiArrowDownSLine className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${openTopFilter === "category" ? "rotate-180" : ""} ${selectedCategory ? "text-euBlue" : "text-gray-400"}`} />
                  </button>
                  {openTopFilter === "category" && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const count = categoryCounts[cat.id] ?? 0;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { handleFilterChange({ category: isSelected ? undefined : cat.id, country: selectedCountry, search: searchQuery }); setOpenTopFilter(null); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${isSelected ? "text-euBlue font-medium bg-blue-50/60" : "text-gray-700"}`}
                          >
                            <span className="flex-1 text-left truncate">{cat.name}</span>
                            <span className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${isSelected ? "bg-euBlue/10 text-euBlue" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setOpenTopFilter((p) => p === "country" ? null : "country")}
                    className={`w-full flex items-center justify-between gap-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedCountry ? "border-euBlue text-euBlue" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="truncate">{selectedCountryName || "Country"}</span>
                    <RiArrowDownSLine className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${openTopFilter === "country" ? "rotate-180" : ""} ${selectedCountry ? "text-euBlue" : "text-gray-400"}`} />
                  </button>
                  {openTopFilter === "country" && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                      {countries.map((country) => {
                        const isSelected = selectedCountry === country.id;
                        const count = countryCounts[country.id] ?? 0;
                        return (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() => { handleFilterChange({ country: isSelected ? undefined : country.id, category: selectedCategory, search: searchQuery }); setOpenTopFilter(null); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${isSelected ? "text-euBlue font-medium bg-blue-50/60" : "text-gray-700"}`}
                          >
                            <span className="flex-1 text-left truncate">{country.name}</span>
                            <span className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${isSelected ? "bg-euBlue/10 text-euBlue" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {hasActiveFilters && (
                  <button type="button" onClick={clearAllFilters} className="text-sm text-red-500 whitespace-nowrap">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Backdrop to close open dropdowns */}
            {openTopFilter && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenTopFilter(null)}
              />
            )}

            {/* Full-width grid */}
            {filteredSoftware.length > 0 ? (
              <>
                <div className="lg:hidden">
                  <SoftwareGrid software={filteredSoftware} viewMode="rectangles" />
                </div>
                <div className="hidden lg:block">
                  <SoftwareGrid software={filteredSoftware} viewMode={viewMode} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  No results match your current filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-euBlue hover:underline underline-offset-2"
                >
                  Clear all filters
                </button>
              </div>
            )}


          </div>
        </div>
      </main>
    </Layout>
  );
}
