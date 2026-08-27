import { FullscreenLoader } from "@/components/ui/loader";

/**
 * Shown automatically by Next.js during route/segment transitions.
 * Gives users an immediate, branded "the app is working" signal.
 */
export default function Loading() {
  return <FullscreenLoader />;
}
