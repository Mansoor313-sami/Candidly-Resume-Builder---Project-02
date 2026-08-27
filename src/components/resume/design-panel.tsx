"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Copy, Download, FileText, Link2, Tag, Upload } from "lucide-react";
import type { Resume } from "@/types/resume";
import { blankResume, DEFAULT_ACCENT } from "@/types/resume";
import { isSlugAvailable, toSlug } from "@/lib/resume-service";
import { exportResumeDocx } from "@/lib/docx";
import { TemplateGallery } from "@/components/resume/template-gallery";
import { FontPicker } from "@/components/resume/font-picker";
import { ACCENT_PRESETS } from "@/components/resume/templates";
import { Spinner } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";

export function DesignPanel({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const toast = useToast();
  const [slugInput, setSlugInput] = useState(resume.slug);
  const [slugState, setSlugState] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [qr, setQr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/resume/${resume.slug}`;

  // Generate a QR code for the public link.
  useEffect(() => {
    let cancelled = false;
    if (!resume.isPublic || !resume.slug) { setQr(""); return; }
    (async () => {
      try {
        const QR = await import("qrcode");
        const data = await QR.toDataURL(link, { width: 220, margin: 1 });
        if (!cancelled) setQr(data);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [resume.isPublic, resume.slug, link]);

  async function saveSlug() {
    const clean = toSlug(slugInput);
    if (!clean) { setSlugState("taken"); return; }
    if (clean === resume.slug) { setSlugState("ok"); return; }
    setSlugState("checking");
    const free = await isSlugAvailable(clean, resume.id);
    if (free) {
      update({ ...resume, slug: clean });
      setSlugInput(clean);
      setSlugState("ok");
      toast("Link updated", "success");
    } else {
      setSlugState("taken");
    }
  }

  function exportJson() {
    const { id, ownerId, createdAt, updatedAt, viewCount, lastViewedAt, ...data } = resume;
    void id; void ownerId; void createdAt; void updatedAt; void viewCount; void lastViewedAt;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toSlug(resume.title) || "resume"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Keep identity fields; overlay imported content on top of defaults.
        update({ ...blankResume(resume.id), ...parsed, id: resume.id, ownerId: resume.ownerId, slug: resume.slug, title: resume.title });
        toast("Resume imported", "success");
      } catch {
        toast("That file isn't valid resume JSON", "error");
      }
    };
    reader.readAsText(file);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <h1 className="font-display text-3xl font-bold">Design & sharing</h1>
      <p className="mt-2 text-muted">Switch templates, recolor, and control how you share — content never changes.</p>

      <div className="card mt-7 rounded-2xl p-5">
        <p className="label">Template</p>
        <TemplateGallery value={resume.templateId} onChange={(id) => update({ ...resume, templateId: id })} accent={resume.accentColor || DEFAULT_ACCENT} showLabels={false} columns="grid-cols-3 sm:grid-cols-4" />
      </div>

      <div className="card mt-5 rounded-2xl p-5">
        <p className="label">Font pairing</p>
        <FontPicker value={resume.fontId} onChange={(id) => update({ ...resume, fontId: id })} />
      </div>

      <div className="card mt-5 rounded-2xl p-5">
        <p className="label">Accent color</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {ACCENT_PRESETS.map((c) => (
            <button key={c} type="button" onClick={() => update({ ...resume, accentColor: c })} aria-label={`Accent ${c}`}
              className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110 ${resume.accentColor === c ? "ring-brand" : "ring-transparent"}`} style={{ background: c }} />
          ))}
          <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="color" value={resume.accentColor || DEFAULT_ACCENT} onChange={(e) => update({ ...resume, accentColor: e.target.value })} className="h-8 w-8 cursor-pointer rounded-full border border-line bg-transparent p-0" />
            Custom
          </label>
        </div>
      </div>

      {/* Label / variant tag */}
      <div className="card mt-5 rounded-2xl p-5">
        <p className="label flex items-center gap-2"><Tag size={13} /> Label (for grouping variants)</p>
        <input className="field max-w-xs" value={resume.tag} onChange={(e) => update({ ...resume, tag: e.target.value })} placeholder="e.g. Software, Design, Internship" />
      </div>

      {/* Sharing */}
      <div className="card mt-5 rounded-2xl p-5">
        <p className="label">Public sharing</p>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--brand))]" checked={resume.isPublic} onChange={(e) => update({ ...resume, isPublic: e.target.checked })} />
          <span>
            <b className="text-ink">Public share link</b>
            <p className="text-sm text-muted">When on, anyone with the link can view this resume. Off by default.</p>
          </span>
        </label>

        {resume.isPublic && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="label flex items-center gap-2"><Link2 size={13} /> Custom link</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">/resume/</span>
                <input className="field max-w-[220px]" value={slugInput} onChange={(e) => { setSlugInput(e.target.value); setSlugState("idle"); }} />
                <button type="button" onClick={saveSlug} className="btn btn-secondary text-sm">{slugState === "checking" ? <Spinner size={14} /> : "Save"}</button>
                <button type="button" onClick={() => { navigator.clipboard.writeText(link); toast("Link copied", "success"); }} className="btn btn-secondary text-sm"><Copy size={14} /> Copy</button>
              </div>
              {slugState === "ok" && <p className="mt-1 text-xs text-emerald-600">Saved.</p>}
              {slugState === "taken" && <p className="mt-1 text-xs text-rose-500">That link is taken or invalid — try another.</p>}
            </div>

            {qr && (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code for public link" className="h-28 w-28 rounded-lg border border-line bg-white p-1" />
                <div className="text-sm text-muted">
                  <p className="font-semibold text-ink">Scan to open</p>
                  <p>Recruiters can scan this to view your resume instantly.</p>
                  <p className="mt-1 flex items-center gap-1 text-xs"><span className="text-brand">👁</span> {resume.viewCount || 0} views</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export & backup */}
      <div className="card mt-5 rounded-2xl p-5">
        <p className="label">Export & backup</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportResumeDocx(resume, `${toSlug(resume.title) || "resume"}.docx`)} className="btn btn-secondary text-sm"><FileText size={15} /> Export Word (.docx)</button>
          <button type="button" onClick={exportJson} className="btn btn-secondary text-sm"><Download size={15} /> Export JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary text-sm"><Upload size={15} /> Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
        </div>
        <p className="mt-2 text-xs text-muted">JSON is a full backup you can re-import later. PDF export lives in the top bar.</p>
      </div>
    </motion.div>
  );
}
