"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  signInWithPopup,
} from "firebase/auth";
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { auth, firebaseConfigured } from "@/lib/firebase/client";
import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Aurora, Spinner } from "@/components/ui/motion";

/** Google "G" logo. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.3 0-11.6-3.8-13.5-9.1l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * Shared sign-in / sign-up screen. `mode` decides the copy and which Firebase
 * call runs. A split layout shows brand storytelling on the left (desktop) and
 * the form on the right, with inline validation and friendly error messages.
 */
export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const signup = mode === "signup";

  function friendly(code?: string) {
    return code === "auth/invalid-credential"
      ? "That email or password is not correct."
      : code === "auth/email-already-in-use"
        ? "An account already exists for this email."
        : code === "auth/weak-password"
          ? "Choose a password with at least 6 characters."
          : code === "auth/popup-closed-by-user"
          ? "Google sign-in was cancelled."
          : code === "auth/operation-not-allowed"
            ? "This sign-in method isn't enabled in Firebase yet."
            : code === "auth/unauthorized-domain"
              ? "This website domain is not authorized in Firebase Authentication yet."
              : code === "auth/account-exists-with-different-credential"
                ? "An account with this email already exists. Sign in using the method you used originally."
              : "We couldn't complete that request. Please try again.";
  }

  // Mobile browsers commonly block OAuth pop-ups. On returning from Firebase's
  // redirect flow, complete the sign-in and take the user to their dashboard.
  useEffect(() => {
    if (!auth) return;
    let active = true;
    getRedirectResult(auth)
      .then((result) => {
        if (active && result) router.replace("/dashboard");
      })
      .catch((err: { code?: string }) => {
        if (active) setError(friendly(err.code));
      });
    return () => { active = false; };
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseConfigured || !auth) {
      setError("Firebase is not configured yet. Add the values from .env.example to .env.local.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (signup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try { await sendEmailVerification(cred.user); } catch { /* non-fatal */ }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(friendly((err as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (!firebaseConfigured || !auth) {
      setError("Firebase is not configured yet. Add the values from .env.example to .env.local.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const provider = new GoogleAuthProvider();
      const isMobile = window.matchMedia("(max-width: 767px)").matches
        || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return;
      }

      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      setError(friendly((err as { code?: string }).code));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError("");
    setNotice("");
    if (!auth) return;
    if (!email) { setError("Enter your email above first, then tap reset."); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice("Password reset email sent — check your inbox.");
    } catch (err) {
      setError(friendly((err as { code?: string }).code));
    }
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <Aurora />

      {/* Brand / storytelling panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand/15 via-brand2/10 to-brand3/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div>
          <span className="chip border border-brand/25 bg-brand/10 text-brand">
            <Sparkles size={14} /> AI resume & portfolio builder
          </span>
          <h2 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight">
            {signup ? "Start with a blank page." : "Welcome back to your workspace."}
          </h2>
          <ul className="mt-8 space-y-3 text-muted">
            {[
              "Guided forms with a live, print-accurate preview",
              "AI that improves your words — never invents them",
              "Six templates, PDF export, and shareable links",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-brand" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted">© 2026 Candidly</p>
      </aside>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-5 sm:p-8">
        <div className="absolute right-5 top-5 flex items-center gap-3 lg:right-8 lg:top-8">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
          className="card w-full max-w-md rounded-3xl p-7 sm:p-9"
        >
          <div className="lg:hidden">
            <Brand />
          </div>
          <h1 className="mt-8 font-display text-3xl font-bold lg:mt-0">
            {signup ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-2 text-muted">
            {signup
              ? "Set up your Candidly workspace in under a minute."
              : "Sign in to continue shaping your story."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block">
              <span className="label">Email</span>
              <input
                className="field"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="label">Password</span>
              <span className="relative block">
                <input
                  className="field pr-12"
                  type={show ? "text" : "password"}
                  minLength={6}
                  required
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder={signup ? "At least 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-brand"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>

            {!signup && (
              <div className="text-right">
                <button type="button" onClick={resetPassword} className="text-sm font-medium text-brand hover:underline">Forgot password?</button>
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
                {error}
              </motion.p>
            )}
            {notice && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-300">
                {notice}
              </motion.p>
            )}

            <button disabled={busy} className="btn btn-primary focus-ring w-full text-base">
              {busy ? (
                <><Spinner size={18} /> Please wait…</>
              ) : (
                <>{signup ? "Create account" : "Sign in"} <ArrowRight size={18} /></>
              )}
            </button>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>

            <button type="button" onClick={google} disabled={busy} className="btn btn-secondary focus-ring w-full text-base">
              <GoogleIcon /> Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {signup ? "Already have an account?" : "New to Candidly?"}{" "}
            <Link className="font-semibold text-brand hover:underline" href={signup ? "/sign-in" : "/sign-up"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
