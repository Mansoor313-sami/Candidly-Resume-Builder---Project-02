"use client";

import { motion, type Variants } from "motion/react";
import { Loader2 } from "lucide-react";

/** Decorative animated aurora background. Drop once per themed page. */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      <div className="aurora-3" />
    </div>
  );
}

/** Inline loading spinner. */
export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin-slow ${className}`} />;
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

/**
 * Fades/slides its children into view once they scroll into the viewport.
 * `delay` staggers siblings for a graceful cascade.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
