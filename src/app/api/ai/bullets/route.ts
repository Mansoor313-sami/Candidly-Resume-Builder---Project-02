import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, geminiErrorResponse } from "@/lib/gemini";

/**
 * Bullet generator: turns a short, plain description of what someone did into
 * 2–3 polished resume bullet options — grounded only in what they wrote.
 */
const input = z.object({
  prompt: z.string().trim().min(4).max(600),
  role: z.string().trim().max(160).optional().default(""),
});

function parseArray(text: string): string[] {
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return (JSON.parse(match[0]) as unknown[]).map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* fall through to line parsing */
  }
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
    .filter((l) => l.length > 8)
    .slice(0, 3);
}

export async function POST(request: Request) {
  const body = input.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Describe what you did (a few words is fine)." }, { status: 400 });
  }
  const { prompt, role } = body.data;
  const aiPrompt =
    `Write 3 concise, professional resume bullet points based ONLY on this description` +
    `${role ? ` for the role "${role}"` : ""}. Start each with a strong action verb. ` +
    `Do NOT invent metrics, employers, or facts not implied by the description; if a metric is mentioned, keep it. ` +
    `Return ONLY a JSON array of 3 strings.\n\nDescription: ${prompt}`;

  try {
    const text = await generateText(aiPrompt);
    const options = parseArray(text).slice(0, 3);
    if (options.length === 0) return NextResponse.json({ error: "Couldn't generate bullets. Try rephrasing." }, { status: 502 });
    return NextResponse.json({ options });
  } catch (error) {
    const { message, status } = geminiErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
