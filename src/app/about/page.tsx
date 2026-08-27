import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileDown, Layers, Lock, Share2, Sparkles } from "lucide-react";
import { Brand } from "@/components/layout/brand";

export const metadata: Metadata = {
  title: "About & FAQ — Candidly",
  description: "What Candidly is, how it works, and answers to common questions about the AI resume & portfolio builder.",
};

const faqs = [
  { q: "Is Candidly free?", a: "Yes — you can build, export, and share resumes for free. You just need an account to save your drafts." },
  { q: "Does the AI make up experience?", a: "No. Every AI action is instructed to preserve your facts and never invent metrics, employers, or achievements. You always review a suggestion before accepting it." },
  { q: "Can I export to Word and PDF?", a: "Both. Download a pixel-perfect A4 PDF or an editable Word (.docx) file, and print directly from the browser." },
  { q: "Who can see my resume?", a: "Your resumes are private by default. A resume is only visible to others if you turn on its public share link — enforced by database security rules, not just the UI." },
  { q: "Will it pass ATS screeners?", a: "The Review tab gives you an ATS-style score, a keyword match against any job description, and concrete fixes. Several templates are deliberately clean and ATS-friendly." },
  { q: "Do I need my own AI key?", a: "The AI features use Google Gemini. If you deploy your own copy, add a GEMINI_API_KEY — the app auto-detects a model your key can access." },
];

const features = [
  { icon: Layers, title: "20 designer templates", body: "Switch layouts, fonts, and colors live — your content never changes." },
  { icon: Sparkles, title: "AI that respects the truth", body: "Improve, quantify, generate bullets, tailor to a job, and draft cover letters." },
  { icon: FileDown, title: "PDF & Word export", body: "Pixel-perfect PDF or editable .docx, plus one-click print." },
  { icon: Share2, title: "Share anywhere", body: "Publish a public link with a QR code and a simple view counter." },
  { icon: Lock, title: "Private by default", body: "Firebase auth and security rules keep your drafts yours." },
];

export default function About() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora" aria-hidden><div className="aurora-3" /></div>

      <nav className="sticky top-0 z-40 border-b border-line/60 bg-surface/70 backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-3.5">
          <Brand />
          <Link href="/sign-up" className="btn btn-primary">Start free <ArrowRight size={16} /></Link>
        </div>
      </nav>

      <section className="shell py-16 text-center">
        <span className="chip border border-brand/25 bg-brand/10 text-brand"><Sparkles size={13} /> About Candidly</span>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          A resume builder that helps you tell the <span className="text-gradient">truth, well.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Candidly turns your real experience into a polished, recruiter-ready resume — with guided forms, a live
          preview, honest AI, and beautiful exports. Built for Devloria Round 2, Project 9.
        </p>
      </section>

      <section className="shell grid gap-4 pb-8 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card rounded-2xl p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white"><Icon size={20} /></span>
            <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="shell py-12">
        <h2 className="text-center font-display text-3xl font-bold">Frequently asked questions</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card group rounded-2xl p-5">
              <summary className="flex cursor-pointer items-center justify-between font-semibold marker:content-['']">
                {f.q}
                <span className="text-brand transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="shell pb-20 text-center">
        <Link href="/sign-up" className="btn btn-primary text-base">Build your resume <ArrowRight size={18} /></Link>
      </section>

      <footer className="border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted">
          <Brand size="sm" />
          <span>© 2026 Candidly</span>
        </div>
      </footer>
    </main>
  );
}
