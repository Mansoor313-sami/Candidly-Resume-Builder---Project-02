"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/motion";
import type { Resume, Experience, Education, Project, Certification, LanguageItem, Award, Publication } from "@/types/resume";
import { LANGUAGE_LEVELS } from "@/types/resume";
import { uid } from "@/lib/utils";
import { ImproveButton } from "@/components/ai/improve-button";

/* Shared building blocks so the three list editors stay consistent. */
const IconBtn = ({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) => (
  <button type="button" onClick={onClick} aria-label={label} className="btn btn-secondary !px-2.5 !py-2 text-sm">
    {children}
  </button>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="label">{label}</span>
    <input className="field" value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const Header = ({ title, note }: { title: string; note: string }) => (
  <div>
    <h1 className="font-display text-3xl font-bold">{title}</h1>
    <p className="mt-2 text-muted">{note}</p>
  </div>
);

const EmptyHint = ({ text }: { text: string }) => (
  <div className="card rounded-2xl border-dashed p-6 text-center text-sm text-muted">{text}</div>
);

/** AI bullet generator: a short description → 3 polished bullet options. */
function BulletGenerator({ role, onAdd }: { role: string; onAdd: (b: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<string[]>([]);
  const [err, setErr] = useState("");
  async function gen() {
    if (prompt.trim().length < 4) { setErr("Describe what you did (a few words)."); return; }
    setBusy(true); setErr(""); setOpts([]);
    try {
      const r = await fetch("/api/ai/bullets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, role }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOpts(d.options);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setBusy(false); }
  }
  return (
    <div className="mt-4 rounded-xl border border-brand/25 bg-brand/5 p-3">
      <p className="label !mb-1.5 flex items-center gap-1.5"><Sparkles size={13} className="text-brand" /> Generate bullets with AI</p>
      <div className="flex gap-2">
        <input className="field" placeholder="e.g. managed a team of 5 and cut costs 20%" value={prompt}
          onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); gen(); } }} />
        <button type="button" className="btn btn-primary shrink-0" onClick={gen} disabled={busy}>{busy ? <Spinner size={15} /> : "Generate"}</button>
      </div>
      {err && <p className="mt-1.5 text-xs text-rose-500">{err}</p>}
      {opts.map((o, i) => (
        <div key={i} className="mt-2 flex items-start gap-2 rounded-lg bg-surface p-2 text-sm">
          <p className="flex-1 leading-5">{o}</p>
          <button type="button" onClick={() => { onAdd(o); setOpts(opts.filter((_, j) => j !== i)); }} className="btn btn-secondary shrink-0 !px-2 !py-1 text-xs"><Plus size={12} /> Add</button>
        </div>
      ))}
    </div>
  );
}

/**
 * A draggable card. Drag is initiated ONLY from the grip handle
 * (dragListener={false}) so typing in the fields never starts a drag.
 */
function SortableCard<T>({ value, index, label, onRemove, children }: { value: T; index: number; label: string; onRemove: () => void; children: React.ReactNode }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={value} dragListener={false} dragControls={controls} as="div" className="card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            aria-label="Drag to reorder"
            className="cursor-grab touch-none text-muted transition-colors hover:text-brand active:cursor-grabbing"
          >
            <GripVertical size={18} />
          </button>
          <b className="text-muted">{label} {index + 1}</b>
        </div>
        <IconBtn label={`Remove ${label}`} onClick={onRemove}>
          <Trash2 size={15} />
        </IconBtn>
      </div>
      {children}
    </Reorder.Item>
  );
}

/* ---------------- EXPERIENCE ---------------- */
export function Experiences({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Experience) => update({ ...resume, experiences: resume.experiences.map((x, j) => (j === i ? v : x)) });
  const moveBullet = (i: number, bi: number, dir: -1 | 1) => {
    const x = resume.experiences[i];
    const b = [...x.bullets];
    const to = bi + dir;
    if (to < 0 || to >= b.length) return;
    [b[bi], b[to]] = [b[to], b[bi]];
    set(i, { ...x, bullets: b });
  };

  return (
    <div className="space-y-5">
      <Header title="Experience" note="Drag the handle to reorder roles. Use AI assist on any bullet." />
      {resume.experiences.length === 0 && <EmptyHint text="No roles yet — add your first below." />}

      <Reorder.Group axis="y" values={resume.experiences} onReorder={(v) => update({ ...resume, experiences: v })} as="div" className="space-y-5">
        {resume.experiences.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Role" onRemove={() => update({ ...resume, experiences: resume.experiences.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Job title" value={x.role} onChange={(v) => set(i, { ...x, role: v })} />
              <Field label="Company" value={x.company} onChange={(v) => set(i, { ...x, company: v })} />
              <Field label="Location" value={x.location} onChange={(v) => set(i, { ...x, location: v })} />
              <Field label="Start date" value={x.startDate} onChange={(v) => set(i, { ...x, startDate: v })} />
              <Field label="End date" value={x.endDate} onChange={(v) => set(i, { ...x, endDate: v })} />
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--brand))]" checked={x.current} onChange={(e) => set(i, { ...x, current: e.target.checked })} />
                I currently work here
              </label>
            </div>

            <p className="label mt-6">Accomplishments</p>
            {x.bullets.map((b, bi) => (
              <div className="mb-3" key={bi}>
                <div className="flex gap-2">
                  <div className="flex flex-col">
                    <button type="button" className="text-muted hover:text-brand disabled:opacity-30" disabled={bi === 0} onClick={() => moveBullet(i, bi, -1)} aria-label="Move bullet up"><ChevronUp size={16} /></button>
                    <button type="button" className="text-muted hover:text-brand disabled:opacity-30" disabled={bi === x.bullets.length - 1} onClick={() => moveBullet(i, bi, 1)} aria-label="Move bullet down"><ChevronDown size={16} /></button>
                  </div>
                  <textarea
                    className="field min-h-20"
                    value={b}
                    placeholder="Led / built / improved…"
                    onChange={(e) => set(i, { ...x, bullets: x.bullets.map((y, j) => (j === bi ? e.target.value : y)) })}
                  />
                  <button type="button" className="text-rose-500" onClick={() => set(i, { ...x, bullets: x.bullets.filter((_, j) => j !== bi) })} aria-label="Remove bullet">
                    <Trash2 size={16} />
                  </button>
                </div>
                <ImproveButton text={b} type="experience" onAccept={(v) => set(i, { ...x, bullets: x.bullets.map((y, j) => (j === bi ? v : y)) })} />
              </div>
            ))}
            <IconBtn label="Add bullet" onClick={() => set(i, { ...x, bullets: [...x.bullets, ""] })}>
              <Plus size={15} /> Add bullet
            </IconBtn>
            <BulletGenerator role={x.role} onAdd={(b) => set(i, { ...x, bullets: [...x.bullets.filter(Boolean), b] })} />
          </SortableCard>
        ))}
      </Reorder.Group>

      <button
        onClick={() => update({ ...resume, experiences: [...resume.experiences, { id: uid(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] }] })}
        className="btn btn-primary"
        type="button"
      >
        <Plus size={16} /> Add experience
      </button>
    </div>
  );
}

