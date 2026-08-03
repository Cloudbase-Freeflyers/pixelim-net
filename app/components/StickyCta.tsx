import { css } from "@/app/lib/css";

/** Mobile-only sticky "Start Your Print" bar fixed to the bottom of the screen. */
export default function StickyCta({ href }: { href: string }) {
  return (
    <div
      data-mobile-only=""
      style={css(
        "position:fixed;left:0;right:0;bottom:0;z-index:70;padding:12px 16px 16px;background:linear-gradient(180deg,rgba(13,13,26,0),rgba(13,13,26,.92) 40%);display:block"
      )}
    >
      <a
        href={href}
        style={css(
          "display:block;padding:16px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:16px;font-weight:600;text-align:center;box-shadow:0 12px 30px rgba(236,72,153,.45)"
        )}
      >
        Start Your Print
      </a>
    </div>
  );
}
