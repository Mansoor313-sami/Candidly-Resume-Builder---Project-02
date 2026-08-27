"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Check, FileText, Plus, Sparkles, Target, X } from "lucide-react";
import type { Resume } from "@/types/resume";
import { checklist, keywordAnalysis, score, writingIssues } from "@/lib/ats";
import { Spinner } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";

/** A4 height in CSS px at 96dpi, used to estimate page count from the preview. */
const A4_PX = (297 * 96) / 25.4;

function ringColor(v: number) {
  return v >= 75 ? "#16a34a" : v >= 50 ? "#d97706" : "#dc2626";
}

export function ReviewPanel({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const [pages, setPages] = useState<number | undefined>(undefined);
  const [tailoring, setTailoring] = useState(false);
  const toast = useToast();

  // Measure the live preview to estimate page count.
  useEffect(() => {
    const measure = () => {
      const node = document.getElementById("resume-export");
      if (node) setPages(Math.max(1, Math.ceil(node.getBoundingClientRect().height / A4_PX)));
    };
    const t = setTimeout(measure, 350);
    return () => clearTimeout(t);
  }, [resume]);

  const s = score(resume, pages);
  const checks = checklist(resume, pages);
  const issues = writingIssues(resume);
  const kw = keywordAnalysis(resume, resume.jobDescription);

  const dash = 2 * Math.PI * 52;

  async function tailor() {
    if (resume.jobDescription.trim().length < 20) {
      toast("Paste a job description first", "error");
      return;
    }
    setTailoring(true);
    try {
      const r = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resume.personalInfo.title,
          summary: resume.professionalSummary,
          skills: resume.skills,
          experiences: resume.experiences.flatMap((e) => [`${e.role} at ${e.company}`, ...e.bullets]).filter(Boolean).slice(0, 20),
          jobDescription: resume.jobDescription,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      const addSkills = (data.suggestedSkills as string[] | undefined)?.filter((x) => !resume.skills.includes(x)) || [];
      update({ ...resume, professionalSummary: data.summary || resume.professionalSummary, skills: [...resume.skills, ...addSkills] });
      toast("Resume tailored to the job", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Tailoring failed", "error");
    } finally {
      setTailoring(false);
    }
  }

  function addMissingSkills() {
    if (!kw) return;
    const add = kw.missing.filter((m) => m.length >= 3 && !resume.skills.includes(m)).slice(0, 12);
    update({ ...resume, skills: [...resume.skills, ...add] });
    toast(`Added ${add.length} keywords to Skills`, "success");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Resume review</h1>
        <p className="mt-2 text-muted">A quick, ATS-style health check with concrete fixes.</p>
      </div>

      {/* Score + fit */}
      <div className="card flex flex-wrap items-center gap-6 rounded-2xl p-5">
        <div className="relative grid h-32 w-32 place-items-center">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r="52" fill="none" stroke="rgb(var(--muted) / 0.2)" strokeWidth="10" />
            <motion.circle
              cx="64" cy="64" r="52" fill="none" stroke={ringColor(s)} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={dash} initial={{ strokeDashoffset: dash }} animate={{ strokeDashoffset: dash * (1 - s / 100) }} transition={{ duration: 0.8 }}
            />
          </svg>
          <div className="absolute text-center">
            <div className="font-display text-3xl font-bold">{s}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">score</div>
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <p className="font-semibold">{s >= 75 ? "Looking strong 🎉" : s >= 50 ? "Getting there" : "Needs work"}</p>
          <p className="mt-1 text-sm text-muted">{checks.filter((c) => c.ok).length} of {checks.length} checks passed.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
            <FileText size={15} className="text-brand" />
            {pages == null ? "Measuring…" : pages === 1 ? "Fits on 1 page" : `${pages} pages — consider trimming`}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="card rounded-2xl p-5">
        <p className="label">Checklist</p>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3 text-sm">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.ok ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
                {c.ok ? <Check size={13} /> : <X size={13} />}
              </span>
              <span>
                <b className={c.ok ? "" : "text-ink"}>{c.label}</b>
                {!c.ok && <span className="text-muted"> — {c.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Writing suggestions */}
      <div className="card rounded-2xl p-5">
        <p className="label">Writing suggestions</p>
        {issues.length === 0 ? (
          <p className="text-sm text-muted">No obvious issues — your bullets read cleanly. 👌</p>
        ) : (
          <ul className="space-y-2.5">
            {issues.map((it, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center gap-2 text-amber-600"><AlertTriangle size={14} /> {it.issue}</div>
                <p className="mt-0.5 line-clamp-1 pl-6 text-muted">“{it.text}”</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Keyword match vs job description */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <p className="label !mb-0 flex items-center gap-2"><Target size={14} /> Job match</p>
          <button onClick={tailor} disabled={tailoring} className="btn btn-primary !px-3 !py-1.5 text-xs">
            {tailoring ? <><Spinner size={13} /> Tailoring…</> : <><Sparkles size={13} /> Tailor to job (AI)</>}
          </button>
        </div>
        <textarea
          className="field mt-3 min-h-28"
          value={resume.jobDescription}
          onChange={(e) => update({ ...resume, jobDescription: e.target.value })}
          placeholder="Paste a job description to see which keywords you're matching and missing…"
        />
        {kw && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand/15">
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2" style={{ width: `${kw.matchPct}%` }} />
              </div>
              <span className="text-sm font-bold text-brand">{kw.matchPct}% match</span>
            </div>
            {kw.missing.length > 0 && (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Missing keywords</span>
                  <button onClick={addMissingSkills} className="btn btn-ghost !px-2 !py-1 text-xs text-brand"><Plus size={12} /> Add to skills</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kw.missing.map((m) => <span key={m} className="chip bg-amber-500/12 text-amber-700 dark:text-amber-300">{m}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
