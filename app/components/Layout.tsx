import { useEffect } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Measure navbar height on mount and window resize
  useEffect(() => {
    function updateNavHeight() {
      const navbar = document.querySelector("nav");
      if (navbar) {
        // Update CSS variable for responsive design
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${navbar.offsetHeight}px`,
        );
      }
    }

    // Set initial height
    updateNavHeight();

    // Update on resize
    window.addEventListener("resize", updateNavHeight);

    return () => {
      window.removeEventListener("resize", updateNavHeight);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // skipcq: JS-P1003
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "EuroMakers",
            url: "https://euromakers.org",
            description:
              "Discover and explore software made in Europe. Supporting European digital sovereignty and innovation.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://euromakers.org/software?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <Navbar />
      <div className="navbar-padding flex-grow">{children}</div>
    </div>
  );
}