/* ---------------- EDUCATION ---------------- */
export function EducationList({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Education) => update({ ...resume, education: resume.education.map((x, j) => (j === i ? v : x)) });

  return (
    <div className="space-y-5">
      <Header title="Education" note="Drag to reorder. Include academic work that supports your story." />
      {resume.education.length === 0 && <EmptyHint text="No education entries yet." />}

      <Reorder.Group axis="y" values={resume.education} onReorder={(v) => update({ ...resume, education: v })} as="div" className="space-y-5">
        {resume.education.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Education" onRemove={() => update({ ...resume, education: resume.education.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["institution", "Institution"],
                  ["degree", "Degree"],
                  ["field", "Field of study"],
                  ["location", "Location"],
                  ["startDate", "Start date"],
                  ["endDate", "End date"],
                ] as [keyof Education, string][]
              ).map(([k, l]) => (
                <Field key={k} label={l} value={x[k] as string} onChange={(v) => set(i, { ...x, [k]: v })} />
              ))}
            </div>
          </SortableCard>
        ))}
      </Reorder.Group>

      <button
        onClick={() => update({ ...resume, education: [...resume.education, { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "", location: "" }] })}
        className="btn btn-primary"
        type="button"
      >
        <Plus size={16} /> Add education
      </button>
    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
