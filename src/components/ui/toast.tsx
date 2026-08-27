"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; message: string; kind: ToastKind };

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

/**
 * A tiny self-contained toast system. `useToast()` returns a function you call
 * as `toast("Saved", "success")`. Toasts stack bottom-right, animate in/out
 * with motion, and auto-dismiss after ~3s.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, message, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="no-print pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.24, ease: [0.2, 0.7, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface/95 px-4 py-3 text-sm shadow-card backdrop-blur"
            >
              <span
                className={
                  t.kind === "success"
                    ? "text-emerald-500"
                    : t.kind === "error"
                      ? "text-rose-500"
                      : "text-brand"
                }
              >
                {t.kind === "success" ? (
                  <CheckCircle2 size={18} />
                ) : t.kind === "error" ? (
                  <XCircle size={18} />
                ) : (
                  <Info size={18} />
                )}
              </span>
              <p className="pt-0.5 leading-5 text-ink">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
