"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  ClipboardCheck,
  Copy,
  Eye,
  FileDown,
  FileText,
  Keyboard,
  LayoutList,
  Palette,
  Pencil,
  Printer,
  Redo2,
  Sparkles,
  Undo2,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { fetchResume, saveResume } from "@/lib/resume-service";
import { ALL_SECTIONS, blankResume, SECTION_LABELS, type Resume, type SectionKey } from "@/types/resume";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ImproveButton } from "@/components/ai/improve-button";
import { Experiences, EducationList, Projects, Certifications, Languages, Awards, Publications } from "@/components/resume/builder-lists";
import { PhotoUploader } from "@/components/resume/photo-uploader";
import { ReviewPanel } from "@/components/resume/review-panel";
import { SectionManager } from "@/components/resume/section-manager";
import { DesignPanel } from "@/components/resume/design-panel";
import { OnboardingTour } from "@/components/resume/tour";
import { withSampleContent } from "@/lib/sample";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Spinner } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { exportResumePdf } from "@/lib/pdf";

type Section = "personal" | SectionKey | "cover" | "review" | "sections" | "design";

/** Icons shown next to certain nav items. */
const NAV_ICONS: Partial<Record<Section, typeof Palette>> = {
  cover: FileText,
  review: ClipboardCheck,
  sections: LayoutList,
  design: Palette,
};

/** Build the left-nav from the resume's (ordered, visible) sections. */
function buildNav(resume: Resume): [Section, string][] {
  const order = resume.sectionOrder?.length ? resume.sectionOrder : ALL_SECTIONS;
  const full = [...order, ...ALL_SECTIONS.filter((s) => !order.includes(s))];
  const hidden = new Set(resume.hiddenSections || []);
  const sectionNav = full.filter((s) => !hidden.has(s)).map((s) => [s, SECTION_LABELS[s]] as [Section, string]);
  return [
    ["personal", "Personal"],
    ...sectionNav,
    ["cover", "Cover Letter"],
    ["review", "Review"],
    ["sections", "Sections"],
    ["design", "Design"],
  ];
}

