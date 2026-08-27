"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { Copy, Eye, FilePlus, LogOut, Pencil, Share2, Sparkles, Trash2 } from "lucide-react";
import { auth, firebaseConfigured } from "@/lib/firebase/client";
import { copyResume, listResumes, removeResume } from "@/lib/resume-service";
import { DEFAULT_ACCENT, type Resume } from "@/types/resume";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { TemplateThumb } from "@/components/resume/template-thumb";
import { Aurora } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";

export function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const toast = useToast();

  // Subscribe to auth; load this user's resumes or redirect to sign-in.
  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      setErr("Firebase is not configured. Add your values to .env.local to use the workspace.");
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        location.assign("/sign-in");
        return;
      }
      try {
        setItems(await listResumes(u.uid));
      } catch {
        setErr("We couldn't load your resumes. Check your Firestore configuration and rules.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function del(r: Resume) {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    try {
      await removeResume(r.id);
      setItems((x) => x.filter((i) => i.id !== r.id));
      toast("Resume deleted", "success");
    } catch {
      toast("Delete failed. Please try again.", "error");
    }
  }

  async function duplicate(r: Resume) {
    if (!user) return;
    try {
      toast("Duplicating…");
      const id = await copyResume(r, user.uid);
      location.assign(`/builder/${id}`);
    } catch {
      toast("Duplicate failed. Please try again.", "error");
    }
  }

  function shareLink(r: Resume) {
    navigator.clipboard.writeText(`${location.origin}/resume/${r.slug}`)
      .then(() => toast("Public link copied to clipboard", "success"))
      .catch(() => toast("Couldn't copy the link. Please copy it from the address bar.", "error"));
  }

  return (
    <main className="relative min-h-screen">
      <Aurora />

      {/* Top bar */}
      <header className="no-print sticky top-0 z-30 border-b border-line/60 bg-surface/70 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">{user?.email}</span>
            <ThemeToggle />
            <button onClick={() => auth && signOut(auth)} className="btn btn-secondary">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="shell py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="chip border border-brand/25 bg-brand/10 text-brand">
              <Sparkles size={13} /> Your workspace
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold">
              Good to see you{user?.email ? ", " : "."}
              <span className="text-gradient">{user?.email?.split("@")[0]}</span>
            </h1>
            <p className="mt-2 text-muted">Start a new story or keep refining one already in motion.</p>
          </div>
          <Link href="/new" className="btn btn-primary text-base">
            <FilePlus size={18} /> New resume
          </Link>
        </div>

        {err && (
          <p role="alert" className="mt-7 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
            {err}
          </p>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-64 rounded-2xl p-4">
                <div className="skeleton h-28 w-full rounded-xl" />
                <div className="skeleton mt-4 h-4 w-2/3 rounded" />
                <div className="skeleton mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mt-10 rounded-3xl p-12 text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand2 text-white">
              <FilePlus size={26} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">Your first page is waiting.</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Create a resume, add the work you&apos;re proud of, then tune it until it
              feels unmistakably yours.
            </p>
            <Link href="/new" className="btn btn-primary mt-6">
              <FilePlus size={18} /> Create a resume
            </Link>
          </motion.div>
        ) : (
          /* Resume grid */
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r, i) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group card overflow-hidden rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-slate-50">
                  <div className="absolute inset-0 scale-[1.02] p-3">
                    <TemplateThumb templateId={r.templateId} accent={r.accentColor || DEFAULT_ACCENT} />
                  </div>
                  <span
                    className={`chip absolute right-2 top-2 ${
                      r.isPublic ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-slate-500/15 text-slate-500"
                    }`}
                  >
                    {r.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <h2 className="mt-4 truncate font-display text-lg font-bold">{r.title}</h2>
                <p className="mt-0.5 text-sm capitalize text-muted">{r.templateId} template</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link className="btn btn-primary !px-3 !py-2 text-sm" href={`/builder/${r.id}`}>
                    <Pencil size={14} /> Edit
                  </Link>
                  <Link className="btn btn-secondary !px-3 !py-2 text-sm" href={`/builder/${r.id}?preview=1`} aria-label="Preview resume">
                    <Eye size={15} />
                  </Link>
                  <button onClick={() => duplicate(r)} className="btn btn-secondary !px-3 !py-2" aria-label="Duplicate resume">
                    <Copy size={15} />
                  </button>
                  {r.isPublic && (
                    <button onClick={() => shareLink(r)} className="btn btn-secondary !px-3 !py-2" aria-label="Copy public link">
                      <Share2 size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => del(r)}
                    className="btn btn-secondary !px-3 !py-2 text-rose-500 hover:!border-rose-500/40"
                    aria-label="Delete resume"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
