import type { Resume } from "@/types/resume";

/**
 * Resume "health" analysis — all pure, client-side heuristics (no AI needed),
 * so the Review tab is instant and always works. Covers an ATS-style score,
 * a checklist, writing/weak-verb suggestions, and keyword matching against a
 * pasted job description.
 */

const STRONG_VERBS = new Set([
  "led", "built", "designed", "developed", "launched", "created", "improved", "increased", "reduced",
  "delivered", "managed", "shipped", "drove", "owned", "architected", "implemented", "optimized",
  "automated", "scaled", "streamlined", "coordinated", "spearheaded", "founded", "grew", "cut",
  "boosted", "generated", "negotiated", "mentored", "analyzed", "researched", "engineered", "migrated",
  "refactored", "established", "initiated", "achieved", "won", "produced", "published", "presented",
]);

const WEAK_PHRASES = [
  "responsible for", "helped", "worked on", "duties included", "assisted with", "in charge of",
  "tasked with", "involved in", "participated in", "a lot", "various", "stuff", "things",
];

const STOPWORDS = new Set(
  ("a an the and or but if then else for to of in on at by with from as is are was were be been being this that these those you your we our they their it its will would can could should may might must have has had do does did not no our us we i he she them his her role team work working experience years year including etc using use used strong ability excellent good great plus preferred required responsibilities requirements about across into over under more most other such per via within your you're they'll".split(/\s+/))
);

function allText(r: Resume): string {
  return [
    r.professionalSummary,
    ...r.experiences.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...r.projects.flatMap((p) => [p.name, p.description, ...p.technologies]),
    ...r.education.flatMap((e) => [e.institution, e.degree, e.field]),
    ...r.skills,
    ...r.certifications.map((c) => c.name),
    ...r.interests,
  ].join(" ").toLowerCase();
}

function allBullets(r: Resume): string[] {
  return r.experiences.flatMap((e) => e.bullets.filter((b) => b.trim())).concat(r.projects.map((p) => p.description).filter(Boolean));
}

export type Check = { label: string; ok: boolean; hint: string };

export function checklist(r: Resume, pages?: number): Check[] {
  const p = r.personalInfo;
  const bullets = allBullets(r);
  const quantified = bullets.filter((b) => /\d/.test(b)).length;
  const strongStart = bullets.filter((b) => STRONG_VERBS.has(b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, ""))).length;
  const summaryLen = r.professionalSummary.trim().length;

  const checks: Check[] = [
    { label: "Contact details complete", ok: !!(p.email && p.phone && p.location), hint: "Add email, phone, and location." },
    { label: "Professional title set", ok: !!p.title, hint: "Add a headline title (e.g. Frontend Developer)." },
    { label: "Summary is 2–4 sentences", ok: summaryLen >= 120 && summaryLen <= 600, hint: "Aim for ~150–500 characters." },
    { label: "At least 2 experience bullets", ok: bullets.length >= 2, hint: "Add specific accomplishment bullets." },
    { label: "Bullets start with action verbs", ok: bullets.length > 0 && strongStart / bullets.length >= 0.5, hint: "Start bullets with verbs like Led, Built, Improved." },
    { label: "Bullets are quantified", ok: bullets.length > 0 && quantified / bullets.length >= 0.3, hint: "Add numbers/metrics to at least a third of bullets." },
    { label: "5+ skills listed", ok: r.skills.length >= 5, hint: "List at least 5 relevant skills." },
    { label: "Education added", ok: r.education.length > 0, hint: "Add your education." },
  ];
  if (pages != null) checks.push({ label: "Fits on one page", ok: pages <= 1, hint: "Trim content to a single page for most roles." });
  return checks;
}

export function score(r: Resume, pages?: number): number {
  const checks = checklist(r, pages);
  return Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
}

export type WritingIssue = { text: string; issue: string };

export function writingIssues(r: Resume): WritingIssue[] {
  const issues: WritingIssue[] = [];
  const seenVerbs = new Map<string, number>();
  const consider = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const low = t.toLowerCase();
    for (const w of WEAK_PHRASES) if (low.includes(w)) { issues.push({ text: t, issue: `Weak phrase "${w}" — use a strong action verb.` }); break; }
    if (/\b(was|were|been|being|is|are)\s+\w+(ed|en)\b/.test(low)) issues.push({ text: t, issue: "Passive voice — rewrite in active voice." });
    const first = low.split(/\s+/)[0]?.replace(/[^a-z]/g, "");
    if (first) { const n = (seenVerbs.get(first) || 0) + 1; seenVerbs.set(first, n); if (n === 3) issues.push({ text: t, issue: `Repeated opener "${first}" — vary your verbs.` }); }
  };
  allBullets(r).forEach(consider);
  if (r.professionalSummary) consider(r.professionalSummary);
  return issues.slice(0, 12);
}

export type KeywordResult = { matched: string[]; missing: string[]; matchPct: number };

export function keywordAnalysis(r: Resume, jobDescription: string): KeywordResult | null {
  const jd = jobDescription.trim();
  if (jd.length < 20) return null;
  const words = (jd.toLowerCase().match(/[a-z][a-z0-9+.#/-]{1,}/g) || [])
    // Trim trailing punctuation like "skills." or "node/".
    .map((w) => w.replace(/[.\-/#]+$/g, ""));
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const candidates = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24).map(([w]) => w);
  const resumeText = allText(r);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of candidates) (resumeText.includes(k) ? matched : missing).push(k);
  const matchPct = candidates.length ? Math.round((matched.length / candidates.length) * 100) : 0;
  return { matched, missing, matchPct };
}
