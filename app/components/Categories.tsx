import { Link } from "@remix-run/react";
import { CATEGORIES, CATEGORY_ICONS } from "~/lib/categories";

interface CategoriesProps {
  categoryCounts?: Record<string, number>;
}

export default function Categories({ categoryCounts }: CategoriesProps) {
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <section
      id="homepage-categories"
      className="scroll-mt-28 overflow-hidden bg-white py-10 sm:py-12"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-euBlue/70">
            Start Here
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Pick a category and jump in
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            One clean row of categories, moving across the page so users can
            spot the path they want immediately.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

          <div className="homepage-marquee-track flex w-max items-center gap-4 py-4 sm:gap-5">
            {items.map((category, index) => {
              const Icon = CATEGORY_ICONS[category.id];
              const count = categoryCounts?.[category.id] || 0;

              return (
                <Link
                  key={`${category.id}-${index}`}
                  to={`/software?category=${category.id}`}
                  className="group inline-flex min-w-fit items-center gap-4 rounded-full border border-euBlue/15 bg-[#f7f1df] px-5 py-4 shadow-[0_10px_30px_rgba(0,51,153,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-euBlue/40 hover:bg-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-euBlue text-white transition-transform duration-300 group-hover:scale-105">
                    {Icon && <Icon className="h-5 w-5" />}
                  </span>
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <span className="text-base font-semibold text-gray-900">
                      {category.name}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      {count > 0 ? count : "Open"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/software"
            className="inline-flex items-center gap-3 rounded-full border border-euBlue/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-euBlue transition-colors duration-300 hover:border-euBlue hover:bg-euBlue hover:text-white"
          >
            View All Software
          </Link>
        </div>
      </div>
    </section>
  );
}
