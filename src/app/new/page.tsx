"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { createResume } from "@/lib/resume-service";
import type { TemplateId } from "@/types/resume";
import { TEMPLATES } from "@/components/resume/templates";
import { TemplateGallery } from "@/components/resume/template-gallery";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Aurora, Spinner } from "@/components/ui/motion";

export default function NewResume() {
  const [title, setTitle] = useState("My resume");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (!auth) {
      setBusy(false);
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setBusy(false);
      router.push("/sign-in");
      return;
    }
    try {
      const id = await createResume(user.uid, { title, templateId: template });
      router.push(`/builder/${id}`);
    } catch {
      setBusy(false);
      alert("We couldn't create your resume. Check your connection and try again.");
    }
  }

  return (
    <main className="relative min-h-screen">
      <Aurora />

      <header className="no-print sticky top-0 z-30 border-b border-line/60 bg-surface/70 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="btn btn-secondary">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="shell py-10">
        <span className="chip border border-brand/25 bg-brand/10 text-brand">
          <Sparkles size={13} /> New resume
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold">Give this story a name.</h1>
        <p className="mt-2 text-muted">Pick a starting template — you can switch designs any time in the builder.</p>

        <form onSubmit={create} className="mt-8">
          <label className="block max-w-lg">
            <span className="label">Resume title</span>
            <input
              className="field text-lg"
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Designer — 2026"
            />
          </label>

          <p className="label mt-8">Choose a template — {TEMPLATES.length} designs</p>
          <TemplateGallery value={template} onChange={setTemplate} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />

          <button disabled={busy} className="btn btn-primary mt-8 text-base">
            {busy ? (
              <>
                <Spinner size={18} /> Creating…
              </>
            ) : (
              <>Create and start building</>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
