import { Link } from "@remix-run/react";
import { CATEGORIES, CATEGORY_ICONS } from "~/lib/categories";

interface HeroProps {
  categoryCounts?: Record<string, number>;
}

export default function Hero({ categoryCounts }: HeroProps) {
  const visibleCategories = CATEGORIES.filter(
    (category) => (categoryCounts?.[category.id] || 0) > 0,
  );
  const marqueeCategories = [
    ...visibleCategories,
    ...visibleCategories,
    ...visibleCategories,
  ];

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-euBlue text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.12),transparent_26%),linear-gradient(180deg,#003399_0%,#003087_55%,#002b73_100%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[41%] w-[78vw] max-w-[320px] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-25 sm:max-w-[360px] md:max-w-[420px] md:opacity-20 lg:hidden">
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
            const radius = 45;

            return (
              <div
                key={`mobile-star-${i}`}
                className="absolute h-7 w-7 sm:h-8 sm:w-8"
                style={{
                  left: `${50 + Math.cos(angle) * radius}%`,
                  top: `${50 + Math.sin(angle) * radius}%`,
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                  transformOrigin: "center center",
                  filter: "drop-shadow(0 0 6px rgba(255, 204, 0, 0.2))",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-full w-full text-euYellow animate-twinkle"
                  style={{ animationDelay: `${i * 0.16}s` }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
                  />
                </svg>
              </div>
            );
          })}
        </div>

        <div className="absolute hidden lg:block right-[5%] top-[48%] w-[42vw] max-w-[40rem] aspect-square -translate-y-1/2">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_26%,transparent_68%)] blur-2xl" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
            const radius = 45;

            return (
              <div
                key={`desktop-star-${i}`}
                className="absolute md:h-9 md:w-9 lg:h-11 lg:w-11"
                style={{
                  left: `${50 + Math.cos(angle) * radius}%`,
                  top: `${50 + Math.sin(angle) * radius}%`,
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                  transformOrigin: "center center",
                  opacity: 0.94,
                  filter: "drop-shadow(0 0 10px rgba(255, 204, 0, 0.24))",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-full w-full text-euYellow animate-twinkle"
                  style={{ animationDelay: `${i * 0.16}s` }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="container mx-auto flex flex-1 flex-col px-4 py-10 sm:py-12 lg:py-12">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_28rem] gap-10 items-center lg:min-h-[28rem] lg:flex-1">
            <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:max-w-3xl lg:self-center lg:text-left">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.32em] text-white/70">
                European Software Directory
              </p>

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] tracking-tight">
                Discover Software
                <span className="block text-euYellow">Made in Europe</span>
              </h1>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:items-start lg:justify-start">
                <Link
                  to="/software"
                  className="btn btn-lg bg-white hover:bg-euYellow text-euBlue border-0 shadow-xl px-8 rounded-full"
                >
                  Explore Software
                </Link>
                <Link
                  to="/submit"
                  className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 rounded-full"
                >
                  Submit Software
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block h-[24rem]" aria-hidden="true" />
          </div>

          <div className="relative z-10 mt-8 sm:mt-10 lg:mt-auto">
            <div className="mx-auto mb-4 flex max-w-5xl items-center justify-center px-4 text-[11px] uppercase tracking-[0.24em] text-white/55 sm:px-6 sm:text-xs lg:justify-start">
              <span>Explore by Category</span>
            </div>

            <div className="homepage-marquee-scroll relative left-1/2 w-screen -translate-x-1/2 overflow-x-auto overscroll-x-contain px-3 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-3">
              <div className="homepage-marquee-track flex w-max items-center gap-3 sm:gap-4 lg:gap-5">
                {marqueeCategories.map((category, index) => {
                  const Icon = CATEGORY_ICONS[category.id];
                  const count = categoryCounts?.[category.id] || 0;

                  return (
                    <Link
                      key={`${category.id}-${index}`}
                      to={`/software?category=${category.id}`}
                      className="group inline-flex min-w-fit snap-start items-center gap-3 rounded-full border border-white/14 bg-white/[0.1] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.16] sm:gap-4 sm:px-5 sm:py-4"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-euYellow text-euBlue transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
                        {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </span>
                      <span className="flex items-center gap-2 whitespace-nowrap sm:gap-3">
                        <span className="text-sm font-semibold text-white sm:text-base">
                          {category.name}
                        </span>
                        <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72 sm:px-3 sm:text-xs">
                          {count}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
