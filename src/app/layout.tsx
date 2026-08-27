import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { RouteProgress } from "@/components/ui/route-progress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://candidly.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Candidly — build a resume worth reading",
    template: "%s · Candidly",
  },
  description:
    "A guided, AI-assisted resume & portfolio builder with a live preview, 20 designer templates, PDF & Word export, an ATS review, and shareable links.",
  keywords: ["resume builder", "AI resume", "portfolio", "CV maker", "ATS", "cover letter", "Candidly"],
  applicationName: "Candidly",
  openGraph: {
    type: "website",
    siteName: "Candidly",
    title: "Candidly — AI resume & portfolio builder",
    description: "Build a polished, recruiter-ready resume with a live preview, honest AI, 20 templates, and PDF/Word export.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Candidly — AI resume & portfolio builder",
    description: "Build a polished, recruiter-ready resume with a live preview, honest AI, 20 templates, and PDF/Word export.",
  },
};

/* Runs before React hydrates so the correct theme paints on the first frame
   (no flash of the wrong mode). Falls back to the OS colour-scheme preference. */
const noFlashTheme = `(function(){try{var t=localStorage.getItem('candidly-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts: Inter (UI), Sora (display), Fraunces (serif templates).
            Loaded via stylesheet so the build never needs network access. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&family=Playfair+Display:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <RouteProgress />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
