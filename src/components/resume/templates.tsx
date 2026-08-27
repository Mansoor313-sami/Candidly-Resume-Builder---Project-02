import type { Resume, SectionKey, TemplateId } from "@/types/resume";
import { orderedSections } from "@/types/resume";

/* ============================================================
   Candidly template engine.

   Rather than 20 hand-written files, each template is a small
   CONFIG that composes shared, tested building blocks (headers,
   section headings, section bodies). Adding a template = adding
   one row to TEMPLATES. Every template renders the SAME typed
   data, so switching designs never changes content.

   The resume paper is always a light document (fixed colors +
   the user's accent), which keeps print + PDF pixel-faithful.
   ============================================================ */

export type Category = "Professional" | "Creative" | "Technical" | "Academic" | "Simple";

type HeaderVariant = "plain" | "centered" | "band" | "split" | "compact" | "gradient" | "rail";
type HeadingVariant = "bar" | "underline" | "rule" | "hairline" | "caps" | "block" | "dot" | "double" | "leftbar";
type SkillStyle = "chips" | "inline" | "list";
type ExpStyle = "default" | "timeline" | "compact";
type Layout = "single" | "left" | "right";

type Cfg = {
  category: Category;
  layout: Layout;
  header: HeaderVariant;
  heading: HeadingVariant;
  skills: SkillStyle;
  exp: ExpStyle;
  photo?: boolean;
  dense?: boolean;
  boxed?: boolean;
  mono?: boolean;
};

