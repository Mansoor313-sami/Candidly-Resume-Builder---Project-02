"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { TemplateId } from "@/types/resume";
import { TEMPLATES, CATEGORIES, type Category } from "@/components/resume/templates";
import { TemplateThumb } from "@/components/resume/template-thumb";

/**
 * Reusable template picker with category filter tabs. Used both on the
 * new-resume screen and in the builder's Design tab.
 */
export function TemplateGallery({
  value,
  onChange,
  accent = "#7c3aed",
  showLabels = true,
  columns = "grid-cols-2 sm:grid-cols-3",
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  accent?: string;
  showLabels?: boolean;
  columns?: string;
}) {
  const [filter, setFilter] = useState<Category | "All">("All");
  const list = filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`chip transition-colors ${
              filter === c ? "bg-brand text-white" : "border border-line bg-surface/60 text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${columns}`}>
        {list.map((t, i) => {
          const active = value === t.id;
          return (
            <motion.button
              type="button"
              key={t.id}
              layout
              onClick={() => onChange(t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
              className={`group relative rounded-2xl border-2 p-1.5 text-left transition-all ${
                active ? "border-brand shadow-glow" : "border-line hover:border-brand/40"
              }`}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-lg border border-line">
                <TemplateThumb templateId={t.id} accent={accent} />
              </div>
              {active && (
                <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                  <Check size={12} />
                </span>
              )}
              {showLabels && (
                <div className="px-1 pb-0.5 pt-2">
                  <b className="text-sm">{t.name}</b>
                  <p className="text-xs leading-4 text-muted">{t.description}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
