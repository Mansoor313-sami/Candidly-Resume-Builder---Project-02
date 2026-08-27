import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, geminiErrorResponse } from "@/lib/gemini";

/**
 * Server-only AI endpoint. The Gemini key never reaches the browser. Input is
 * validated with Zod, and the prompt forbids inventing any fact the user
 * didn't provide. The model is chosen automatically by lib/gemini.ts (with a
 * GEMINI_MODEL override), so it works across API keys with different access.
 */

const ACTIONS = ["improve", "shorten", "expand", "professional", "confident", "friendly", "quantify"] as const;
type Action = (typeof ACTIONS)[number];

const input = z.object({
  text: z.string().trim().min(3).max(1400),
  type: z.enum(["experience", "project", "summary"]),
  action: z.enum(ACTIONS).default("improve"),
});

/** Turn an action into a one-line instruction for the model. */
function instructionFor(action: Action) {
  switch (action) {
    case "shorten":
      return "Make it noticeably more concise while keeping every concrete detail. Prefer one tight sentence or a single strong line.";
    case "expand":
      return "Add helpful structure and clarity using ONLY the information already present. Do not add new facts, metrics, or claims — only phrase the existing content more fully.";
    case "professional":
      return "Rewrite in a polished, professional tone suitable for a corporate resume.";
    case "confident":
      return "Rewrite in a confident, results-oriented tone using strong action verbs, without exaggerating or inventing outcomes.";
    case "friendly":
      return "Rewrite in a warm, approachable yet professional tone.";
    case "quantify":
      return "Rephrase to highlight measurable impact. Where a metric clearly belongs but none is given, insert a bracketed placeholder like [X%] or [N] for the user to fill in — do NOT fabricate specific numbers.";
    case "improve":
    default:
      return "Improve clarity and impact with strong action verbs and clean phrasing.";
  }
}

export async function POST(request: Request) {
  const body = input.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Enter 3–1400 characters to work with." }, { status: 400 });
  }

  const { text, type, action } = body.data;
  const prompt =
    `You are editing a single ${type} entry on a professional resume.\n` +
    `${instructionFor(action)}\n` +
    `Hard rules: Preserve all factual meaning. Never invent or infer metrics, dates, employers, ` +
    `technologies, accomplishments, responsibilities, or any fact that is not already in the text. ` +
    `Return ONLY the rewritten text with no preamble, quotes, or markdown.\n\n` +
    `Text: ${text}`;

  try {
    const improvedText = await generateText(prompt);
    return NextResponse.json({ improvedText, action });
  } catch (error) {
    const { message, status } = geminiErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
