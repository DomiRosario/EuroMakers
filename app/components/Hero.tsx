import { Link } from "@remix-run/react";

export default function Hero() {
  return (
    <div className="relative bg-euBlue overflow-hidden [transform:none] [transition:none]">
      <div className="relative container mx-auto px-4 min-h-[70vh] py-16 sm:py-20 md:py-0 md:h-[calc(60vh-var(--navbar-height))] flex items-center [transform:none] [transition:none]">
        <div className="max-w-6xl mx-auto w-full [transform:none] [transition:none]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center [transform:none] [transition:none]">
            {/* Text Section */}
            <div className="text-center md:text-left space-y-6 [transform:none] [transition:none] relative z-10 pb-12 md:pb-0">
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-white leading-tight [transform:none] [transition:none]">
                Discover&nbsp;Software
                <br />
                <span className="block text-euYellow">Made in Europe</span>
              </h1>
              <p className="text-white/90 text-lg sm:text-xl md:text-xl max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Discover and explore software made in Europe. Supporting
                European digital sovereignty and innovation.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <Link
                  to="/software"
                  className="btn btn-lg bg-white hover:bg-gray-100 text-euBlue shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Browse Software
                </Link>
                <Link
                  to="/submit"
                  className="btn btn-lg bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
                >
                  Submit Software
                </Link>
              </div>
            </div>

            {/* Mobile Stars - EU Flag Pattern */}
            <div className="absolute md:hidden w-full h-full mx-auto z-0 top-0 left-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-4/5 max-w-[300px] aspect-square">
                {/* Circle of 12 Stars - EU Flag Style */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 12;
                  // Position stars in a perfect circle like the EU flag
                  const radius = 45; // Percentage-based radius for consistent circle

                  return (
                    <div
                      key={`mobile-star-${i}`}
                      className="absolute w-7 h-7 sm:w-8 sm:h-8"
                      style={{
                        left: `${50 + Math.cos(angle) * radius}%`,
                        top: `${50 + Math.sin(angle) * radius}%`,
                        transform: "translate(-50%, -50%)",
                        willChange: "transform",
                        transformOrigin: "center center",
                        opacity: 0.7,
                        filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-full h-full text-euYellow animate-twinkle"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                        }}
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

            {/* Stars Section - Desktop */}
            <div className="hidden md:block relative aspect-square w-full mx-auto z-0 pointer-events-none">
              {[...Array(12)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 12;
                const radius = 45; // Larger radius for desktop
                return (
                  <div
                    key={`desktop-${i}`}
                    className="absolute md:w-9 md:h-9 lg:w-11 lg:h-11"
                    style={{
                      left: `${50 + Math.cos(angle) * radius}%`,
                      top: `${50 + Math.sin(angle) * radius}%`,
                      transform: "translate(-50%, -50%)",
                      willChange: "transform",
                      transformOrigin: "center center",
                      opacity: 0.7,
                      filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full text-euYellow animate-twinkle"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                      }}
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
        </div>
      </div>
    </div>
  );
}
