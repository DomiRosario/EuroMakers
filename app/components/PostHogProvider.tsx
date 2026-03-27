import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import posthog from "posthog-js";

interface PostHogProviderProps {
  apiKey?: string;
  apiHost?: string;
  children: React.ReactNode;
}

export default function PostHogProvider({
  apiKey,
  apiHost,
  children,
}: PostHogProviderProps) {
  const location = useLocation();

  useEffect(() => {
    if (!apiKey) return;
    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: false, // we capture manually on route change
      persistence: "localStorage+cookie",
    });
  }, [apiKey, apiHost]);

  useEffect(() => {
    if (!apiKey) return;
    posthog.capture("$pageview");
  }, [location.pathname, location.search, apiKey]);

  return <>{children}</>;
}
