"use client";

import { motion } from "motion/react";

/**
 * Centered, branded full-screen loader. Shown during route transitions
 * (app/loading.tsx) and while pages fetch their initial data. A rotating
 * gradient ring wraps a pulsing "C" so users always know the app is working.
 */
export function FullscreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-surface/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid h-20 w-20 place-items-center">
          {/* Rotating gradient ring */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgb(var(--brand)), rgb(var(--brand-2)), transparent)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Pulsing brand mark */}
          <motion.span
            className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand2 font-display text-2xl font-bold text-white"
            animate={{ scale: [1, 0.9, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            C
          </motion.span>
        </div>
        <motion.p
          className="text-sm font-semibold tracking-wide text-muted"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
