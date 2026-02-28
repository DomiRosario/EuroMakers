import { Link } from "@remix-run/react";
import * as Flag from "country-flag-icons/react/3x2";
import { getCountryCode } from "~/lib/countries";

interface SoftwareCardProps {
  id: string;
  name: string;
  description: string;
  categoryDisplayName: string;
  country: string;
  logo: string;
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

export default function SoftwareCard({
  id,
  name,
  description,
  categoryDisplayName,
  country,
  logo,
}: SoftwareCardProps) {
  return (
    <Link to={`/software/${id}`} className="block h-full" aria-label={name}>
      <div className="modern-card group h-full flex flex-col">
        <div className="relative">
          <figure className="p-6 h-48 flex items-center justify-center bg-gray-50/50 group-hover:bg-gray-100/80 transition-colors">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={logo || "/images/placeholder.svg"}
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
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