/* ---------------- helpers ---------------- */
function tint(hex: string, alpha: number) {
  const h = (hex || "#7c3aed").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "7c3aed", 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
function range(start: string, end: string, current?: boolean) {
  if (!start && !end && !current) return "";
  const tail = current ? "Present" : end;
  return `${start}${start && tail ? " – " : ""}${tail}`;
}
function initials(name: string) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Avatar({ url, name, size, accent, onDark }: { url: string; name: string; size: number; accent: string; onDark?: boolean }) {
  const style = { width: size, height: size };
  if (url)
    // Data-URL avatar; next/image adds no value for an inline base64 image.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} style={style} className="shrink-0 rounded-full object-cover" />;
  return (
    <div
      style={{ ...style, background: onDark ? "rgba(255,255,255,.2)" : tint(accent, 0.15), color: onDark ? "#fff" : accent }}
      className="grid shrink-0 place-items-center rounded-full rf-head text-lg font-bold"
    >
      {initials(name) || "•"}
    </div>
  );
}

/* ---------------- section heading ---------------- */
function Heading({ variant, accent, children }: { variant: HeadingVariant; accent: string; children: React.ReactNode }) {
  const base = "rf-head mb-2 font-bold";
  switch (variant) {
    case "underline":
      return <h2 className={`${base} mb-3 border-b border-slate-200 pb-1 text-[11px] uppercase tracking-[.2em] text-slate-400`}>{children}</h2>;
    case "rule":
      return <h2 className={`${base} border-b-2 pb-1 text-sm uppercase tracking-[.14em] text-slate-800`} style={{ borderColor: accent }}>{children}</h2>;
    case "hairline":
      return (
        <h2 className={`${base} mb-3 flex items-center gap-3 text-[12px] uppercase tracking-[.24em] text-slate-500`}>
          <span className="h-px w-6" style={{ background: accent }} />
          {children}
        </h2>
      );
    case "caps":
      return <h2 className={`${base} text-center text-[11px] uppercase tracking-[.24em] text-slate-400`}>{children}</h2>;
    case "block":
      return <h2 className={`${base} inline-block rounded px-2 py-0.5 text-[11px] uppercase tracking-[.14em] text-white`} style={{ background: accent }}>{children}</h2>;
    case "dot":
      return (
        <h2 className={`${base} flex items-center gap-2 text-[11px] uppercase tracking-[.16em]`} style={{ color: accent }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />
          {children}
        </h2>
      );
    case "double":
      return <h2 className={`${base} border-y py-1 text-center text-sm uppercase tracking-[.16em] text-slate-800`} style={{ borderColor: accent }}>{children}</h2>;
    case "leftbar":
      return <h2 className={`${base} border-l-4 pl-2 text-sm uppercase tracking-[.12em] text-slate-800`} style={{ borderColor: accent }}>{children}</h2>;
    case "bar":
    default:
      return <h2 className={`${base} text-[11px] uppercase tracking-[.16em]`} style={{ color: accent }}>{children}</h2>;
  }
}

/* ---------------- section wrapper ---------------- */
function Section({ title, cfg, accent, children }: { title: string; cfg: Cfg; accent: string; children: React.ReactNode }) {
  const inner = (
    <>
      <Heading variant={cfg.heading} accent={accent}>{title}</Heading>
      {children}
    </>
  );
  if (cfg.boxed) return <section className="mb-3 rounded-lg border border-slate-200 p-3">{inner}</section>;
  return <section className={cfg.dense ? "mb-3" : "mb-5"}>{inner}</section>;
}

/* ---------------- section bodies ---------------- */
function Summary({ resume, cfg }: { resume: Resume; cfg: Cfg }) {
  const cls = cfg.header === "centered" && cfg.heading === "hairline" ? "" : "";
  return <p className={`rf-body text-sm leading-6 text-slate-700 ${cls}`}>{resume.professionalSummary}</p>;
}

function ExperienceBody({ resume, cfg, accent }: { resume: Resume; cfg: Cfg; accent: string }) {
  if (cfg.exp === "timeline")
    return (
      <div className="relative ml-1 border-l-2 pl-4" style={{ borderColor: tint(accent, 0.35) }}>
        {resume.experiences.map((x) => (
          <div className="mb-4 last:mb-0" key={x.id}>
            <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full" style={{ background: accent }} />
            <div className="flex items-baseline justify-between gap-3">
              <b className="rf-head text-[15px] text-slate-900">{x.role || "Role"}</b>
              <span className="shrink-0 text-xs text-slate-500">{range(x.startDate, x.endDate, x.current)}</span>
            </div>
            <p className="text-sm font-medium text-slate-600">{x.company}{x.location && ` · ${x.location}`}</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-5 text-slate-700">
              {x.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    );
  if (cfg.exp === "compact")
    return (
      <>
        {resume.experiences.map((x) => (
          <div className="mb-2" key={x.id}>
            <div className="flex items-baseline justify-between gap-3">
              <b className="rf-head text-slate-900">{x.role || "Role"} <span className="font-normal text-slate-500">· {x.company}</span></b>
              <span className="shrink-0 text-[11px] text-slate-500">{range(x.startDate, x.endDate, x.current)}</span>
            </div>
            <ul className="list-disc space-y-0.5 pl-4 text-[13px] leading-5 text-slate-700">
              {x.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        ))}
      </>
    );
  return (
    <>
      {resume.experiences.map((x) => (
        <div className="mb-4 last:mb-0" key={x.id}>
          <div className="flex items-baseline justify-between gap-4">
            <b className="rf-head text-[15px] text-slate-900">{x.role || "Role"}</b>
            <span className="shrink-0 text-xs text-slate-500">{range(x.startDate, x.endDate, x.current)}</span>
          </div>
          <p className="text-sm font-medium text-slate-600">{x.company}{x.location && ` · ${x.location}`}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-5 text-slate-700">
            {x.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ))}
    </>
  );
}

function ProjectsBody({ resume, accent }: { resume: Resume; accent: string }) {
  return (
    <>
      {resume.projects.map((x) => (
        <div className="mb-3 last:mb-0" key={x.id}>
          <div className="flex items-baseline gap-2">
            <b className="rf-head text-[15px] text-slate-900">{x.name || "Project"}</b>
            {x.technologies.length > 0 && <span className="text-xs" style={{ color: accent }}>{x.technologies.join(" · ")}</span>}
          </div>
          <p className="text-sm leading-5 text-slate-700">{x.description}</p>
        </div>
      ))}
    </>
  );
}

function EducationBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.education.map((x) => (
        <div className="mb-2 text-sm last:mb-0" key={x.id}>
          <b className="rf-head text-slate-900">{x.institution}</b>
          <p className="text-slate-600">{[x.degree, x.field].filter(Boolean).join(", ")}</p>
          <p className="text-xs text-slate-500">{range(x.startDate, x.endDate)}</p>
        </div>
      ))}
    </>
  );
}

function Skills({ resume, style, accent }: { resume: Resume; style: SkillStyle; accent: string }) {
  if (style === "chips")
    return (
      <div className="flex flex-wrap gap-1.5">
        {resume.skills.map((s, i) => (
          <span key={i} className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: tint(accent, 0.12), color: accent }}>{s}</span>
        ))}
      </div>
    );
  if (style === "list")
    return (
      <ul className="space-y-1 text-sm text-slate-700">
        {resume.skills.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    );
  return <p className="text-sm leading-6 text-slate-700">{resume.skills.join("  ·  ")}</p>;
}

function CertificationsBody({ resume, accent }: { resume: Resume; accent: string }) {
  return (
    <>
      {resume.certifications.map((c) => (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm last:mb-0" key={c.id}>
          <span>
            <b className="rf-head text-slate-900">{c.name || "Certification"}</b>
            {c.issuer && <span className="text-slate-600"> — {c.issuer}</span>}
          </span>
          {c.date && <span className="shrink-0 text-xs text-slate-500">{c.date}</span>}
        </div>
      ))}
    </>
  );
}

function LanguagesBody({ resume, accent }: { resume: Resume; accent: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
      {resume.languages.map((l) => (
        <span key={l.id}>
          <b className="rf-head text-slate-900">{l.name || "Language"}</b>
          {l.proficiency && <span style={{ color: accent }}> · {l.proficiency}</span>}
        </span>
      ))}
    </div>
  );
}

function AwardsBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.awards.map((a) => (
        <div className="mb-2 last:mb-0" key={a.id}>
          <div className="flex items-baseline justify-between gap-3">
            <b className="rf-head text-slate-900">{a.title || "Award"}{a.issuer && <span className="font-normal text-slate-600"> — {a.issuer}</span>}</b>
            {a.date && <span className="shrink-0 text-xs text-slate-500">{a.date}</span>}
          </div>
          {a.description && <p className="text-sm leading-5 text-slate-700">{a.description}</p>}
        </div>
      ))}
    </>
  );
}

function PublicationsBody({ resume }: { resume: Resume }) {
  return (
    <>
      {resume.publications.map((p) => (
        <div className="mb-1.5 text-sm last:mb-0" key={p.id}>
          <b className="rf-head text-slate-900">{p.title || "Publication"}</b>
          {p.publisher && <span className="italic text-slate-600"> — {p.publisher}</span>}
          {p.date && <span className="text-slate-500"> ({p.date})</span>}
        </div>
      ))}
    </>
  );
}

function InterestsBody({ resume, accent }: { resume: Resume; accent: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {resume.interests.map((s, i) => (
        <span key={i} className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: tint(accent, 0.1), color: accent }}>{s}</span>
      ))}
    </div>
  );
}

