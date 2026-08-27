import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Aurora } from "@/components/ui/motion";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center p-6 text-center">
      <Aurora />
      <div>
        <Brand />
        <p className="mt-12 text-sm font-bold uppercase tracking-[.2em] text-brand2">Error 404</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight">
          <span className="text-gradient">This page</span> has moved on.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          The link may be broken or the page may have been removed. Let&apos;s get
          you back to somewhere useful.
        </p>
        <Link href="/" className="btn btn-primary mt-7">
          <ArrowLeft size={17} /> Back home
        </Link>
      </div>
    </main>
  );
}
