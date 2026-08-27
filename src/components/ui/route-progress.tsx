"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FullscreenLoader } from "./loader";

/**
 * Global navigation feedback. The moment a user clicks an internal link, a
 * glowing progress bar appears at the top of the screen so they immediately
 * know the app is working — even when the destination is a fast static page.
 * If a navigation takes longer than ~400ms, the full-screen loader also
 * appears. Progress completes when the route's pathname actually changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);

  function clearTimers() {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    if (safety.current) clearTimeout(safety.current);
  }

  function start() {
    if (active) return;
    startedAt.current = Date.now();
    setActive(true);
    clearTimers();
    // Escalate to the full-screen loader only if the page is slow to arrive.
    overlayTimer.current = setTimeout(() => setOverlay(true), 400);
    // Safety net: never let the indicator get stuck.
    safety.current = setTimeout(finish, 12000);
  }

  function finish() {
    clearTimers();
    setOverlay(false);
    setActive(false);
  }

  // Detect internal link clicks and start progress immediately.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || target === "_blank" || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return; // external
      if (url.pathname === location.pathname) return; // same page
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // When the pathname changes, the navigation is done — but keep the bar up
  // for a minimum time so quick pages still show visible feedback.
  useEffect(() => {
    if (!active) return;
    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, 550 - elapsed);
    const t = setTimeout(finish, wait);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;
  return (
    <>
      <div className="route-bar no-print" aria-hidden />
      {overlay && <FullscreenLoader label="Loading…" />}
    </>
  );
}