/** Title shown for each section (summary reads as "Profile"). */
const SECTION_TITLES: Record<SectionKey, string> = {
  summary: "Profile", experience: "Experience", projects: "Projects", education: "Education",
  skills: "Skills", certifications: "Certifications", languages: "Languages", awards: "Awards",
  publications: "Publications", interests: "Interests",
};

/** Render one body section by key inside a <Section> wrapper. */
function SectionByKey({ resume, cfg, accent, k }: { resume: Resume; cfg: Cfg; accent: string; k: SectionKey }) {
  const body = (() => {
    switch (k) {
      case "summary": return <Summary resume={resume} cfg={cfg} />;
      case "experience": return <ExperienceBody resume={resume} cfg={cfg} accent={accent} />;
      case "projects": return <ProjectsBody resume={resume} accent={accent} />;
      case "education": return <EducationBody resume={resume} />;
      case "skills": return <Skills resume={resume} style={cfg.skills} accent={accent} />;
      case "certifications": return <CertificationsBody resume={resume} accent={accent} />;
      case "languages": return <LanguagesBody resume={resume} accent={accent} />;
      case "awards": return <AwardsBody resume={resume} />;
      case "publications": return <PublicationsBody resume={resume} />;
      case "interests": return <InterestsBody resume={resume} accent={accent} />;
    }
  })();
  return <Section title={SECTION_TITLES[k]} cfg={cfg} accent={accent}>{body}</Section>;
}

/* ---------------- header ---------------- */
function contactLine(resume: Resume, sep = " • ") {
  const p = resume.personalInfo;
  return [p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean).join(sep);
}

