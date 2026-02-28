import { useState, useEffect } from "react";
import { Link, useLocation } from "@remix-run/react";
import {
  RiInformationLine,
  RiApps2Line,
  RiAddLine,
  RiMenu4Line,
  RiCloseLine,
} from "react-icons/ri";

const ABOUT_ITEMS = [
  { href: "/about", label: "About Us" },
  { href: "/mission", label: "Our Mission" },
  { href: "/criteria", label: "Criteria" },
];

// Navigation tracking hook point.
const trackNavigation = (
  destination: string,
  label: string,
  source: "desktop" | "mobile" = "desktop",
) => {
  // Tracking removed for production launch.
  void destination;
  void label;
  void source;
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle scroll effect
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar fixed top-0 left-0 right-0 z-40 border-b border-gray-100 shadow-sm min-h-[5rem] transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo - Left side */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => trackNavigation("/", "Logo", "desktop")}
        >
          <img
            src="/Euro-Makers.png"
            alt="EuroMakers Logo"
            className="h-16 transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Desktop navigation - Right side */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/software"
            className={`btn btn-ghost gap-2 py-2 px-4 rounded-full hover:bg-blue-50 hover:text-euBlue normal-case ${
              location.pathname.startsWith("/software")
                ? "bg-blue-50 text-euBlue font-medium"
                : "text-gray-700"
            }`}
            onClick={() =>
              trackNavigation("/software", "All Software", "desktop")
            }
          >
            <RiApps2Line className="h-5 w-5" />
            Software
          </Link>

          <div className="dropdown dropdown-hover dropdown-end">
            <button
              aria-haspopup="true"
              className={`btn btn-ghost gap-2 py-2 px-4 rounded-full hover:bg-blue-50 hover:text-euBlue normal-case ${
                ABOUT_ITEMS.some((item) => location.pathname === item.href)
                  ? "bg-blue-50 text-euBlue font-medium"
                  : "text-gray-700"
              }`}
            >
              <RiInformationLine className="h-5 w-5" />
              About
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-y-0.5"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div
              role="menu"
              className="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-56 mt-4 before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-4 before:-translate-y-full"
            >
              {ABOUT_ITEMS.map((item) => (
                <li key={item.href} role="none">
                  <Link
                    to={item.href}
                    role="menuitem"
                    className={`relative overflow-hidden px-4 py-2 rounded-lg transition-all duration-300 ${
                      location.pathname === item.href
                        ? "text-euBlue font-medium bg-blue-50"
                        : "text-gray-700 hover:text-euBlue"
                    } hover:bg-blue-50 before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-1 before:h-0 before:bg-euBlue before:transition-all before:duration-300 hover:before:h-1/2 hover:before:top-1/4 hover:pl-6`}
                    onClick={() =>
                      trackNavigation(item.href, item.label, "desktop")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </div>
          </div>

          <Link
            to="/submit"
            className="btn bg-euBlue hover:bg-blue-700 text-white gap-2 px-6 rounded-full normal-case border-0"
            onClick={() =>
              trackNavigation("/submit", "Submit Software", "desktop")
            }
          >
            <RiAddLine className="h-4 w-4" />
            Submit Software
          </Link>
        </div>

        {/* Mobile menu button - Right side */}
        <div className="lg:hidden">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <RiCloseLine className="h-6 w-6" />
            ) : (
              <RiMenu4Line className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed left-0 right-0 top-[var(--navbar-height)] bg-white shadow-lg border-t border-gray-100 transform transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto">
          <ul className="menu menu-lg w-full p-2 gap-1">
            <li>
              <Link
                to="/software"
                className={`hover:bg-blue-50 ${
                  location.pathname.startsWith("/software")
                    ? "text-euBlue font-medium bg-blue-50"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  trackNavigation("/software", "All Software", "mobile");
                }}
              >
                Software
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link
                to="/about"
                className={`hover:bg-blue-50 ${
                  location.pathname === "/about"
                    ? "text-euBlue font-medium bg-blue-50"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  trackNavigation("/about", "About", "mobile");
                }}
              >
                About
              </Link>
            </li>
            {ABOUT_ITEMS.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`hover:bg-blue-50 pl-8 ${
                    location.pathname === item.href
                      ? "text-euBlue font-medium bg-blue-50"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    trackNavigation(item.href, item.label, "mobile");
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <div className="divider my-1"></div>
            <li>
              <Link
                to="/submit"
                className="btn bg-euBlue hover:bg-blue-700 text-white w-full justify-center gap-2 normal-case border-0"
                onClick={() => {
                  setIsMenuOpen(false);
                  trackNavigation("/submit", "Submit Software", "mobile");
                }}
              >
                <RiAddLine className="h-4 w-4" />
                Submit Software
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
