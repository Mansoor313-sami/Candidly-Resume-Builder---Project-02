/**
 * The single Firestore access layer for resumes. Every read/write goes through
 * here so the rest of the app never touches Firestore APIs directly.
 * Documents live in the `resumes` collection, one per resume, scoped by
 * `ownerId` (enforced for real by firestore.rules).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { ALL_SECTIONS, DEFAULT_ACCENT, OPTIONAL_SECTIONS, type Resume } from "@/types/resume";

const resumes = () => collection(db!, "resumes");

/** Turn a string into a clean URL slug fragment (no random suffix). */
export function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Build a URL-safe, reasonably unique slug from a title. */
function slugify(title: string) {
  return `${toSlug(title) || "resume"}-${crypto.randomUUID().slice(0, 6)}`;
}

/** Check whether a slug is free (ignoring the resume that owns it). */
export async function isSlugAvailable(slug: string, exceptId: string) {
  if (!slug) return false;
  const snap = await getDocs(query(resumes(), where("slug", "==", slug)));
  return snap.docs.every((d) => d.id === exceptId);
}

/** All resumes owned by a user, newest-updated first. */
export async function listResumes(uid: string) {
  const snap = await getDocs(query(resumes(), where("ownerId", "==", uid)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Resume)
    .sort((a, b) => {
      const at = (a.updatedAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
      const bt = (b.updatedAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
      return bt - at;
    });
}

/** Create a new, empty resume and return its id. */
export async function createResume(
  uid: string,
  data: Pick<Resume, "title" | "templateId">
) {
  const ref = await addDoc(resumes(), {
    ...data,
    ownerId: uid,
    slug: slugify(data.title),
    tag: "",
    isPublic: false,
    accentColor: DEFAULT_ACCENT,
    fontId: "modern",
    photoUrl: "",
    personalInfo: {},
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Increment the public view counter (anonymous-safe — see firestore.rules). */
export async function recordView(id: string) {
  try {
    await updateDoc(doc(db!, "resumes", id), {
      viewCount: increment(1),
      lastViewedAt: serverTimestamp(),
    });
  } catch {
    /* view counting is best-effort; ignore failures */
  }
}

/** Patch a resume (used by the debounced autosave in the builder). */
export async function saveResume(id: string, data: Partial<Resume>) {
  await updateDoc(doc(db!, "resumes", id), { ...data, updatedAt: serverTimestamp() });
}

/** Load one resume by document id (owner-only, enforced by rules). */
export async function fetchResume(id: string) {
  const snap = await getDoc(doc(db!, "resumes", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Resume) : null;
}

/** Permanently delete a resume. */
export async function removeResume(id: string) {
  await deleteDoc(doc(db!, "resumes", id));
}

/** Duplicate a resume into a fresh private draft owned by `uid`. */
export async function copyResume(source: Resume, uid: string) {
  const { id, createdAt, updatedAt, ...data } = source;
  void id;
  void createdAt;
  void updatedAt;
  const ref = doc(resumes());
  await setDoc(ref, {
    ...data,
    ownerId: uid,
    isPublic: false,
    title: `${source.title} copy`,
    slug: `${source.slug}-${crypto.randomUUID().slice(0, 4)}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Public read of a resume by slug — only returns documents marked public. */
export async function fetchPublicResume(slug: string) {
  const snap = await getDocs(
    query(resumes(), where("slug", "==", slug), where("isPublic", "==", true))
  );
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Resume);
}
