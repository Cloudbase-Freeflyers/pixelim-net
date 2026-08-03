import type { CSSProperties } from "react";

/**
 * Convert a plain CSS declaration string (the format the original Pixelim pages
 * were authored in, e.g. `padding:14px 20px;display:flex`) into a React style
 * object. Keeping the source declarations verbatim makes this port a faithful
 * copy of the hand-tuned inline styling without translating every rule by hand.
 *
 * Note: values in this codebase never contain a `:` (no `url(...)` with a
 * protocol, no data URIs), so splitting each declaration on the first `:` is safe.
 */
export function css(decl: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const part of decl.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const prop = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!prop || !value) continue;
    style[toCamelCase(prop)] = value;
  }
  return style as unknown as CSSProperties;
}

function toCamelCase(prop: string): string {
  // Preserve CSS custom properties (--foo) untouched.
  if (prop.startsWith("--")) return prop;
  return prop
    .replace(/^-ms-/, "ms-")
    .replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
}
