import type { Metadata } from "next";
import { PublicResume } from "@/components/resume/public-resume";
import { fetchPublicResumeAdmin } from "@/lib/firebase/admin";

/**
 * Public resume route. When Firebase Admin is configured, we fetch the resume
 * on the server for real SEO + per-resume Open Graph metadata and hand the
 * data to the client for rendering. Otherwise the client fetches it itself.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await fetchPublicResumeAdmin(slug);
  if (!r) return { title: "Resume", description: "A resume on Candidly." };
  const name = r.personalInfo?.fullName || "Resume";
  const title = r.personalInfo?.title ? `${name} — ${r.personalInfo.title}` : name;
  const description = (r.professionalSummary || `${name}'s resume, built with Candidly.`).slice(0, 180);
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const initial = await fetchPublicResumeAdmin(slug);
  return <PublicResume slug={slug} initial={initial ?? undefined} />;
}
