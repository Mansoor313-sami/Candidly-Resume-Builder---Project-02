import type { Resume } from "@/types/resume";
import { ALL_SECTIONS } from "@/types/resume";
import { uid } from "@/lib/utils";

/**
 * Fills a resume with realistic sample content so graders/first-time users can
 * see a complete resume instantly. Keeps identity fields (id, owner, slug,
 * template, accent) from the current resume.
 */
export function withSampleContent(base: Resume): Resume {
  return {
    ...base,
    personalInfo: {
      fullName: "Sami Mansoor",
      title: "Full-Stack Developer",
      email: "sami@example.com",
      phone: "+92 300 1234567",
      location: "Lahore, PK",
      website: "sami.dev",
      linkedin: "in/sami-mansoor",
      github: "github.com/sami",
    },
    professionalSummary:
      "Full-stack developer with 3 years building fast, accessible web apps in React and Node. I care about clean architecture, thoughtful UX, and shipping features that move the numbers.",
    experiences: [
      {
        id: uid(), role: "Frontend Developer", company: "Devloria", location: "Remote", startDate: "2023", endDate: "", current: true,
        bullets: [
          "Built a component library adopted across 4 products, cutting UI build time by 35%.",
          "Led the migration to Next.js App Router, improving Lighthouse performance from 68 to 96.",
          "Mentored 2 junior developers through code reviews and pairing.",
        ],
      },
      {
        id: uid(), role: "Web Developer Intern", company: "Northwind Labs", location: "Lahore", startDate: "2022", endDate: "2023", current: false,
        bullets: [
          "Shipped a customer dashboard used by 1,200+ users on launch week.",
          "Automated deployment with GitHub Actions, reducing release time from 40 to 6 minutes.",
        ],
      },
    ],
    education: [
      { id: uid(), institution: "NUST", degree: "BS", field: "Computer Science", startDate: "2019", endDate: "2023", location: "Islamabad" },
    ],
    skills: ["React", "TypeScript", "Next.js", "Node.js", "Firebase", "Tailwind CSS", "REST APIs", "Git"],
    projects: [
      { id: uid(), name: "Candidly", description: "An AI resume & portfolio builder with a live preview, 20 templates, and PDF export.", technologies: ["Next.js", "Firebase", "Gemini"], url: "candidly.app", repositoryUrl: "" },
    ],
    certifications: [
      { id: uid(), name: "Meta Front-End Developer", issuer: "Coursera", date: "2023", url: "" },
    ],
    languages: [
      { id: uid(), name: "English", proficiency: "Fluent" },
      { id: uid(), name: "Urdu", proficiency: "Native" },
    ],
    // Show certifications + languages for the sample.
    sectionOrder: [...ALL_SECTIONS],
    hiddenSections: ["awards", "publications", "interests"],
  };
}
