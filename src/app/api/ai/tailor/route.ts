import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, geminiErrorResponse } from "@/lib/gemini";

/**
 * Tailor-to-job: rewrites the professional summary to target a pasted job
 * description and suggests skills to add — grounded only in the candidate's
 * real experience (no invented facts). Returns strict JSON.
 */
const input = z.object({
  title: z.string().trim().max(160),
  summary: z.string().trim().max(1200),
  skills: z.array(z.string().trim().max(60)).max(60),
  experiences: z.array(z.string().trim().max(400)).max(20),
  jobDescription: z.string().trim().min(20).max(6000),
});

/** Pull the first JSON object out of a model response. */
function parseJson(text: string): { summary?: string; suggestedSkills?: string[] } {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = input.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Add a job description (at least 20 characters)." }, { status: 400 });
  }
  const d = body.data;
  const prompt =
    `You are tailoring a candidate's resume to a specific job. Using ONLY the candidate facts below ` +
    `(never invent employers, metrics, or experience), do two things:\n` +
    `1) Rewrite the professional summary (2–3 sentences) to emphasize what this job values.\n` +
    `2) From the job description, list up to 8 skills the candidate plausibly has (based on their experience) ` +
    `that would strengthen the match — skills only, no sentences.\n` +
    `Return ONLY valid JSON: {"summary": string, "suggestedSkills": string[]}\n\n` +
    `CANDIDATE TITLE: ${d.title}\nCURRENT SUMMARY: ${d.summary}\nSKILLS: ${d.skills.join(", ")}\n` +
    `EXPERIENCE:\n${d.experiences.map((e) => `- ${e}`).join("\n")}\n\nJOB DESCRIPTION:\n${d.jobDescription}`;

  try {
    const text = await generateText(prompt);
    const parsed = parseJson(text);
    return NextResponse.json({
      summary: (parsed.summary || "").trim(),
      suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills.slice(0, 8).map((s) => String(s).trim()).filter(Boolean) : [],
    });
  } catch (error) {
    const { message, status } = geminiErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
