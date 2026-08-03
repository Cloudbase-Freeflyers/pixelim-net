"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals every `<section>` / `<footer>` inside `.page-anim` as it scrolls into
 * view (fade + rise). Renders nothing itself — it just wires up a single
 * IntersectionObserver. Re-runs on route changes so client-navigated pages get
 * their sections observed too. Honours `prefers-reduced-motion`.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".page-anim section, .page-anim footer"
      )
    );
    if (els.length === 0) return;

    // Reduced motion: show everything immediately, no animation.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
