"use client";

import { motion, Reorder, useDragControls } from "motion/react";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { Resume, SectionKey } from "@/types/resume";
import { ALL_SECTIONS, SECTION_LABELS } from "@/types/resume";

/**
 * Manage which sections appear and in what order. Drag to reorder; toggle the
 * eye to add/remove a section from the resume. Optional sections (Certifications,
 * Languages, Awards, Publications, Interests) start hidden and are "added" here.
 */
export function SectionManager({ resume, update }: { resume: Resume; update: (r: Resume) => void }) {
  const order: SectionKey[] = resume.sectionOrder?.length ? resume.sectionOrder : [...ALL_SECTIONS];
  const full = [...order, ...ALL_SECTIONS.filter((s) => !order.includes(s))];
  const hidden = new Set(resume.hiddenSections || []);

  const toggle = (k: SectionKey) => {
    const next = new Set(hidden);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    update({ ...resume, hiddenSections: [...next] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <h1 className="font-display text-3xl font-bold">Sections</h1>
      <p className="mt-2 text-muted">Add, remove, and reorder the sections on your resume.</p>

      <div className="card mt-7 rounded-2xl p-3">
        <Reorder.Group axis="y" values={full} onReorder={(v) => update({ ...resume, sectionOrder: v as SectionKey[] })} as="div" className="space-y-1.5">
          {full.map((k) => (
            <Row key={k} k={k} hidden={hidden.has(k)} onToggle={() => toggle(k)} />
          ))}
        </Reorder.Group>
      </div>
    </motion.div>
  );
}

function Row({ k, hidden, onToggle }: { k: SectionKey; hidden: boolean; onToggle: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={k} dragListener={false} dragControls={controls} as="div"
      className={`flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 ${hidden ? "opacity-55" : "bg-surface/50"}`}>
      <button type="button" onPointerDown={(e) => controls.start(e)} aria-label="Drag to reorder"
        className="cursor-grab touch-none text-muted transition-colors hover:text-brand active:cursor-grabbing">
        <GripVertical size={18} />
      </button>
      <span className="flex-1 font-semibold">{SECTION_LABELS[k]}</span>
      <button type="button" onClick={onToggle} aria-label={hidden ? `Add ${SECTION_LABELS[k]}` : `Hide ${SECTION_LABELS[k]}`}
        className={`btn !px-3 !py-1.5 text-xs ${hidden ? "btn-secondary" : "btn-ghost text-brand"}`}>
        {hidden ? <><Eye size={14} /> Add</> : <><EyeOff size={14} /> Hide</>}
      </button>
    </Reorder.Item>
  );
}
