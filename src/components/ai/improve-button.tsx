"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { Spinner } from "@/components/ui/motion";

/** The AI actions offered in the dropdown. `action` maps to the API route. */
const ACTIONS: { action: string; label: string }[] = [
  { action: "improve", label: "Improve writing" },
  { action: "quantify", label: "Quantify impact" },
  { action: "shorten", label: "Make it shorter" },
  { action: "expand", label: "Expand & clarify" },
  { action: "professional", label: "Professional tone" },
  { action: "confident", label: "Confident tone" },
  { action: "friendly", label: "Friendly tone" },
];

type Props = {
  text: string;
  type: "experience" | "project" | "summary";
  onAccept: (value: string) => void;
};

/**
 * "AI assist" control. Opens a menu of writing actions, calls the secure
 * `/api/ai/improve` route, then shows the suggestion side-by-side with the
 * original so the user can compare before accepting. Never edits text on its
 * own — the user is always in control.
 */
export function ImproveButton({ text, type, onAccept }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [lastAction, setLastAction] = useState("improve");
  const [error, setError] = useState("");

  async function run(action: string) {
    setOpen(false);
    if (!text.trim()) {
      setError("Add some text before asking for a suggestion.");
      return;
    }
    setBusy(true);
    setError("");
    setSuggestion("");
    setLastAction(action);
    try {
      const r = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, action }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSuggestion(data.improvedText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI is unavailable. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const activeLabel = ACTIONS.find((a) => a.action === lastAction)?.label ?? "Improve";

  return (
    <div className="relative mt-2">
      {/* Trigger + dropdown */}
      <div className="relative inline-block">
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen((o) => !o)}
          className="btn btn-secondary !px-3 !py-2 text-xs"
        >
          {busy ? <Spinner size={14} /> : <Sparkles size={14} className="text-brand" />}
          {busy ? "Thinking…" : "AI assist"}
          {!busy && <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
        </button>

        <AnimatePresence>
          {open && (
            <>
              {/* click-away layer */}
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface/95 p-1.5 shadow-card backdrop-blur"
              >
                {ACTIONS.map((a) => (
                  <button
                    key={a.action}
                    type="button"
                    onClick={() => run(a.action)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-brand/10 hover:text-brand"
                  >
                    <Wand2 size={14} className="text-muted" /> {a.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-500">
          {error}
        </p>
      )}

      {/* Compare + accept panel */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden rounded-xl border border-brand/25 bg-brand/5"
          >
            <div className="flex items-center gap-2 border-b border-brand/15 px-3 py-2 text-xs font-semibold text-brand">
              <Sparkles size={13} /> {activeLabel}
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-2">
              <div className="bg-surface p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Before</p>
                <p className="text-sm leading-5 text-muted">{text}</p>
              </div>
              <div className="bg-surface p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand">After</p>
                <p className="text-sm leading-5 text-ink">{suggestion}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => {
                  onAccept(suggestion);
                  setSuggestion("");
                }}
                className="btn btn-primary !px-3 !py-1.5 text-xs"
              >
                Use this <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => run(lastAction)}
                className="btn btn-secondary !px-3 !py-1.5 text-xs"
              >
                <RotateCcw size={13} /> Regenerate
              </button>
              <button
                type="button"
                onClick={() => setSuggestion("")}
                className="btn btn-ghost !px-3 !py-1.5 text-xs text-muted"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