function Header({ resume, cfg, accent }: { resume: Resume; cfg: Cfg; accent: string }) {
  const p = resume.personalInfo;
  const name = p.fullName || "Your name";
  const title = p.title || "Professional title";

  if (cfg.header === "centered")
    return (
      <header className="mb-6 text-center">
        {cfg.photo && <div className="mb-3 flex justify-center"><Avatar url={resume.photoUrl} name={name} size={76} accent={accent} /></div>}
        <h1 className="rf-head text-4xl font-bold tracking-tight text-slate-900">{name}</h1>
        <p className="mt-1 text-sm uppercase tracking-[.22em]" style={{ color: accent }}>{title}</p>
        <div className="mx-auto mt-3 h-px w-12" style={{ background: accent }} />
        <p className="mt-3 text-xs text-slate-500">{contactLine(resume, "  ·  ")}</p>
      </header>
    );

  if (cfg.header === "band" || cfg.header === "gradient") {
    const bg = cfg.header === "gradient" ? `linear-gradient(120deg, ${accent}, ${tint(accent, 0.75)})` : accent;
    return (
      <header className="-mt-[15mm] -ml-[16mm] -mr-[16mm] mb-6 flex items-center gap-5 px-[16mm] py-8 text-white" style={{ background: bg }}>
        {cfg.photo && <Avatar url={resume.photoUrl} name={name} size={78} accent={accent} onDark />}
        <div>
          <h1 className="rf-head text-4xl font-extrabold tracking-tight">{name}</h1>
          <p className="mt-1 text-base text-white/90">{title}</p>
          <p className="mt-2 text-xs text-white/80">{contactLine(resume)}</p>
        </div>
      </header>
    );
  }

  if (cfg.header === "split")
    return (
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 pb-4" style={{ borderColor: accent }}>
        <div>
          <h1 className="rf-head text-4xl font-extrabold tracking-tight text-slate-900">{name}</h1>
          <p className="mt-1 text-lg font-semibold" style={{ color: accent }}>{title}</p>
        </div>
        <p className="max-w-[45%] text-right text-xs leading-5 text-slate-500">{contactLine(resume, " · ")}</p>
      </header>
    );

  if (cfg.header === "compact")
    return (
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2" style={{ borderColor: accent }}>
        <div>
          <h1 className="rf-head text-2xl font-extrabold leading-none text-slate-900">{name}</h1>
          <p className="text-sm font-semibold" style={{ color: accent }}>{title}</p>
        </div>
        <p className="max-w-[52%] text-right text-[11px] text-slate-500">{contactLine(resume, " · ")}</p>
      </header>
    );

  // plain
  return (
    <header className={`mb-6 ${cfg.mono ? "" : "border-t-[9px] pt-5"} border-b border-slate-200 pb-5`} style={cfg.mono ? {} : { borderTopColor: accent }}>
      <h1 className="rf-head text-4xl font-extrabold tracking-tight text-slate-900">{name}</h1>
      <p className="mt-1 text-lg font-semibold" style={{ color: cfg.mono ? "#334155" : accent }}>{title}</p>
      <p className="mt-3 text-xs text-slate-500">{contactLine(resume)}</p>
    </header>
  );
}

/* ---------------- main renderer ---------------- */
/** For sidebar layouts: which sections live in the colored rail. */
const RAIL_SECTIONS: SectionKey[] = ["skills", "languages", "education", "certifications", "interests"];

