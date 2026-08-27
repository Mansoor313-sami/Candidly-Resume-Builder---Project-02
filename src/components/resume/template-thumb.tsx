import type { TemplateId } from "@/types/resume";
import { TEMPLATES } from "@/components/resume/templates";

/**
 * A tiny, stylized preview of each template used in pickers and cards.
 * It reads the template's config from the registry and mimics its header
 * and layout so 20 templates stay visually distinguishable at a glance.
 * Lightweight (grey bars + accent) — not a full render — so galleries are fast.
 */
export function TemplateThumb({ templateId, accent = "#7c3aed" }: { templateId: TemplateId; accent?: string }) {
  const cfg = (TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]).cfg;
  const acc = cfg.mono ? "#334155" : accent;
  const line = "h-1 rounded bg-slate-100";
  const body = (
    <div className="space-y-1">
      <div className={`${line} w-full`} />
      <div className={`${line} w-11/12`} />
      <div className={`${line} w-4/5`} />
    </div>
  );

  // Sidebar layouts
  if (cfg.layout === "left" || cfg.layout === "right") {
    const rail = (
      <div className="w-1/3 p-1.5" style={{ background: acc }}>
        {cfg.photo && <div className="mx-auto mb-1 h-3 w-3 rounded-full bg-white/70" />}
        <div className="h-1.5 w-full rounded bg-white/70" />
        <div className="mt-1 h-1 w-2/3 rounded bg-white/50" />
        <div className="mt-2.5 space-y-1">
          <div className="h-1 w-full rounded bg-white/40" />
          <div className="h-1 w-3/4 rounded bg-white/40" />
        </div>
      </div>
    );
    const main = (
      <div className="flex-1 space-y-1.5 p-2">
        <div className="h-1.5 w-1/2 rounded" style={{ background: acc }} />
        {body}
        {body}
      </div>
    );
    return (
      <div className="flex h-full overflow-hidden rounded-md bg-white">
        {cfg.layout === "left" ? (<>{rail}{main}</>) : (<>{main}{rail}</>)}
      </div>
    );
  }

  const band = cfg.header === "band" || cfg.header === "gradient";
  const centered = cfg.header === "centered";
  return (
    <div className="h-full overflow-hidden rounded-md bg-white">
      {band ? (
        <div className="flex items-center gap-1.5 p-2" style={{ background: acc }}>
          {cfg.photo && <div className="h-4 w-4 rounded-full bg-white/70" />}
          <div>
            <div className="h-2 w-16 rounded bg-white/80" />
            <div className="mt-1 h-1 w-10 rounded bg-white/50" />
          </div>
        </div>
      ) : (
        <div className="p-2.5">
          {cfg.header === "plain" && !cfg.mono && <div className="mb-1.5 h-1 w-full rounded" style={{ background: acc }} />}
          <div className={centered ? "text-center" : cfg.header === "split" || cfg.header === "compact" ? "flex items-baseline justify-between" : ""}>
            <div>
              <div className={`h-2 rounded bg-slate-300 ${centered ? "mx-auto w-1/2" : "w-2/3"}`} />
              <div className={`mt-1 h-1 rounded ${centered ? "mx-auto w-1/3" : "w-1/2"}`} style={{ background: acc, opacity: 0.6 }} />
            </div>
            {(cfg.header === "split" || cfg.header === "compact") && <div className="h-1 w-1/3 rounded bg-slate-200" />}
          </div>
          {centered && <div className="mx-auto mt-1 h-px w-6" style={{ background: acc }} />}
        </div>
      )}
      <div className={`space-y-1.5 px-2.5 pb-2.5 ${band ? "pt-2" : ""}`}>
        <div className={`h-1.5 w-1/3 rounded ${cfg.heading === "leftbar" ? "border-l-2 pl-1" : ""}`} style={{ background: acc, opacity: cfg.heading === "block" ? 1 : 0.5 }} />
        <div className={cfg.boxed ? "rounded border border-slate-200 p-1" : ""}>{body}</div>
        <div className="h-1.5 w-1/4 rounded" style={{ background: acc, opacity: 0.5 }} />
        <div className={cfg.boxed ? "rounded border border-slate-200 p-1" : ""}>{body}</div>
      </div>
    </div>
  );
}
