import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

type VerifiedIdentity = { uid: string };
type IdentityFailure = { error: string; status: 401 | 503 };

/**
 * Require a Firebase ID token for an AI request. The browser gets this token
 * from Firebase Auth; the server verifies it with the Admin SDK before the
 * Gemini key can be used.
 */
export async function verifyFirebaseToken(request: Request): Promise<VerifiedIdentity | IdentityFailure> {
  if (!adminConfigured || !app) {
    return { error: "AI is not configured on the server.", status: 503 };
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { error: "Please sign in to use AI tools.", status: 401 };
  }

  try {
    const token = await getAuth(app).verifyIdToken(authorization.slice(7));
    return { uid: token.uid };
  } catch {
    return { error: "Your session has expired. Please sign in again.", status: 401 };
  }
}

type RateLimitWindow = { startedAt: number; count: number };
const aiRateLimit = new Map<string, RateLimitWindow>();
const RATE_LIMIT_WINDOW_MS = 60_000;

/** A small per-instance guard against rapid, expensive AI requests. */
export function allowAiRequest(uid: string, maximumPerMinute = 12): boolean {
  const now = Date.now();
  const current = aiRateLimit.get(uid);

  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    aiRateLimit.set(uid, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= maximumPerMinute) return false;
  current.count += 1;
  return true;
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
