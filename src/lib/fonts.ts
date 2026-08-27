import type { FontId } from "@/types/resume";

/**
 * Curated font pairings applied to the resume paper. `head` is used for the
 * name and section titles; `body` for content. Families are loaded once via
 * the stylesheet <link> in app/layout.tsx. Each pairing resolves to CSS
 * variables (--rf-head / --rf-body) set on the resume paper.
 */
export const FONTS: { id: FontId; name: string; head: string; body: string }[] = [
  { id: "modern", name: "Modern", head: "'Sora'", body: "'Inter'" },
  { id: "elegant", name: "Elegant", head: "'Playfair Display'", body: "'Lora'" },
  { id: "classic", name: "Classic", head: "'Fraunces'", body: "'Inter'" },
  { id: "technical", name: "Technical", head: "'Space Grotesk'", body: "'Inter'" },
  { id: "literary", name: "Literary", head: "'Fraunces'", body: "'Lora'" },
];

export function fontVars(fontId: FontId): React.CSSProperties {
  const f = FONTS.find((x) => x.id === fontId) ?? FONTS[0];
  return {
    // consumed by .rf-head / .rf-body utilities in globals.css
    ["--rf-head" as string]: `${f.head}, 'Sora', system-ui, sans-serif`,
    ["--rf-body" as string]: `${f.body}, 'Inter', system-ui, sans-serif`,
  };
}