/** How "complete" a resume is (0–100), used by the progress meter. */
function completion(r: Resume) {
  const p = r.personalInfo;
  const checks = [
    !!p.fullName && !!p.title,
    !!r.professionalSummary,
    r.experiences.some((e) => e.role && e.bullets.some(Boolean)),
    r.education.length > 0,
    r.skills.length >= 3,
    r.projects.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function BuilderClient({ id }: { id: string }) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [section, setSection] = useState<Section>("personal");
  const [status, setStatus] = useState("Loading…");
  const [preview, setPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [savedAgo, setSavedAgo] = useState("");
  // Undo/redo history stacks.
  const [past, setPast] = useState<Resume[]>([]);
  const [future, setFuture] = useState<Resume[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedAt = useRef<number>(0);
  const navRef = useRef<[Section, string][]>([]);
  const loaded = useRef(false);
  const params = useSearchParams();
  const toast = useToast();

  // Relative "saved 3s ago" label, refreshed periodically.
  useEffect(() => {
    const tick = () => {
      if (!savedAt.current) return setSavedAgo("");
      const s = Math.round((Date.now() - savedAt.current) / 1000);
      setSavedAgo(s < 5 ? "just now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`);
    };
    tick();
    const iv = setInterval(tick, 15000);
    return () => clearInterval(iv);
  }, [status]);

  // On mobile, ?preview=1 (from the dashboard) opens straight into preview.
  useEffect(() => {
    if (params.get("preview")) setPreview(true);
  }, [params]);

  // Auth guard + load the document. blankResume() backfills any missing
  // fields on older documents (e.g. accentColor added later).
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.assign("/sign-in");
        return;
      }
      const data = await fetchResume(id);
      if (!data || data.ownerId !== user.uid) {
        setError("This resume is unavailable or you do not have access to it.");
        setStatus("Unavailable");
        return;
      }
      setResume({
        ...blankResume(id),
        ...data,
        personalInfo: { ...blankResume().personalInfo, ...data.personalInfo },
      });
      setStatus("Saved");
      loaded.current = true;
    });
  }, [id]);

  // Update local state immediately (keeps typing + preview instant) and record
  // the previous state for undo. The redo stack is cleared on a fresh edit.
  function update(next: Resume) {
    if (resume) setPast((p) => [...p, resume].slice(-60));
    setFuture([]);
    setResume(next);
    setStatus("Unsaved changes");
  }

  function undo() {
    if (!resume || past.length === 0) return;
    setFuture((f) => [resume, ...f]);
    setResume(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setStatus("Unsaved changes");
  }

  function redo() {
    if (!resume || future.length === 0) return;
    setPast((p) => [...p, resume]);
    setResume(future[0]);
    setFuture((f) => f.slice(1));
    setStatus("Unsaved changes");
  }

  // Force an immediate save (Ctrl/Cmd+S), bypassing the autosave debounce.
  async function saveNow() {
    if (!resume) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      setStatus("Saving…");
      const { id: _i, createdAt, updatedAt, ...payload } = resume;
      void _i; void createdAt; void updatedAt;
      await saveResume(id, payload);
      savedAt.current = Date.now();
      setStatus("Saved");
      toast("Saved", "success");
    } catch {
      setStatus("Save failed");
      toast("Save failed", "error");
    }
  }

  // Keyboard shortcuts. Re-binds each render so the handlers see fresh state.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      const k = e.key.toLowerCase();
      if (mod && k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && k === "y") { e.preventDefault(); redo(); return; }
      if (mod && k === "s") { e.preventDefault(); saveNow(); return; }
      if (e.key === "Escape") { setShowHelp(false); return; }
      if (!typing && e.key === "?") { setShowHelp((h) => !h); return; }
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        const n = navRef.current[Number(e.key) - 1];
        if (n) { e.preventDefault(); setSection(n[0]); setPreview(false); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Debounced autosave: wait 800ms after the last edit, then write once.
  useEffect(() => {
    if (!resume || !loaded.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setStatus("Saving…");
        const { id: _id, createdAt, updatedAt, ...payload } = resume;
        void _id;
        void createdAt;
        void updatedAt;
        await saveResume(id, payload);
        savedAt.current = Date.now();
        setStatus("Saved");
      } catch {
        setStatus("Save failed");
        setError("We couldn't save your latest changes. Check your connection.");
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [resume, id]);

  function copyShareLink() {
    if (!resume) return;
    navigator.clipboard.writeText(`${location.origin}/resume/${resume.slug}`);
    toast("Public link copied to clipboard", "success");
  }

  async function downloadPdf() {
    const node = document.getElementById("resume-export");
    if (!node) return;
    setExporting(true);
    toast("Preparing your PDF…");
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

  if (error && !resume)
    return (
      <main className="shell py-16">
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300">{error}</p>
        <Link href="/dashboard" className="btn btn-secondary mt-5">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </main>
    );

  if (!resume)
    return (
      <main className="grid min-h-screen place-items-center text-muted">
        <span className="flex items-center gap-2">
          <Spinner size={18} /> Loading your workspace…
        </span>
      </main>
    );

  const pct = completion(resume);
  const navItems = buildNav(resume);
  navRef.current = navItems;

  return (
    <main>
      <OnboardingTour />
      {/* HEADER */}
      <header className="no-print sticky top-0 z-30 border-b border-line/60 bg-surface/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
          <Link href="/dashboard" className="btn btn-secondary !px-3 !py-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="min-w-0 text-center">
            <p className="truncate font-display font-bold">{resume.title}</p>
            <p className={`flex items-center justify-center gap-1.5 text-xs ${status === "Save failed" ? "text-rose-500" : "text-muted"}`}>
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  status === "Saved" ? "bg-emerald-500" : status === "Save failed" ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
              {status}
              {status === "Saved" && savedAgo && <span className="text-muted/70">· {savedAgo}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={undo} disabled={past.length === 0} className="btn btn-secondary !px-2.5 !py-2 max-sm:hidden" aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">
              <Undo2 size={16} />
            </button>
            <button onClick={redo} disabled={future.length === 0} className="btn btn-secondary !px-2.5 !py-2 max-sm:hidden" aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)">
              <Redo2 size={16} />
            </button>
            <button onClick={() => setShowHelp(true)} className="btn btn-secondary !px-2.5 !py-2 max-sm:hidden" aria-label="Keyboard shortcuts (?)" title="Keyboard shortcuts (?)">
              <Keyboard size={16} />
            </button>
            <ThemeToggle className="hidden sm:grid" />
            <button onClick={() => setPreview(!preview)} className="btn btn-secondary !px-3 !py-2 lg:hidden" aria-label="Toggle preview">
              {preview ? <Pencil size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={copyShareLink}
              disabled={!resume.isPublic}
              className="btn btn-secondary !px-3 !py-2"
              title={resume.isPublic ? "Copy public link" : "Make this resume public first (Design tab)"}
            >
              <Copy size={16} />
            </button>
            <button onClick={() => print()} className="btn btn-secondary !px-3 !py-2" aria-label="Print">
              <Printer size={16} />
            </button>
            <button onClick={downloadPdf} disabled={exporting} className="btn btn-primary !px-3 !py-2">
              {exporting ? <Spinner size={16} /> : <FileDown size={16} />}
              <span className="hidden sm:inline">{exporting ? "Exporting…" : "PDF"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* THREE-PANE LAYOUT */}
      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[210px_minmax(380px,1fr)_minmax(430px,.95fr)]">
        {/* Left nav */}
        <aside className="no-print flex gap-1 overflow-x-auto border-b border-line bg-surface/60 p-3 lg:flex-col lg:border-b-0 lg:border-r">
          {navItems.map(([key, label]) => {
            const Icon = NAV_ICONS[key];
            return (
              <button
                onClick={() => { setSection(key); setPreview(false); }}
                key={key}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors lg:w-full ${
                  section === key ? "bg-brand/12 text-brand" : "text-muted hover:bg-brand/8 hover:text-ink"
                }`}
              >
                {Icon && <Icon size={15} />}
                {label}
              </button>
            );
          })}

          {/* Completion meter */}
          <div className="mt-auto hidden rounded-xl border border-line p-3 lg:block">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted">Completeness</span>
              <span className="text-brand">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand2"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </aside>

        {/* Editor */}
        <section className={`no-print overflow-y-auto bg-surface/30 p-5 md:p-8 ${preview ? "hidden lg:block" : ""}`}>
          <Editor section={section} resume={resume} update={update} />
          {error && <p role="alert" className="mt-4 text-sm text-rose-500">{error}</p>}
        </section>

        {/* Live preview */}
        <section className={`${preview ? "block" : "hidden"} relative overflow-auto bg-gradient-to-br from-brand/5 via-transparent to-brand2/5 lg:block`}>
          {/* Zoom toolbar */}
          <div className="no-print sticky top-0 z-10 flex items-center justify-center gap-1.5 border-b border-line/60 bg-surface/70 px-3 py-2 backdrop-blur">
            <button onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} className="btn btn-ghost !p-1.5" aria-label="Zoom out"><ZoomOut size={16} /></button>
            <button onClick={() => setZoom(1)} className="min-w-[3.5rem] rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:text-brand">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} className="btn btn-ghost !p-1.5" aria-label="Zoom in"><ZoomIn size={16} /></button>
          </div>
          <div className="p-4 lg:p-8">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform .15s ease" }}>
              <ResumePreview resume={resume} id="resume-export" />
            </div>
          </div>
        </section>
      </div>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="no-print fixed inset-0 z-[120] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="card w-full max-w-md rounded-2xl p-6"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Keyboard shortcuts</h2>
                <button onClick={() => setShowHelp(false)} className="btn btn-ghost !p-2" aria-label="Close"><X size={18} /></button>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Undo", "Ctrl / ⌘ + Z"],
                  ["Redo", "Ctrl / ⌘ + Shift + Z"],
                  ["Save now", "Ctrl / ⌘ + S"],
                  ["Print", "Ctrl / ⌘ + P"],
                  ["Jump to section", "Alt + 1…8"],
                  ["Toggle this help", "?"],
                ].map(([label, keys]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted">{label}</span>
                    <kbd className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-xs">{keys}</kbd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---------------- Editor router ---------------- */
function Editor({
  section,
  resume,
  update,
}: {
  section: Section;
  resume: Resume;
  update: (r: Resume) => void;
}) {
  const p = resume.personalInfo;
  const setP = (k: keyof typeof p, v: string) => update({ ...resume, personalInfo: { ...p, [k]: v } });

  const isEmpty = !p.fullName && resume.experiences.length === 0 && !resume.professionalSummary;

  if (section === "personal")
    return (
      <Panel title="Your essentials" note="Share only the contact details you want recruiters to see.">
        {isEmpty && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
            <p className="text-sm text-muted">New here? Load a sample resume to see how it all fits together.</p>
            <button type="button" className="btn btn-secondary text-sm" onClick={() => update(withSampleContent(resume))}>
              <Wand2 size={15} /> Load sample content
            </button>
          </div>
        )}
        <div className="mb-6 border-b border-line pb-6">
          <p className="label">Profile photo</p>
          <PhotoUploader value={resume.photoUrl} onChange={(v) => update({ ...resume, photoUrl: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["fullName", "Full name"],
              ["title", "Professional title"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["website", "Website"],
              ["linkedin", "LinkedIn"],
              ["github", "GitHub"],
            ] as [keyof typeof p, string][]
          ).map(([k, l]) => (
            <label key={k} className="block">
              <span className="label">{l}</span>
              <input className="field" type={k === "email" ? "email" : "text"} value={p[k]} onChange={(e) => setP(k, e.target.value)} />
            </label>
          ))}
        </div>
      </Panel>
    );

  if (section === "summary")
    return (
      <Panel title="A concise introduction" note="Aim for 2–4 specific sentences about the work you want to do next.">
        <textarea
          className="field min-h-40"
          maxLength={900}
          value={resume.professionalSummary}
          onChange={(e) => update({ ...resume, professionalSummary: e.target.value })}
          placeholder="Product designer with 6 years shaping research-led, accessible experiences…"
        />
        <p className="mt-2 text-xs text-muted">{resume.professionalSummary.length}/900 characters</p>
        <ImproveButton text={resume.professionalSummary} type="summary" onAccept={(v) => update({ ...resume, professionalSummary: v })} />
      </Panel>
    );

  if (section === "skills") return <ChipEditor title="Skills" note="Add clear, relevant terms a hiring team will recognize. Press Enter to add." field="skills" placeholder="e.g. User research" resume={resume} update={update} />;
  if (section === "interests") return <ChipEditor title="Interests" note="A few personal interests can add personality. Press Enter to add." field="interests" placeholder="e.g. Photography" resume={resume} update={update} />;
  if (section === "experience") return <Experiences resume={resume} update={update} />;
  if (section === "education") return <EducationList resume={resume} update={update} />;
  if (section === "projects") return <Projects resume={resume} update={update} />;
  if (section === "certifications") return <Certifications resume={resume} update={update} />;
  if (section === "languages") return <Languages resume={resume} update={update} />;
  if (section === "awards") return <Awards resume={resume} update={update} />;
  if (section === "publications") return <Publications resume={resume} update={update} />;
  if (section === "cover") return <CoverLetter resume={resume} update={update} />;
  if (section === "review") return <ReviewPanel resume={resume} update={update} />;
  if (section === "sections") return <SectionManager resume={resume} update={update} />;
  return <DesignPanel resume={resume} update={update} />;
}

/* ---------------- Cover letter (AI) ---------------- */
function CoverLetter({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const toast = useToast();

  async function generate() {
    if (resume.jobDescription.trim().length < 20) {
      setErr("Paste a job description first (at least 20 characters).");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const experiences = resume.experiences
        .flatMap((e) => [`${e.role}${e.company ? ` at ${e.company}` : ""}`, ...e.bullets])
        .filter(Boolean)
        .slice(0, 20);
      const r = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resume.personalInfo.fullName,
          title: resume.personalInfo.title,
          summary: resume.professionalSummary,
          experiences,
          skills: resume.skills,
          jobDescription: resume.jobDescription,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      update({ ...resume, coverLetter: data.coverLetter });
      toast("Cover letter generated", "success");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const blob = new Blob([resume.coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(resume.title || "cover-letter").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-cover-letter.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <h1 className="font-display text-3xl font-bold">AI cover letter</h1>
      <p className="mt-2 text-muted">Paste a job description and generate a tailored letter grounded in your resume — no invented facts.</p>

      <div className="card mt-7 rounded-2xl p-5">
        <label className="block">
          <span className="label">Job description</span>
          <textarea
            className="field min-h-32"
            value={resume.jobDescription}
            onChange={(e) => update({ ...resume, jobDescription: e.target.value })}
            placeholder="Paste the role's job description here…"
          />
        </label>
        {err && <p role="alert" className="mt-2 text-sm text-rose-500">{err}</p>}
        <button onClick={generate} disabled={busy} className="btn btn-primary mt-4">
          {busy ? <><Spinner size={16} /> Generating…</> : <><Sparkles size={16} /> Generate cover letter</>}
        </button>
      </div>

      {resume.coverLetter && (
        <div className="card mt-5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="label !mb-0">Your cover letter</p>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(resume.coverLetter); toast("Copied", "success"); }} className="btn btn-secondary !px-3 !py-1.5 text-xs">
                <Copy size={13} /> Copy
              </button>
              <button onClick={download} className="btn btn-secondary !px-3 !py-1.5 text-xs">
                <FileDown size={13} /> .txt
              </button>
            </div>
          </div>
          <textarea
            className="field mt-3 min-h-72 leading-6"
            value={resume.coverLetter}
            onChange={(e) => update({ ...resume, coverLetter: e.target.value })}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Shared panel shell ---------------- */
function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">{note}</p>
      <div className="card mt-7 rounded-2xl p-5">{children}</div>
    </motion.div>
  );
}

/* ---------------- Generic chip editor (Skills / Interests) ---------------- */
function ChipEditor({ title, note, field, placeholder, resume, update }: { title: string; note: string; field: "skills" | "interests"; placeholder: string; resume: Resume; update: (r: Resume) => void }) {
  const [value, setValue] = useState("");
  const items = resume[field];
  const add = () => {
    if (value.trim()) {
      update({ ...resume, [field]: [...items, value.trim()] });
      setValue("");
    }
  };
  return (
    <Panel title={title} note={note}>
      <div className="flex gap-2">
        <input className="field" value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} />
        <button className="btn btn-primary" onClick={add} type="button">Add</button>
      </div>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted">Nothing yet — add a few above.</p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((x, i) => (
            <button key={`${x}-${i}`} onClick={() => update({ ...resume, [field]: items.filter((_, j) => j !== i) })}
              className="chip bg-brand/12 text-brand transition-colors hover:bg-rose-500/15 hover:text-rose-500" type="button">
              {x} ×
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}

