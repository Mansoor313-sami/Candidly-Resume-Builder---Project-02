"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, LayoutList, Eye, Sparkles, Share2, X } from "lucide-react";

const KEY = "candidly-tour-done";

const STEPS = [
  { icon: LayoutList, title: "Fill in your sections", body: "Use the left tabs to add your experience, projects, skills and more. Add or reorder sections from the Sections tab." },
  { icon: Eye, title: "Watch the live preview", body: "Everything you type updates the resume beside you instantly. Switch templates and colors in the Design tab." },
  { icon: Sparkles, title: "Let AI help", body: "Improve or quantify any bullet, generate bullets from a note, and check your resume health in the Review tab." },
  { icon: Share2, title: "Export & share", body: "Download a pixel-perfect PDF or Word file, or publish a public link with a QR code from the Design tab." },
];

/** A 4-step first-run tour. Shows once per browser (localStorage flag). */
export function OnboardingTour() {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setStep(0);
    } catch {
      /* ignore */
    }
  }, []);

  function close() {
    setStep(-1);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }

  const s = STEPS[step];

  return (
    <AnimatePresence>
      {step >= 0 && s && (
        <motion.div className="no-print fixed inset-0 z-[130] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div key={step} className="card w-full max-w-sm rounded-3xl p-7 text-center"
            initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}>
            <button onClick={close} aria-label="Skip tour" className="btn btn-ghost !p-2 absolute right-3 top-3"><X size={18} /></button>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand2 text-white">
              <s.icon size={26} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">{s.title}</h2>
            <p className="mt-2 text-muted">{s.body}</p>
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-brand" : "w-1.5 bg-muted/40"}`} />)}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={close} className="btn btn-ghost text-sm text-muted">Skip</button>
              <button onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : close())} className="btn btn-primary">
                {step < STEPS.length - 1 ? <>Next <ArrowRight size={16} /></> : "Get started"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
