import { Link } from "@remix-run/react";
import { CATEGORIES, CATEGORY_ICONS } from "~/lib/categories";

interface CategoriesProps {
  categoryCounts?: Record<string, number>;
}

export default function Categories({ categoryCounts }: CategoriesProps) {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Discover European Software
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated collection of privacy-focused, innovative
            software solutions developed across Europe. Choose a category to
            find the perfect tools for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const count = categoryCounts?.[category.id] || 0;

            return (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-euBlue/20 p-8 hover:-translate-y-1"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-euBlue/10 to-euBlue/20 rounded-xl flex items-center justify-center group-hover:from-euBlue/20 group-hover:to-euBlue/30 transition-all duration-300">
                      {Icon && (
                        <Icon className="w-8 h-8 text-euBlue group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-euBlue transition-colors duration-300">
                        {category.name}
                      </h3>
                      {count > 0 && (
                        <span className="bg-gray-100 text-gray-600 text-sm px-2.5 py-1 rounded-full font-medium">
                          {count}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {category.description}
                    </p>

                    <div className="mt-4 flex items-center text-euBlue text-sm font-medium group-hover:gap-2 transition-all duration-300">
                      <span>Explore {category.name}</span>
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link to="/software" className="btn btn-eu">
            View All Software
          </Link>
        </div>
      </div>
    </section>
  );
}
