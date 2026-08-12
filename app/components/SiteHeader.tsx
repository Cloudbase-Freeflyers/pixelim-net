"use client";

import { useEffect, useState } from "react";
import { css } from "@/app/lib/css";

export type ActivePage = "home" | "acrylic" | "canvas" | "aluminium";

const NAV_LINKS = [
  { key: "acrylic", label: "Acrylic Prints", href: "/acrylic-photo-prints" },
  { key: "canvas", label: "Canvas Prints", href: "/canvas-prints" },
  { key: "aluminium", label: "Aluminum Prints", href: "/aluminium-prints" },
] as const;

export default function SiteHeader({
  active,
  createHref,
}: {
  active: ActivePage;
  createHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled ? "rgba(8,8,15,.92)" : "transparent";
  const navBorder = scrolled ? "rgba(255,255,255,.09)" : "transparent";

  return (
    <div
      style={css(
        `position:fixed;top:0;left:0;right:0;z-index:60;background:${navBg};backdrop-filter:blur(14px);border-bottom:1px solid ${navBorder};transition:background .3s ease,border-color .3s ease`
      )}
    >
      <div
        style={css(
          "max-width:1240px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px"
        )}
      >
        <a href="/" style={css("display:flex;align-items:center;color:#fff")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-light-v2.svg"
            alt="Pixelim — Digital Design Factory"
            style={css("display:block;height:38px;width:auto")}
          />
        </a>
        <nav
          data-desktop-only=""
          style={css(
            "align-items:center;gap:28px;font-size:14.5px;font-weight:500"
          )}
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.key === active;
            return (
              <a
                key={link.key}
                href={isActive ? "#" : link.href}
                style={css(`color:${isActive ? "#ffffff" : "#c9c9de"}`)}
              >
                {link.label}
              </a>
            );
          })}
          <a href="#contact" style={css("color:#c9c9de")}>
            Contact
          </a>
        </nav>
        <div style={css("display:flex;align-items:center;gap:12px")}>
          <a
            href={createHref}
            style={css(
              "display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:13.5px;font-weight:600;box-shadow:0 8px 24px rgba(236,72,153,.32)"
            )}
          >
            Create Yours
          </a>
        </div>
      </div>
    </div>
  );
}
