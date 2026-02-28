import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/Euro-Makers.png"
                alt="EuroMakers Logo"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-gray-600 max-w-xs">
              Discover and explore software made in Europe. Supporting European
              digital sovereignty and innovation.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:col-span-2 md:gap-8">
            {/* Explore links */}
            <div className="md:col-span-1">
              <h3 className="font-semibold text-gray-800 mb-4">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/software"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    All Software
                  </Link>
                </li>
                <li>
                  <Link
                    to="/submit"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Submit Software
                  </Link>
                </li>
                <li>
                  <Link
                    to="/update"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Update Software
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/DomiRosario/EuroMakers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>

            {/* About links */}
            <div className="md:col-span-1">
              <h3 className="font-semibold text-gray-800 mb-4">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-euBlue">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/mission"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link
                    to="/criteria"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Criteria
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div className="md:col-span-1">
              <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-600 hover:text-euBlue"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
