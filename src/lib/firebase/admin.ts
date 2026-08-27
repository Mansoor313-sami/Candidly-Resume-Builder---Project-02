import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Resume } from "@/types/resume";

/**
 * OPTIONAL server-side Firebase Admin. When a service account is configured
 * (via env vars), public resume pages are rendered on the server for real SEO
 * and per-resume Open Graph metadata. When it's NOT configured, everything
 * still works — the public page falls back to client-side fetching.
 */
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const adminConfigured = Boolean(projectId && clientEmail && privateKey);

let app: App | undefined;
if (adminConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

/** Fetch a public resume by slug on the server. Returns serializable data. */
export async function fetchPublicResumeAdmin(slug: string): Promise<Resume | null> {
  if (!adminConfigured || !app) return null;
  try {
    const db = getFirestore(app);
    const snap = await db.collection("resumes").where("slug", "==", slug).where("isPublic", "==", true).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const data = doc.data() as Record<string, unknown>;
    // Firestore Timestamps aren't serializable to Client Components — drop them.
    delete data.createdAt;
    delete data.updatedAt;
    delete data.lastViewedAt;
    return { id: doc.id, ...data } as Resume;
  } catch {
    return null;
  }
}
