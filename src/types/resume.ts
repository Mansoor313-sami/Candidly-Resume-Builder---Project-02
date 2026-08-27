/**
 * Domain model for a resume. One Firestore document = one Resume.
 * Section data lives in arrays so templates can render the same content
 * in different layouts, in a user-chosen order, without transforming it.
 */

export type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  repositoryUrl: string;
};

export type Certification = { id: string; name: string; issuer: string; date: string; url: string };
export type LanguageItem = { id: string; name: string; proficiency: string };
export type Award = { id: string; title: string; issuer: string; date: string; description: string };
export type Publication = { id: string; title: string; publisher: string; date: string; url: string };

export const LANGUAGE_LEVELS = ["Native", "Fluent", "Professional", "Intermediate", "Basic"] as const;

/** The ~20 visual layouts a resume can be rendered in. */
export type TemplateId =
  | "modern" | "minimal" | "classic" | "sidebar" | "elegant" | "compact"
  | "executive" | "timeline" | "banner" | "split" | "technical" | "corporate"
  | "creative" | "editorial" | "gradient" | "boxed" | "leftbar" | "centered"
  | "sidebarright" | "monochrome";

/** Curated font pairings a user can apply to any template. */
export type FontId = "modern" | "elegant" | "classic" | "technical" | "literary";

/** Body sections that can be reordered / hidden (Personal is the fixed header). */
export type SectionKey =
  | "summary" | "experience" | "projects" | "education" | "skills"
  | "certifications" | "languages" | "awards" | "publications" | "interests";

export const ALL_SECTIONS: SectionKey[] = [
  "summary", "experience", "projects", "education", "skills",
  "certifications", "languages", "awards", "publications", "interests",
];

/** Core sections always present; optional ones are "added" via the manager. */
export const CORE_SECTIONS: SectionKey[] = ["summary", "experience", "projects", "education", "skills"];
export const OPTIONAL_SECTIONS: SectionKey[] = ["certifications", "languages", "awards", "publications", "interests"];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  publications: "Publications",
  interests: "Interests",
};

export type Resume = {
  id: string;
  ownerId: string;
  title: string;
  /** Optional label to group variants ("Software", "Design"…). */
  tag: string;
  slug: string;
  isPublic: boolean;
  templateId: TemplateId;
  accentColor: string;
  fontId: FontId;
  photoUrl: string;
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: LanguageItem[];
  awards: Award[];
  publications: Publication[];
  interests: string[];
  /** Order in which body sections render. */
  sectionOrder: SectionKey[];
  /** Sections the user has toggled off. */
  hiddenSections: SectionKey[];
  coverLetter: string;
  jobDescription: string;
  /** Public analytics. */
  viewCount: number;
  lastViewedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

/** Default accent used for new resumes (emerald, matching the app theme). */
export const DEFAULT_ACCENT = "#16a34a";

/** A fresh, empty resume. Also used to backfill defaults on older documents. */
export const blankResume = (id = ""): Resume => ({
  id,
  ownerId: "",
  title: "Untitled resume",
  tag: "",
  slug: "",
  isPublic: false,
  templateId: "modern",
  accentColor: DEFAULT_ACCENT,
  fontId: "modern",
  photoUrl: "",
  personalInfo: {
    fullName: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "",
  },
  professionalSummary: "",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  publications: [],
  interests: [],
  sectionOrder: [...ALL_SECTIONS],
  hiddenSections: [...OPTIONAL_SECTIONS],
  coverLetter: "",
  jobDescription: "",
  viewCount: 0,
});

/** The visible, non-empty body sections in the user's chosen order. */
export function orderedSections(r: Resume): SectionKey[] {
  const order = r.sectionOrder?.length ? r.sectionOrder : ALL_SECTIONS;
  // Include any sections missing from a saved order (e.g. new features).
  const full = [...order, ...ALL_SECTIONS.filter((s) => !order.includes(s))];
  const hidden = new Set(r.hiddenSections || []);
  return full.filter((s) => !hidden.has(s) && sectionHasContent(r, s));
}

/** Whether a section has any content worth rendering. */
export function sectionHasContent(r: Resume, s: SectionKey): boolean {
  switch (s) {
    case "summary": return !!r.professionalSummary?.trim();
    case "experience": return r.experiences.length > 0;
    case "projects": return r.projects.length > 0;
    case "education": return r.education.length > 0;
    case "skills": return r.skills.length > 0;
    case "certifications": return r.certifications.length > 0;
    case "languages": return r.languages.length > 0;
    case "awards": return r.awards.length > 0;
    case "publications": return r.publications.length > 0;
    case "interests": return r.interests.length > 0;
  }
}
