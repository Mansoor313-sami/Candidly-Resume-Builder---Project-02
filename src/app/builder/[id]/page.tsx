import { Suspense } from "react";
import { BuilderClient } from "@/components/resume/builder-client";

/**
 * Builder route. The client component reads the `?preview=1` search param, so
 * it's wrapped in <Suspense> as Next.js 15 requires.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={<main className="grid min-h-screen place-items-center text-muted">Loading your workspace…</main>}
    >
      <BuilderClient id={id} />
    </Suspense>
  );
}
