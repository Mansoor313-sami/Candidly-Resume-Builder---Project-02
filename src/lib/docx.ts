import type { Resume, SectionKey } from "@/types/resume";
import { orderedSections } from "@/types/resume";

/**
 * Export a resume as an editable Word (.docx) document. Many recruiters ask
 * for Word, so this complements the PDF export. Built with the `docx` library,
 * dynamically imported so it only loads when used.
 */
export async function exportResumeDocx(resume: Resume, filename = "resume.docx") {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
  const p = resume.personalInfo;
  const accent = (resume.accentColor || "16a34a").replace("#", "");

  const children: InstanceType<typeof Paragraph>[] = [];

  children.push(new Paragraph({ children: [new TextRun({ text: p.fullName || "Your name", bold: true, size: 40 })] }));
  if (p.title) children.push(new Paragraph({ children: [new TextRun({ text: p.title, color: accent, size: 26 })] }));
  const contact = [p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean).join("  •  ");
  if (contact) children.push(new Paragraph({ children: [new TextRun({ text: contact, size: 18, color: "555555" })] }));

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 80 },
      border: { bottom: { color: accent, size: 6, style: BorderStyle.SINGLE, space: 1 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, color: accent, size: 22 })],
    });
  const line = (runs: InstanceType<typeof TextRun>[]) => new Paragraph({ spacing: { after: 40 }, children: runs });
  const bullet = (text: string) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text, size: 20 })] });

  const render: Record<SectionKey, () => void> = {
    summary: () => { children.push(heading("Profile")); children.push(line([new TextRun({ text: resume.professionalSummary, size: 20 })])); },
    experience: () => {
      children.push(heading("Experience"));
      resume.experiences.forEach((x) => {
        children.push(line([new TextRun({ text: x.role || "Role", bold: true, size: 22 }), new TextRun({ text: `   ${[x.company, x.location].filter(Boolean).join(" · ")}`, size: 20, color: "555555" }), new TextRun({ text: `   ${[x.startDate, x.current ? "Present" : x.endDate].filter(Boolean).join(" – ")}`, size: 18, color: "888888" })]));
        x.bullets.filter(Boolean).forEach((b) => children.push(bullet(b)));
      });
    },
    projects: () => {
      children.push(heading("Projects"));
      resume.projects.forEach((x) => {
        children.push(line([new TextRun({ text: x.name || "Project", bold: true, size: 22 }), new TextRun({ text: x.technologies.length ? `   ${x.technologies.join(", ")}` : "", size: 18, color: accent })]));
        if (x.description) children.push(line([new TextRun({ text: x.description, size: 20 })]));
      });
    },
    education: () => {
      children.push(heading("Education"));
      resume.education.forEach((x) => children.push(line([new TextRun({ text: x.institution, bold: true, size: 22 }), new TextRun({ text: `   ${[x.degree, x.field].filter(Boolean).join(", ")}`, size: 20 }), new TextRun({ text: `   ${[x.startDate, x.endDate].filter(Boolean).join(" – ")}`, size: 18, color: "888888" })])));
    },
    skills: () => { children.push(heading("Skills")); children.push(line([new TextRun({ text: resume.skills.join("  •  "), size: 20 })])); },
    certifications: () => { children.push(heading("Certifications")); resume.certifications.forEach((c) => children.push(line([new TextRun({ text: c.name, bold: true, size: 20 }), new TextRun({ text: [c.issuer, c.date].filter(Boolean).length ? `   ${[c.issuer, c.date].filter(Boolean).join(" · ")}` : "", size: 18, color: "555555" })]))); },
    languages: () => { children.push(heading("Languages")); children.push(line([new TextRun({ text: resume.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  "), size: 20 })])); },
    awards: () => { children.push(heading("Awards")); resume.awards.forEach((a) => children.push(line([new TextRun({ text: a.title, bold: true, size: 20 }), new TextRun({ text: [a.issuer, a.date].filter(Boolean).length ? `   ${[a.issuer, a.date].filter(Boolean).join(" · ")}` : "", size: 18, color: "555555" })]))); },
    publications: () => { children.push(heading("Publications")); resume.publications.forEach((pub) => children.push(line([new TextRun({ text: pub.title, bold: true, size: 20 }), new TextRun({ text: [pub.publisher, pub.date].filter(Boolean).length ? `   ${[pub.publisher, pub.date].filter(Boolean).join(" · ")}` : "", size: 18, italics: true, color: "555555" })]))); },
    interests: () => { children.push(heading("Interests")); children.push(line([new TextRun({ text: resume.interests.join("  •  "), size: 20 })])); },
  };

  orderedSections(resume).forEach((k) => render[k]());

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
