import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

interface PostHogProviderProps {
  apiKey?: string;
  apiHost?: string;
  children: React.ReactNode;
}

function PostHogPageView() {
  const location = useLocation();
  const ph = usePostHog();

  useEffect(() => {
    ph?.capture("$pageview");
  }, [location.pathname, location.search, ph]);

  return null;
}

export default function PostHogProvider({
  apiKey,
  apiHost,
  children,
}: PostHogProviderProps) {
  useEffect(() => {
    if (!apiKey) return;
    posthog.init(apiKey, {
      api_host: apiHost,
      defaults: "2026-01-30",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, [apiKey, apiHost]);

  if (!apiKey) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