export function Projects({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Project) => update({ ...resume, projects: resume.projects.map((x, j) => (j === i ? v : x)) });

  return (
    <div className="space-y-5">
      <Header title="Projects" note="Drag to reorder. Show practical work, the tools you used, and where to see it." />
      {resume.projects.length === 0 && <EmptyHint text="No projects yet — great for portfolios." />}

      <Reorder.Group axis="y" values={resume.projects} onReorder={(v) => update({ ...resume, projects: v })} as="div" className="space-y-5">
        {resume.projects.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Project" onRemove={() => update({ ...resume, projects: resume.projects.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Project name" value={x.name} onChange={(v) => set(i, { ...x, name: v })} />
              <Field label="Technologies (comma separated)" value={x.technologies.join(", ")} onChange={(v) => set(i, { ...x, technologies: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <Field label="Project URL" value={x.url} onChange={(v) => set(i, { ...x, url: v })} />
              <Field label="Repository URL" value={x.repositoryUrl} onChange={(v) => set(i, { ...x, repositoryUrl: v })} />
            </div>
            <label className="mt-4 block">
              <span className="label">Description</span>
              <textarea className="field min-h-24" value={x.description} onChange={(e) => set(i, { ...x, description: e.target.value })} />
            </label>
            <ImproveButton text={x.description} type="project" onAccept={(v) => set(i, { ...x, description: v })} />
          </SortableCard>
        ))}
      </Reorder.Group>

      <button
        onClick={() => update({ ...resume, projects: [...resume.projects, { id: uid(), name: "", description: "", technologies: [], url: "", repositoryUrl: "" }] })}
        className="btn btn-primary"
        type="button"
      >
        <Plus size={16} /> Add project
      </button>
    </div>
  );
}

/* ---------------- CERTIFICATIONS ---------------- */
export function Certifications({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Certification) => update({ ...resume, certifications: resume.certifications.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="space-y-5">
      <Header title="Certifications" note="Add credentials, licenses, and courses. Drag to reorder." />
      {resume.certifications.length === 0 && <EmptyHint text="No certifications yet." />}
      <Reorder.Group axis="y" values={resume.certifications} onReorder={(v) => update({ ...resume, certifications: v })} as="div" className="space-y-5">
        {resume.certifications.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Certification" onRemove={() => update({ ...resume, certifications: resume.certifications.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={x.name} onChange={(v) => set(i, { ...x, name: v })} />
              <Field label="Issuer" value={x.issuer} onChange={(v) => set(i, { ...x, issuer: v })} />
              <Field label="Date" value={x.date} onChange={(v) => set(i, { ...x, date: v })} />
              <Field label="Credential URL" value={x.url} onChange={(v) => set(i, { ...x, url: v })} />
            </div>
          </SortableCard>
        ))}
      </Reorder.Group>
      <button type="button" className="btn btn-primary" onClick={() => update({ ...resume, certifications: [...resume.certifications, { id: uid(), name: "", issuer: "", date: "", url: "" }] })}>
        <Plus size={16} /> Add certification
      </button>
    </div>
  );
}

