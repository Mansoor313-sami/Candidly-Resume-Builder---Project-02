"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileDown, Printer } from "lucide-react";
import { fetchPublicResume, recordView } from "@/lib/resume-service";
import type { Resume } from "@/types/resume";
import { ResumePreview } from "@/components/resume/resume-preview";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Aurora, Spinner } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { exportResumePdf } from "@/lib/pdf";

/**
 * Public, read-only resume page reached at /resume/[slug]. It only renders
 * documents whose `isPublic` flag is true (enforced by Firestore rules), and
 * lets a visitor print or download the resume as a PDF.
 */
export function PublicResume({ slug, initial }: { slug: string; initial?: Resume }) {
  // undefined = loading, null = not found, Resume = loaded.
  // `initial` (from server-side Admin render) shows content instantly.
  const [resume, setResume] = useState<Resume | null | undefined>(initial ?? undefined);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let id = initial?.id;
    if (!initial) {
      fetchPublicResume(slug)
        .then((r) => { setResume(r); if (r) recordView(r.id); })
        .catch(() => setResume(null));
    } else if (id) {
      recordView(id);
    }
    return () => { id = undefined; };
  }, [slug, initial]);

  async function downloadPdf() {
    const node = document.getElementById("resume-export");
    if (!node) return;
    setExporting(true);
    try {
      const name = (resume?.title || "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      await exportResumePdf(node, `${name}.pdf`);
      toast("PDF downloaded", "success");
    } catch {
      toast("PDF export failed — try Print instead", "error");
    } finally {
      setExporting(false);
    }
  }

  if (resume === undefined)
    return (
      <main className="grid min-h-screen place-items-center text-muted">
        <span className="flex items-center gap-2">
          <Spinner size={18} /> Loading resume…
        </span>
      </main>
    );

  if (!resume)
    return (
      <main className="relative grid min-h-screen place-items-center p-5 text-center">
        <Aurora />
        <div>
          <Brand />
          <h1 className="mt-10 font-display text-3xl font-bold">This resume isn&apos;t available.</h1>
          <p className="mt-2 text-muted">It may be private, moved, or no longer published.</p>
          <Link href="/" className="btn btn-primary mt-6">Go to Candidly</Link>
        </div>
      </main>
    );

  return (
    <main className="relative min-h-screen">
      <Aurora />
      <header className="no-print sticky top-0 z-30 border-b border-line/60 bg-surface/80 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button onClick={() => print()} className="btn btn-secondary !px-3 !py-2">
              <Printer size={16} /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={downloadPdf} disabled={exporting} className="btn btn-primary !px-3 !py-2">
              {exporting ? <Spinner size={16} /> : <FileDown size={16} />}
              <span className="hidden sm:inline">{exporting ? "Exporting…" : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="overflow-auto p-4 md:p-10">
        <ResumePreview resume={resume} id="resume-export" />
      </div>
    </main>
  );
}
