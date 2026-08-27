# Candidly — AI Resume & Portfolio Builder

> **Devloria Internship Project 02 · Task 9 · Mansoor Ahmad**

Candidly is a full-stack AI resume builder. Create a resume through guided sections, see every change in a live preview, improve writing with Gemini AI, choose a design, export it, or publish a shareable resume page.

## Links

| Resource | Link |
| --- | --- |
| GitHub repository | [Mansoor313-sami/Candidly-Resume-Builder---Project-02](https://github.com/Mansoor313-sami/Candidly-Resume-Builder---Project-02) |
| Live deployment (Vercel) | [project-02-livid.vercel.app](https://project-02-livid.vercel.app/) |

## Highlights

- **Auth + saved drafts** — Firebase email/password auth; every resume is a per-user Firestore document, autosaved as you type.
- **Guided builder** — Personal, Summary, Experience, Education, Skills, Projects, Cover Letter, and Design tabs. A live preview updates on every keystroke, with a completeness meter, **drag-to-reorder**, and **undo/redo with keyboard shortcuts**.
- **AI assist (Google Gemini)** — Improve, shorten, expand, quantify, or re-tone (professional / confident / friendly) a bullet or summary, generate bullets from notes, tailor content to a job description, and create a cover letter. AI results use a before/after acceptance flow; prompts instruct the model not to invent facts.
- **20 templates + fonts + accent + photo** — 20 designs across 5 categories with a live category filter, five curated font pairings, an accent-color picker, and a profile-photo option for photo-friendly templates. Switch anything instantly without touching your content.
- **Resume review** — Instant, client-side ATS-style score, completion checks, writing feedback, and keyword matching—without needing an AI request.
- **Export-ready** — Download a multi-page A4 PDF that mirrors the preview, export an editable Word (`.docx`) file, or use browser print.
- **Public sharing** — Toggle a resume public and share `/resume/[slug]`; private by default, with a QR code and a public view counter.
- **Sample content** — Quickly populate the editor with realistic example content for demos and first-time use.
- **Bold, modern UI** — A charming two-color light theme, a deep dark theme, animated aurora backgrounds, a full-screen loading overlay, motion transitions, toasts, skeletons, and polished empty/loading/focus states throughout.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Firebase Auth + Firestore · Google Gemini (`@google/genai`) · Motion (Framer Motion) · html2canvas + jsPDF · Zod.

## Getting started

### Prerequisites

- Node.js 20 or later
- A Firebase project with **Authentication** and **Cloud Firestore** enabled
- A Google Gemini API key for the optional AI tools

### Run locally

```bash
git clone https://github.com/Mansoor313-sami/Candidly-Resume-Builder---Project-02.git
cd Candidly-Resume-Builder---Project-02
npm install
```

1. Copy `.env.example` to `.env.local` and populate it with your own values.
2. In Firebase, enable **Email/Password** sign-in and create a **Cloud Firestore** database.
3. Publish the rules in `firestore.rules`. Create the required Firestore index from `firestore.indexes.json` (or follow Firebase's index-creation link if prompted).
4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Validate the project

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

**Status:** Live on Vercel ✅

**Live URL:** [https://project-02-livid.vercel.app/](https://project-02-livid.vercel.app/)

The project is deployed as a Next.js application on Vercel. For future configuration changes, add or update environment variables in **Vercel → Project Settings → Environment Variables**, then create a new deployment from the `main` branch.

Set the following value in Vercel so public-resume metadata uses the live address:

```env
NEXT_PUBLIC_SITE_URL=https://project-02-livid.vercel.app
```

> Never paste `GEMINI_API_KEY` or `FIREBASE_ADMIN_PRIVATE_KEY` into client-side code, the repository, screenshots, or public documentation.

## Environment variables

| Variable | Purpose | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web app config | Yes (public by design) |
| `GEMINI_API_KEY` | Gemini AI secret | **No — server only** |
| `GEMINI_MODEL` | Optional model override (default `gemini-3.6-flash`) | No |
| `FIREBASE_ADMIN_*` | Verifies Firebase ID tokens for protected AI routes; enables server-rendered public pages and Open Graph metadata | **No — server only** |

`NEXT_PUBLIC_FIREBASE_*` values are Firebase web configuration values and are intentionally visible in browser builds. All other variables above are secrets and must remain in `.env.local` locally or Vercel environment settings in production.

## Project structure

```
src/
  app/                 App Router pages, public resume route, and AI API routes
  components/
    ai/                AI assist control
    auth/              Sign in / sign up
    dashboard/         Dashboard
    layout/            Brand
    resume/            Builder, templates, preview, public page
    theme/             Theme provider + toggle
    ui/                Toast, motion helpers
  lib/                 Firebase, Firestore, Gemini, ATS review, PDF/Word export, utilities
  types/               Domain model
docs/                  Review guide, assignment audit, changelog
```

## Security

The Gemini secret is read only in server routes and never shipped to the browser. Every AI request must contain a Firebase ID token verified using Firebase Admin, and each signed-in user is rate-limited. AI inputs are Zod-validated and prompts forbid invented facts. Firestore rules require ownership for private writes, lock `ownerId` on updates, and expose documents anonymously only when `isPublic` is true. `.env.local`, service-account credentials, and build output are git-ignored.

## License

This project was created for the Devloria Internship Program. All rights reserved by the author unless a separate license is added.