/* ---------------- LANGUAGES ---------------- */
export function Languages({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: LanguageItem) => update({ ...resume, languages: resume.languages.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="space-y-5">
      <Header title="Languages" note="List languages and your proficiency in each." />
      {resume.languages.length === 0 && <EmptyHint text="No languages yet." />}
      <Reorder.Group axis="y" values={resume.languages} onReorder={(v) => update({ ...resume, languages: v })} as="div" className="space-y-5">
        {resume.languages.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Language" onRemove={() => update({ ...resume, languages: resume.languages.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Language" value={x.name} onChange={(v) => set(i, { ...x, name: v })} />
              <label className="block">
                <span className="label">Proficiency</span>
                <select className="field" value={x.proficiency} onChange={(e) => set(i, { ...x, proficiency: e.target.value })}>
                  <option value="">Select…</option>
                  {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
          </SortableCard>
        ))}
      </Reorder.Group>
      <button type="button" className="btn btn-primary" onClick={() => update({ ...resume, languages: [...resume.languages, { id: uid(), name: "", proficiency: "" }] })}>
        <Plus size={16} /> Add language
      </button>
    </div>
  );
}

/* ---------------- AWARDS ---------------- */
export function Awards({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Award) => update({ ...resume, awards: resume.awards.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="space-y-5">
      <Header title="Awards" note="Recognitions, honors, and scholarships. Drag to reorder." />
      {resume.awards.length === 0 && <EmptyHint text="No awards yet." />}
      <Reorder.Group axis="y" values={resume.awards} onReorder={(v) => update({ ...resume, awards: v })} as="div" className="space-y-5">
        {resume.awards.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Award" onRemove={() => update({ ...resume, awards: resume.awards.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title" value={x.title} onChange={(v) => set(i, { ...x, title: v })} />
              <Field label="Issuer" value={x.issuer} onChange={(v) => set(i, { ...x, issuer: v })} />
              <Field label="Date" value={x.date} onChange={(v) => set(i, { ...x, date: v })} />
            </div>
            <label className="mt-4 block">
              <span className="label">Description (optional)</span>
              <textarea className="field min-h-16" value={x.description} onChange={(e) => set(i, { ...x, description: e.target.value })} />
            </label>
          </SortableCard>
        ))}
      </Reorder.Group>
      <button type="button" className="btn btn-primary" onClick={() => update({ ...resume, awards: [...resume.awards, { id: uid(), title: "", issuer: "", date: "", description: "" }] })}>
        <Plus size={16} /> Add award
      </button>
    </div>
  );
}

/* ---------------- PUBLICATIONS ---------------- */
export function Publications({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const set = (i: number, v: Publication) => update({ ...resume, publications: resume.publications.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="space-y-5">
      <Header title="Publications" note="Papers, articles, and talks. Drag to reorder." />
      {resume.publications.length === 0 && <EmptyHint text="No publications yet." />}
      <Reorder.Group axis="y" values={resume.publications} onReorder={(v) => update({ ...resume, publications: v })} as="div" className="space-y-5">
        {resume.publications.map((x, i) => (
          <SortableCard key={x.id} value={x} index={i} label="Publication" onRemove={() => update({ ...resume, publications: resume.publications.filter((_, j) => j !== i) })}>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title" value={x.title} onChange={(v) => set(i, { ...x, title: v })} />
              <Field label="Publisher / Venue" value={x.publisher} onChange={(v) => set(i, { ...x, publisher: v })} />
              <Field label="Date" value={x.date} onChange={(v) => set(i, { ...x, date: v })} />
              <Field label="URL" value={x.url} onChange={(v) => set(i, { ...x, url: v })} />
            </div>
          </SortableCard>
        ))}
      </Reorder.Group>
      <button type="button" className="btn btn-primary" onClick={() => update({ ...resume, publications: [...resume.publications, { id: uid(), title: "", publisher: "", date: "", url: "" }] })}>
        <Plus size={16} /> Add publication
      </button>
    </div>
  );
}