function RenderDoc({ resume, cfg }: { resume: Resume; cfg: Cfg }) {
  const accent = cfg.mono ? "#334155" : resume.accentColor || "#7c3aed";
  const visible = orderedSections(resume); // ordered, visible, non-empty

  // Sidebar layouts (left / right rail)
  if (cfg.layout === "left" || cfg.layout === "right") {
    const railKeys = RAIL_SECTIONS.filter((s) => visible.includes(s));
    const mainKeys = visible.filter((s) => !RAIL_SECTIONS.includes(s));
    const rail = (
      <aside className="w-[34%] p-6 text-white max-[920px]:w-full" style={{ background: accent }}>
        {cfg.photo && <div className="mb-4"><Avatar url={resume.photoUrl} name={resume.personalInfo.fullName} size={84} accent={accent} onDark /></div>}
        <h1 className="rf-head text-2xl font-extrabold leading-tight">{resume.personalInfo.fullName || "Your name"}</h1>
        <p className="mt-1 text-sm text-white/85">{resume.personalInfo.title || "Professional title"}</p>

        <RailHead>Contact</RailHead>
        <ul className="space-y-1 text-xs text-white/90">
          {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location, resume.personalInfo.website, resume.personalInfo.linkedin, resume.personalInfo.github]
            .filter(Boolean)
            .map((c, i) => <li key={i} className="break-words">{c}</li>)}
        </ul>

        {railKeys.map((k) => <RailSection key={k} resume={resume} k={k} />)}
      </aside>
    );
    const main = (
      <div className="flex-1 p-6">
        {mainKeys.map((k) => <SectionByKey key={k} resume={resume} cfg={cfg} accent={accent} k={k} />)}
      </div>
    );
    return (
      <div className="-mt-[15mm] -mb-[15mm] -ml-[16mm] -mr-[16mm] flex min-h-full max-[920px]:m-0 max-[920px]:block">
        {cfg.layout === "left" ? (<>{rail}{main}</>) : (<>{main}{rail}</>)}
      </div>
    );
  }

  // Single column — render sections in the user's chosen order.
  return (
    <div>
      <Header resume={resume} cfg={cfg} accent={accent} />
      {visible.map((k) => <SectionByKey key={k} resume={resume} cfg={cfg} accent={accent} k={k} />)}
    </div>
  );
}

/** Rail (white-on-accent) rendering of a section for sidebar templates. */
function RailSection({ resume, k }: { resume: Resume; k: SectionKey }) {
  if (k === "skills")
    return (<><RailHead>Skills</RailHead><ul className="space-y-1 text-xs text-white/90">{resume.skills.map((s, i) => <li key={i}>{s}</li>)}</ul></>);
  if (k === "languages")
    return (<><RailHead>Languages</RailHead><ul className="space-y-1 text-xs text-white/90">{resume.languages.map((l) => <li key={l.id}>{l.name}{l.proficiency && ` · ${l.proficiency}`}</li>)}</ul></>);
  if (k === "interests")
    return (<><RailHead>Interests</RailHead><p className="text-xs text-white/90">{resume.interests.join(" · ")}</p></>);
  if (k === "certifications")
    return (<><RailHead>Certifications</RailHead>{resume.certifications.map((c) => <div className="mb-1.5 text-xs text-white/90" key={c.id}><b className="text-white">{c.name}</b>{c.issuer && <p>{c.issuer}</p>}</div>)}</>);
  if (k === "education")
    return (<><RailHead>Education</RailHead>{resume.education.map((x) => (
      <div className="mb-2 text-xs text-white/90" key={x.id}>
        <b className="text-white">{x.institution}</b>
        <p>{[x.degree, x.field].filter(Boolean).join(", ")}</p>
        <p className="text-white/70">{range(x.startDate, x.endDate)}</p>
      </div>))}</>);
  return null;
}

function RailHead({ children }: { children: React.ReactNode }) {
  return <h2 className="rf-head mb-2 mt-5 text-[11px] font-bold uppercase tracking-[.16em] text-white/80 first:mt-0">{children}</h2>;
}

/* ============================================================
   REGISTRY — 20 templates
   ============================================================ */
