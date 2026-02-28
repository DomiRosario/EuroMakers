import { Link } from "@remix-run/react";

export default function SubmitCTA() {
  return (
    <section className="eu-section bg-gradient-to-r from-euBlue to-blue-700 text-white">
      <div className="eu-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-euYellow p-2 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-euBlue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Got a European Software Product?
          </h2>

          <p className="text-lg md:text-xl opacity-90 mb-8">
            If you&apos;ve developed software in Europe or know of a European
            software product that&apos;s not listed here, we&apos;d love to add
            it to our catalog.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="btn btn-lg bg-white hover:bg-gray-100 text-euBlue"
            >
              Submit Software
            </Link>
            <Link
              to="/criteria"
              className="btn btn-lg btn-outline border-white text-white hover:bg-white/10"
            >
              View Criteria
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
