"use client";

import { Check } from "lucide-react";
import type { FontId } from "@/types/resume";
import { FONTS } from "@/lib/fonts";

/**
 * Curated font-pairing picker. Each swatch previews the pairing in its own
 * fonts (heading + body), so users see the look before applying.
 */
export function FontPicker({ value, onChange }: { value: FontId; onChange: (id: FontId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FONTS.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`relative rounded-xl border-2 p-3 text-left transition-all ${
              active ? "border-brand shadow-glow" : "border-line hover:border-brand/40"
            }`}
          >
            {active && (
              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                <Check size={12} />
              </span>
            )}
            <div className="text-xl font-bold text-ink" style={{ fontFamily: `${f.head}, sans-serif` }}>
              Aa
            </div>
            <div className="mt-0.5 text-sm text-muted" style={{ fontFamily: `${f.body}, sans-serif` }}>
              {f.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