export const TEMPLATES: {
  id: TemplateId;
  name: string;
  category: Category;
  description: string;
  cfg: Cfg;
}[] = [
  { id: "modern", name: "Modern", category: "Professional", description: "Accent bar, clean sections", cfg: { category: "Professional", layout: "single", header: "plain", heading: "bar", skills: "chips", exp: "default" } },
  { id: "minimal", name: "Minimal", category: "Simple", description: "Airy, centered, monochrome", cfg: { category: "Simple", layout: "single", header: "centered", heading: "underline", skills: "inline", exp: "default" } },
  { id: "classic", name: "Classic", category: "Academic", description: "Timeless, ATS-friendly", cfg: { category: "Academic", layout: "single", header: "centered", heading: "double", skills: "inline", exp: "default" } },
  { id: "sidebar", name: "Sidebar", category: "Creative", description: "Colored left rail + photo", cfg: { category: "Creative", layout: "left", header: "rail", heading: "bar", skills: "list", exp: "default", photo: true } },
  { id: "elegant", name: "Elegant", category: "Creative", description: "Refined hairline accents", cfg: { category: "Creative", layout: "single", header: "centered", heading: "hairline", skills: "inline", exp: "default" } },
  { id: "compact", name: "Compact", category: "Simple", description: "Dense, one-page friendly", cfg: { category: "Simple", layout: "single", header: "compact", heading: "bar", skills: "inline", exp: "compact", dense: true } },
  { id: "executive", name: "Executive", category: "Professional", description: "Bold accent header band", cfg: { category: "Professional", layout: "single", header: "band", heading: "rule", skills: "inline", exp: "default" } },
  { id: "timeline", name: "Timeline", category: "Creative", description: "Vertical timeline experience", cfg: { category: "Creative", layout: "single", header: "plain", heading: "bar", skills: "chips", exp: "timeline" } },
  { id: "banner", name: "Banner", category: "Creative", description: "Full-width header + photo", cfg: { category: "Creative", layout: "single", header: "band", heading: "bar", skills: "chips", exp: "default", photo: true } },
  { id: "split", name: "Split", category: "Professional", description: "Name left, contact right", cfg: { category: "Professional", layout: "single", header: "split", heading: "underline", skills: "chips", exp: "default" } },
  { id: "technical", name: "Technical", category: "Technical", description: "Dot headings, dev-ready", cfg: { category: "Technical", layout: "single", header: "compact", heading: "dot", skills: "chips", exp: "default" } },
  { id: "corporate", name: "Corporate", category: "Professional", description: "Filled section labels", cfg: { category: "Professional", layout: "single", header: "plain", heading: "block", skills: "inline", exp: "default" } },
  { id: "creative", name: "Creative", category: "Creative", description: "Bold rail, photo-forward", cfg: { category: "Creative", layout: "left", header: "rail", heading: "bar", skills: "chips", exp: "timeline", photo: true } },
  { id: "editorial", name: "Editorial", category: "Academic", description: "Magazine-style rules", cfg: { category: "Academic", layout: "single", header: "centered", heading: "rule", skills: "inline", exp: "default" } },
  { id: "gradient", name: "Gradient", category: "Creative", description: "Gradient header band", cfg: { category: "Creative", layout: "single", header: "gradient", heading: "underline", skills: "chips", exp: "default", photo: true } },
  { id: "boxed", name: "Boxed", category: "Professional", description: "Each section in a card", cfg: { category: "Professional", layout: "single", header: "plain", heading: "bar", skills: "chips", exp: "default", boxed: true } },
  { id: "leftbar", name: "Left Bar", category: "Simple", description: "Thick left-accent headings", cfg: { category: "Simple", layout: "single", header: "plain", heading: "leftbar", skills: "inline", exp: "default" } },
  { id: "centered", name: "Centered", category: "Simple", description: "Everything centered", cfg: { category: "Simple", layout: "single", header: "centered", heading: "caps", skills: "inline", exp: "default" } },
  { id: "sidebarright", name: "Sidebar Right", category: "Professional", description: "Rail on the right", cfg: { category: "Professional", layout: "right", header: "rail", heading: "bar", skills: "list", exp: "default", photo: true } },
  { id: "monochrome", name: "Monochrome", category: "Simple", description: "Print-safe black & white", cfg: { category: "Simple", layout: "single", header: "plain", heading: "rule", skills: "inline", exp: "default", mono: true } },
];

export const CATEGORIES: Category[] = ["Professional", "Creative", "Technical", "Academic", "Simple"];

/** Templates whose design shows a profile photo (used to hint the uploader). */
export const PHOTO_TEMPLATES = TEMPLATES.filter((t) => t.cfg.photo).map((t) => t.id);

/** Accent color swatches offered in the builder. */
export const ACCENT_PRESETS = [
  "#7c3aed", "#db2777", "#0ea5e9", "#0d9488",
  "#b45309", "#dc2626", "#15803d", "#1e293b",
];

/** Render a resume with its selected template. */
export function TemplateRenderer({ resume }: { resume: Resume }) {
  const entry = TEMPLATES.find((t) => t.id === resume.templateId) ?? TEMPLATES[0];
  return <RenderDoc resume={resume} cfg={entry.cfg} />;
}
