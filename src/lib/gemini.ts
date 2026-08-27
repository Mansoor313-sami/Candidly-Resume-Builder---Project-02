import { GoogleGenAI } from "@google/genai";

/**
 * Server-only Gemini helper with automatic model fallback.
 *
 * Different API keys have access to different models, so instead of hard-coding
 * one, we try a prioritized list of common models and — if none work — ask the
 * API which models this key can actually use (`models.list`) and try those.
 * The first model that succeeds is cached for the rest of the server's life,
 * so later requests are fast. Set GEMINI_MODEL to force a specific model.
 */

let cachedModel: string | null = null;

const CANDIDATES = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-pro",
];

export class NoKeyError extends Error {}
export class NoModelError extends Error {}

/** True when an error means "this model isn't available" (so we should try another). */
function isModelUnavailable(err: unknown): boolean {
  const e = err as { status?: number; message?: string };
  const msg = (e?.message || "").toLowerCase();
  return (
    e?.status === 404 ||
    msg.includes("not found") ||
    msg.includes("not supported") ||
    msg.includes("unavailable") ||
    msg.includes("does not exist")
  );
}

/** Rank discovered model names so we prefer fast, current flash models. */
function score(n: string): number {
  let s = 0;
  if (n.includes("flash")) s += 10;
  if (n.includes("3.6")) s += 7;
  if (n.includes("2.5")) s += 5;
  if (n.includes("2.0")) s += 4;
  if (n.includes("pro")) s += 2;
  if (n.includes("lite")) s += 1;
  if (n.includes("latest")) s += 1;
  return s;
}

/** Ask the API which text models this key can use (best-effort). */
async function discoverModels(ai: GoogleGenAI): Promise<string[]> {
  try {
    const names: string[] = [];
    const pager = await ai.models.list();
    // The pager is async-iterable across pages.
    for await (const m of pager as AsyncIterable<{ name?: string; supportedActions?: string[] }>) {
      const name = (m.name || "").replace(/^models\//, "");
      if (!name.includes("gemini")) continue;
      if (/embedding|aqa|imagen|image|tts|vision|learnlm/i.test(name)) continue;
      const actions = m.supportedActions || [];
      const supportsGenerate = actions.length === 0 || actions.some((a) => String(a).toLowerCase().includes("generatecontent"));
      if (supportsGenerate) names.push(name);
    }
    return names.sort((a, b) => score(b) - score(a));
  } catch {
    return [];
  }
}

/** Generate text with fallback across models. Returns trimmed text or throws. */
export async function generateText(contents: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new NoKeyError("AI is not configured.");
  const ai = new GoogleGenAI({ apiKey });

  // Build the ordered list of models to try.
  const tryList: string[] = [];
  const push = (m?: string | null) => { if (m && !tryList.includes(m)) tryList.push(m); };
  push(cachedModel);
  push(process.env.GEMINI_MODEL);
  CANDIDATES.forEach(push);

  let lastErr: unknown;
  for (const model of tryList) {
    try {
      const res = await ai.models.generateContent({ model, contents });
      const text = res.text?.trim();
      if (text) {
        cachedModel = model;
        return text;
      }
    } catch (e) {
      lastErr = e;
      // A non-"unavailable" error (rate limit, bad key) should surface now.
      if (!isModelUnavailable(e)) throw e;
    }
  }

  // Nothing in the candidate list worked — ask the API what this key can use.
  const discovered = await discoverModels(ai);
  for (const model of discovered) {
    if (tryList.includes(model)) continue;
    try {
      const res = await ai.models.generateContent({ model, contents });
      const text = res.text?.trim();
      if (text) {
        cachedModel = model;
        return text;
      }
    } catch (e) {
      lastErr = e;
      if (!isModelUnavailable(e)) throw e;
    }
  }

  if (lastErr && !isModelUnavailable(lastErr)) throw lastErr;
  throw new NoModelError("No Gemini model available for this API key.");
}

/** Map a Gemini error to a friendly message + HTTP status for API routes. */
export function geminiErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof NoKeyError)
    return { message: "AI is not configured. Add GEMINI_API_KEY to the server environment.", status: 503 };
  if (error instanceof NoModelError)
    return {
      message:
        "This API key has no available Gemini text model. Enable the Generative Language API for your key, or set GEMINI_MODEL to a model you can access.",
      status: 502,
    };
  const status = (error as { status?: number }).status;
  if (status === 429) return { message: "Gemini rate limit reached. Wait a moment, then try again.", status: 429 };
  if (status === 401 || status === 403) return { message: "Gemini rejected this API key or its permissions.", status };
  return { message: "Gemini is temporarily unavailable. Please retry in a moment.", status: status && status >= 400 ? status : 502 };
}
