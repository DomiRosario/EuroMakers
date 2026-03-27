import { PostHog } from "posthog-node";

let posthog: PostHog | undefined;

export function getPostHog(): PostHog {
  if (!posthog) {
    posthog = new PostHog(process.env.POSTHOG_KEY ?? "", {
      host: process.env.POSTHOG_HOST,
      enableExceptionAutocapture: true,
    });
  }
  return posthog;
}
