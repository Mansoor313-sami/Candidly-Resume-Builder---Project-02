import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, geminiErrorResponse } from "@/lib/gemini";
import { allowAiRequest, verifyFirebaseToken } from "@/lib/firebase/admin";

/**
 * Server-only cover-letter generator. Takes the resume's facts plus a pasted
 * job description and asks Gemini to write a tailored letter — grounded only
 * in the facts provided (no invented experience). The model is chosen
 * automatically by lib/gemini.ts (with a GEMINI_MODEL override).
 */
const input = z.object({
  name: z.string().trim().max(120),
  title: z.string().trim().max(160),
  summary: z.string().trim().max(1200),
  experiences: z.array(z.string().trim().max(400)).max(20),
  skills: z.array(z.string().trim().max(60)).max(50),
  jobDescription: z.string().trim().min(20).max(6000),
});

export async function POST(request: Request) {
  const identity = await verifyFirebaseToken(request);
  if ("error" in identity) return NextResponse.json({ error: identity.error }, { status: identity.status });
  if (!allowAiRequest(identity.uid, 6)) return NextResponse.json({ error: "AI request limit reached. Wait a minute, then try again." }, { status: 429 });
  const body = input.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Add a job description (at least 20 characters) to generate a letter." }, { status: 400 });
  }

  const d = body.data;
  const prompt =
    `Write a concise, professional cover letter (3–4 short paragraphs) for this candidate, tailored to the job description.\n` +
    `Ground every claim ONLY in the candidate facts below. Do NOT invent employers, metrics, dates, or achievements. ` +
    `Use a confident, warm, human tone. Return ONLY the letter text (no placeholders like [Company], no markdown).\n\n` +
    `CANDIDATE\nName: ${d.name || "The candidate"}\nTitle: ${d.title}\nSummary: ${d.summary}\n` +
    `Experience highlights:\n${d.experiences.map((e) => `- ${e}`).join("\n")}\n` +
    `Skills: ${d.skills.join(", ")}\n\n` +
    `JOB DESCRIPTION\n${d.jobDescription}`;

  try {
    const coverLetter = await generateText(prompt);
    return NextResponse.json({ coverLetter });
  } catch (error) {
    const { message, status } = geminiErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
