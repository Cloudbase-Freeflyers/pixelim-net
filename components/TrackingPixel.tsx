"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const COOKIE_NAME = "pixelim_vid";
const SESSION_KEY = "pixelim_sid";
const DEDUP_KEY = "pixelim_tracked";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateVisitorId(): string {
  // Parse existing cookies
  for (const part of document.cookie.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === COOKIE_NAME && v) return decodeURIComponent(v);
  }
  // Create and persist new ID
  const id = generateUUID();
  const maxAge = 2 * 365 * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${id}; max-age=${maxAge}; path=/${secure}; SameSite=Lax`;
  return id;
}

function getOrCreateSessionId(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) || (() => {
      const id = generateUUID();
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    })();
  } catch {
    return generateUUID();
  }
}

function wasTracked(key: string): boolean {
  try {
    const list = JSON.parse(sessionStorage.getItem(DEDUP_KEY) || "[]") as string[];
    return list.includes(key);
  } catch {
    return false;
  }
}

function markTracked(key: string): void {
  try {
    const list = JSON.parse(sessionStorage.getItem(DEDUP_KEY) || "[]") as string[];
    if (!list.includes(key)) {
      sessionStorage.setItem(DEDUP_KEY, JSON.stringify([...list, key].slice(-50)));
    }
  } catch { /* ignore */ }
}

function getUtms(): Record<string, string> | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const r: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const v = p.get(k);
      if (v) r[k] = v;
    }
    return Object.keys(r).length ? r : null;
  } catch { return null; }
}

function getClickIds(): Record<string, string> | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const r: Record<string, string> = {};
    for (const k of ["gclid", "fbclid", "ttclid", "msclkid", "twclid"]) {
      const v = p.get(k);
      if (v) r[k] = v;
    }
    return Object.keys(r).length ? r : null;
  } catch { return null; }
}

export default function TrackingPixel() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // The admin panel is not a public funnel surface — don't track it.
      if (pathname.startsWith("/admin")) return;

      const pageKey = `${pathname}${window.location.search}`;
      if (wasTracked(pageKey)) return;
      markTracked(pageKey);

      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          sessionId,
          type: "pageview",
          url: window.location.href,
          path: pathname,
          referrer: document.referrer || null,
          utms: getUtms(),
          clickIds: getClickIds(),
          userAgent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[TrackingPixel]", err);
      }
    }
  }, [pathname]);

  return null;
}
