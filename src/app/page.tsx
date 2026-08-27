"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  FileDown,
  LayoutTemplate,
  PenLine,
  Share2,
  Sparkles,
  Wand2,
  Moon,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Aurora, Reveal } from "@/components/ui/motion";

const steps: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: PenLine, title: "Add what happened", detail: "Guided sections make room for the real work — experience, projects, education and skills." },
  { icon: Wand2, title: "Sharpen the words", detail: "AI rewrites, shortens, expands or re-tones any line — without inventing claims you never made." },
  { icon: Share2, title: "Send with confidence", detail: "Pick a designer template, export a crisp PDF, and share one clean public link." },
];

const features: { icon: LucideIcon; title: string; detail: string; span: string }[] = [
  { icon: Eye, title: "Live preview", detail: "Every keystroke updates a real, print-accurate resume beside you — no guessing.", span: "md:col-span-2" },
  { icon: Sparkles, title: "AI assist", detail: "Improve, shorten, expand and re-tone bullets with a compare-before-you-accept view.", span: "" },
  { icon: LayoutTemplate, title: "Six templates", detail: "Switch designs live without losing a word, then recolor with one click.", span: "" },
  { icon: FileDown, title: "One-click PDF", detail: "Download a pixel-faithful, multi-page A4 PDF — or print straight from the browser.", span: "md:col-span-2" },
  { icon: Share2, title: "Shareable link", detail: "Publish a clean public page when you're ready. Private by default.", span: "" },
  { icon: Moon, title: "Light & dark", detail: "A charming aurora-lit light theme and a deep, focused dark mode.", span: "" },
];

const stats = [
  { value: "6", label: "designer templates" },
  { value: "4", label: "AI writing actions" },
  { value: "A4", label: "print-ready PDF" },
  { value: "∞", label: "private drafts" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Aurora />

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-line/60 bg-surface/70 backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-3.5">
          <Brand />
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="#features" className="btn btn-ghost hidden sm:inline-flex">Features</a>
            <Link href="/about" className="btn btn-ghost hidden sm:inline-flex">About</Link>
            <ThemeToggle />
            <Link className="btn btn-secondary hidden sm:inline-flex" href="/sign-in">Sign in</Link>
            <Link className="btn btn-primary" href="/sign-up">
              Start free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="shell grid gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div className="self-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip border border-brand/25 bg-brand/10 text-brand"
          >
            <Sparkles size={14} /> AI resume & portfolio builder
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl"
          >
            A resume that sounds like{" "}
            <span className="text-gradient">you</span>, at your best.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-8 text-muted"
          >
            Candidly turns the work you&apos;ve done into a polished, recruiter-ready
            story — guided forms, a live preview, AI on tap, and a beautiful
            export. You stay in control of every line.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.19 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/sign-up" className="btn btn-primary text-base">
              Create your resume <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn btn-secondary text-base">See how it works</a>
          </motion.div>

          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <Check size={16} className="text-brand" /> Private by default. Your facts stay yours.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-ink">{s.value}</div>
                <div className="mt-1 text-xs leading-4 text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating live-preview mock */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.7, 0.3, 1] }}
          className="relative self-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="card mx-auto w-full max-w-md rounded-3xl p-3"
          >
            <div className="rounded-2xl bg-white p-6 text-[#1a1a24] shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-600">Live preview</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Aisha Rahman</h2>
              <p className="font-medium text-emerald-600">Senior Product Designer</p>
              <hr className="my-4 border-slate-200" />
              <p className="text-sm leading-6 text-slate-600">
                Designing clear, generous product experiences at the intersection
                of research and craft.
              </p>
              <div className="mt-5 space-y-2.5">
                <div className="h-2 w-24 rounded bg-emerald-200" />
                <div className="h-2 w-full rounded bg-slate-100" />
                <div className="h-2 w-11/12 rounded bg-slate-100" />
                <div className="h-2 w-4/6 rounded bg-slate-100" />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Figma", "Research", "Design systems", "Prototyping"].map((t) => (
                  <span key={t} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating AI chip */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 top-6 hidden rounded-2xl border border-line bg-surface/90 p-3 shadow-glow backdrop-blur sm:block"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-white">
                <Sparkles size={14} />
              </span>
              Improved with AI
            </div>
          </motion.div>

          {/* Floating PDF chip */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 right-2 hidden rounded-2xl border border-line bg-surface/90 px-3 py-2 text-sm font-semibold text-ink shadow-glow backdrop-blur sm:flex sm:items-center sm:gap-2"
          >
            <FileDown size={16} className="text-brand" /> resume.pdf
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="shell py-16">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand2">Three calm steps</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold">
            Every good resume begins with the details.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, detail }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="card h-full rounded-2xl p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon size={20} />
                </span>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted">
                  STEP {i + 1}
                </div>
                <h3 className="mt-1 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-6 text-muted">{detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURE BENTO */}
      <section id="features" className="shell py-16">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand2">Everything in one place</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold">
            Professional polish, without losing your voice.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, detail, span }, i) => (
            <Reveal key={title} delay={i * 0.05} className={span}>
              <div className="group card relative h-full overflow-hidden rounded-2xl p-6">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white">
                  <Icon size={20} />
                </span>
                <h3 className="relative mt-5 font-display text-xl font-bold">{title}</h3>
                <p className="relative mt-2 leading-6 text-muted">{detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section className="shell py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.18em] text-brand2">Designed to impress</p>
              <h2 className="mt-3 font-display text-4xl font-bold">Six templates. One click to switch.</h2>
            </div>
            <Link href="/sign-up" className="btn btn-secondary">Try them all <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { n: "Modern", c: "#7c3aed" },
            { n: "Minimal", c: "#0f172a" },
            { n: "Classic", c: "#b45309" },
            { n: "Sidebar", c: "#0e7490" },
            { n: "Elegant", c: "#9d174d" },
            { n: "Compact", c: "#15803d" },
          ].map((t, i) => (
            <Reveal key={t.n} delay={i * 0.05}>
              <div className="card overflow-hidden rounded-2xl p-2 transition-transform duration-300 hover:-translate-y-1.5">
                <div className="aspect-[3/4] rounded-xl bg-white p-3">
                  <div className="h-2 w-2/3 rounded" style={{ background: t.c }} />
                  <div className="mt-1 h-1.5 w-1/2 rounded bg-slate-200" />
                  <div className="mt-3 space-y-1">
                    <div className="h-1 w-full rounded bg-slate-100" />
                    <div className="h-1 w-11/12 rounded bg-slate-100" />
                    <div className="h-1 w-4/5 rounded bg-slate-100" />
                  </div>
                  <div className="mt-3 h-1.5 w-1/3 rounded" style={{ background: t.c, opacity: 0.5 }} />
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1 w-full rounded bg-slate-100" />
                    <div className="h-1 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
                <p className="px-1 py-2 text-center text-sm font-semibold">{t.n}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/15 via-brand2/10 to-brand3/10 p-10 text-center md:p-16">
            <div className="aurora-3" />
            <h2 className="relative mx-auto max-w-2xl font-display text-4xl font-bold md:text-5xl">
              Your next opportunity deserves a great first impression.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted">
              Build it in minutes. Keep it forever. Share it anywhere.
            </p>
            <Link href="/sign-up" className="btn btn-primary relative mt-8 text-base">
              Start building — it&apos;s free <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted">
          <Brand size="sm" />
          <span>© 2026 Candidly · Built for Devloria Round 2 · Project 9</span>
        </div>
      </footer>
    </main>
  );
}
