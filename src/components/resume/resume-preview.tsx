import type { Resume } from "@/types/resume";
import { TemplateRenderer } from "@/components/resume/templates";
import { fontVars } from "@/lib/fonts";

/**
 * The A4 "paper" that holds a rendered resume. Always a light document
 * (white background, dark text) regardless of the app theme, so it looks
 * identical on screen, in print, and in the exported PDF. The chosen font
 * pairing is applied here via CSS variables consumed by the templates.
 *
 * `id` lets callers target this exact node for PDF capture / printing.
 */
export function ResumePreview({ resume, id }: { resume: Resume; id?: string }) {
  return (
    <article id={id} style={fontVars(resume.fontId)} className="resume-paper rf-body mx-auto overflow-hidden">
      <TemplateRenderer resume={resume} />
    </article>
  );
}
