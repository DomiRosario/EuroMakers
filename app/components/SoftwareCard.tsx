import { Link } from "@remix-run/react";
import * as Flag from "country-flag-icons/react/3x2";
import { getCountryCode } from "~/lib/countries";
import SoftwareLogo from "./SoftwareLogo";

export type ViewMode = "cards" | "rectangles";

interface SoftwareCardProps {
  id: string;
  name: string;
  description: string;
  categoryDisplayName: string;
  country: string;
  website: string;
  viewMode?: ViewMode;
}

const getFlagComponent = (countryCode: string) => {
  const code = getCountryCode(countryCode);
  const flagMap = Flag as unknown as Record<
    string,
    React.ComponentType<{
      className?: string;
      title?: string;
    }>
  >;
  const FlagComponent = flagMap[code] as React.ComponentType<{
    className?: string;
    title?: string;
  }>;
  return FlagComponent ? (
    <FlagComponent className="w-full h-full" title={countryCode} />
  ) : null;
};

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default function SoftwareCard({
  id,
  name,
  description,
  categoryDisplayName,
  country,
  website,
  viewMode = "cards",
}: SoftwareCardProps) {
  // ── Rectangle view ─────────────────────────────────────────────────────────
  if (viewMode === "rectangles") {
    return (
      <Link to={`/software/${id}`} className="block h-full" aria-label={name}>
        <div className="modern-card group h-full flex flex-row overflow-hidden">
          {/* Logo — left column */}
          <div className="relative flex-shrink-0 w-36 sm:w-44 flex items-center justify-center bg-gray-50/50 group-hover:bg-gray-100/80 transition-colors">
            <SoftwareLogo
              website={website}
              alt={`${name} logo`}
              className="object-contain p-3 w-28 h-28 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Content — right column */}
          <div className="p-4 flex-1 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-800 group-hover:text-euBlue transition-colors line-clamp-1 flex-1 min-w-0">
                {name}
              </h2>
              <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500">
                <div className="w-4 h-3 overflow-hidden rounded-sm">
                  {getFlagComponent(country)}
                </div>
                <span className="hidden sm:inline truncate max-w-[80px]">
                  {country}
                </span>
              </div>
            </div>

            <div className="self-start px-2 py-0.5 rounded-full bg-euBlue/10 text-euBlue text-xs font-medium mb-2 whitespace-nowrap">
              {categoryDisplayName}
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 flex-1">
              {description}
            </p>

            <span className="inline-flex items-center text-xs font-medium text-euBlue group-hover:text-blue-700 transition-colors mt-3">
              View Details
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Cards view (default) ───────────────────────────────────────────────────
  return (
    <Link to={`/software/${id}`} className="block h-full" aria-label={name}>
      <div className="modern-card group h-full flex flex-col">
        <div className="relative">
          <figure className="p-6 h-48 flex items-center justify-center bg-gray-50/50 group-hover:bg-gray-100/80 transition-colors">
            <div className="relative w-full h-full flex items-center justify-center">
              <SoftwareLogo
                website={website}
                alt={`${name} logo`}
                className="object-contain p-2 max-w-full max-h-full transition-transform duration-300 group-hover:scale-105"
                width={200}
                height={200}
                loading="lazy"
              />
            </div>
          </figure>
          {/* Country flag marker */}
          <div className="glass-effect absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full">
            <div className="w-5 h-4">{getFlagComponent(country)}</div>
            <span className="text-xs font-medium text-gray-700">{country}</span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-euBlue transition-colors line-clamp-2">
              {name}
            </h2>
          </div>
          <div className="self-start px-3 py-1 rounded-full bg-euBlue/10 text-euBlue text-xs font-medium mb-3 whitespace-nowrap">
            {categoryDisplayName}
          </div>
          <p
            className="text-sm text-gray-600 line-clamp-3 mb-4"
            data-testid="software-description"
          >
            {description}
          </p>
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center text-sm font-medium text-euBlue group-hover:text-blue-700 transition-colors">
              View Details
              <ChevronRight />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
