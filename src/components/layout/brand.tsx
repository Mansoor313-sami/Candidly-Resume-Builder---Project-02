import Link from "next/link";

/**
 * The Candidly wordmark: a gradient "C" tile plus the name. Links home.
 * `size="sm"` is used in tight toolbars.
 */
export function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  const tile = size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <Link
      href="/"
      className="focus-ring inline-flex items-center gap-2.5 font-display font-bold tracking-tight"
    >
      <span
        className={`grid ${tile} place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white shadow-[0_8px_20px_-6px_rgb(var(--brand)/0.8)]`}
      >
        C
      </span>
      <span className={`${text} text-ink`}>Candidly</span>
    </Link>
  );
}
