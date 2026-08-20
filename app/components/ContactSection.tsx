"use client";

import { useState } from "react";
import { css } from "@/app/lib/css";

// The lead form is hidden for now — flip to true to bring it back.
const SHOW_LEAD_FORM = false;

const PHONE_TEL = "+18182355900";
const PHONE_DISPLAY = "+1 (818) 235-5900";
const CONTACT_EMAIL = "info@pixelim.net";

const ICON_STYLE =
  "flex:0 0 auto;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:16px";
const CONTACT_ROW_STYLE =
  "display:flex;align-items:center;gap:14px;font-size:17px;font-weight:500;color:#ffffff";

const FIELD_STYLE =
  "width:100%;box-sizing:border-box;padding:15px 18px;border-radius:12px;border:1px solid #e2e2ee;background:#ffffff;color:#12121f;font-family:inherit;font-size:15.5px";
const LABEL_STYLE =
  "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a5a5c4;margin-top:6px";

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "acrylic", label: "Acrylic Glass Prints" },
  { value: "canvas", label: "Canvas Prints" },
  { value: "aluminum", label: "Aluminum Prints" },
  { value: "other", label: "Something else" },
];

/**
 * Shared "Contact Us" section. The lead form is currently hidden
 * (SHOW_LEAD_FORM), so the section shows the contact details only, with a
 * click-to-reveal phone number. Set SHOW_LEAD_FORM back to true to restore the
 * form (it posts leads to /api/leads).
 */
export default function ContactSection({
  bgImg,
  bgAlt,
  para,
  uploadHref,
  defaultService = "",
}: {
  bgImg: string;
  bgAlt: string;
  para: string;
  uploadHref: string;
  defaultService?: string;
}) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: (fd.get("name") as string)?.trim(),
      phone: (fd.get("phone") as string)?.trim(),
      email: (fd.get("email") as string)?.trim(),
      service: (fd.get("service") as string) || "",
      message: (fd.get("message") as string)?.trim() || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "lp_form_submit" });
        setSubmitted(true);
        form.reset();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      style={css(
        "position:relative;padding:96px 20px;background:#0b0b14;overflow:hidden"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImg}
        alt={bgAlt}
        style={css(
          "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42"
        )}
      />
      <div
        style={css(
          "position:absolute;inset:0;background:linear-gradient(105deg,rgba(11,11,20,.96) 0%,rgba(11,11,20,.82) 46%,rgba(76,29,149,.42) 100%)"
        )}
      ></div>
      <div
        style={css(
          SHOW_LEAD_FORM
            ? "position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px;align-items:start"
            : "position:relative;max-width:560px;margin:0 auto"
        )}
      >
        <div>
          <p
            style={css(
              "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
            )}
          >
            Talk to a human
          </p>
          <h2
            style={css(
              "margin:12px 0 0;font-size:clamp(30px,3.8vw,44px);font-weight:600;letter-spacing:-.025em"
            )}
          >
            Contact Us
          </h2>
          <p
            style={css(
              "margin:18px 0 0;font-size:17px;line-height:1.7;color:#c4c4dc;max-width:440px;text-wrap:pretty"
            )}
          >
            {para}
          </p>
          <div style={css("display:grid;gap:14px;margin-top:32px")}>
            <a href={`mailto:${CONTACT_EMAIL}`} style={css(CONTACT_ROW_STYLE)}>
              <span style={css(ICON_STYLE)}>✉</span>
              {CONTACT_EMAIL}
            </a>
            {phoneRevealed ? (
              <a href={`tel:${PHONE_TEL}`} style={css(CONTACT_ROW_STYLE)}>
                <span style={css(ICON_STYLE)}>✆</span>
                {PHONE_DISPLAY}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setPhoneRevealed(true)}
                aria-label="Show phone number"
                style={css(
                  `${CONTACT_ROW_STYLE};background:transparent;border:0;padding:0;cursor:pointer;font-family:inherit;text-align:left`
                )}
              >
                <span style={css(ICON_STYLE)}>✆</span>
                Call us
              </button>
            )}
          </div>
          <p
            style={css(
              "margin:22px 0 0;font-size:14px;line-height:1.7;color:#9a9ab8"
            )}
          >
            We reply within one business day.
          </p>
        </div>

        {SHOW_LEAD_FORM &&
          (submitted ? (
            <div
              style={css(
                "display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:clamp(32px,4vw,48px);backdrop-filter:blur(10px);box-shadow:0 30px 70px rgba(0,0,0,.4);min-height:320px"
              )}
            >
              <span
                style={css(
                  "width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ec4899);display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;box-shadow:0 14px 34px rgba(236,72,153,.4)"
                )}
              >
                ✓
              </span>
              <h3
                style={css(
                  "margin:6px 0 0;font-size:24px;font-weight:600;letter-spacing:-.02em;color:#ffffff"
                )}
              >
                Thank you!
              </h3>
              <p
                style={css(
                  "margin:0;font-size:16px;line-height:1.6;color:#c4c4dc;max-width:360px"
                )}
              >
                We&apos;ve got your details and will get back to you within one
                business day with a tailored quote.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={css(
                "display:grid;gap:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:clamp(22px,3vw,34px);backdrop-filter:blur(10px);box-shadow:0 30px 70px rgba(0,0,0,.4)"
              )}
            >
              <label
                htmlFor="lead-name"
                style={css(
                  "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a5a5c4"
                )}
              >
                Full name
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                required
                placeholder="Jane Cohen"
                style={css(FIELD_STYLE)}
              />
              <label htmlFor="lead-phone" style={css(LABEL_STYLE)}>
                Phone number
              </label>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                required
                placeholder="+1 555 0100"
                style={css(FIELD_STYLE)}
              />
              <label htmlFor="lead-email" style={css(LABEL_STYLE)}>
                Email
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                required
                placeholder="you@email.com"
                style={css(FIELD_STYLE)}
              />
              <label htmlFor="lead-service" style={css(LABEL_STYLE)}>
                Product
              </label>
              <select
                id="lead-service"
                name="service"
                required
                defaultValue={defaultService}
                style={css(`${FIELD_STYLE};appearance:none;cursor:pointer`)}
              >
                <option value="" disabled>
                  Which product?
                </option>
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label htmlFor="lead-message" style={css(LABEL_STYLE)}>
                Message
              </label>
              <textarea
                id="lead-message"
                name="message"
                rows={4}
                placeholder="Sizes, wall measurements, deadline — anything helps."
                style={css(`${FIELD_STYLE};resize:vertical`)}
              ></textarea>
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                style={css(
                  `margin-top:10px;padding:16px 30px;border:0;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#ffffff;font-family:inherit;font-size:16px;font-weight:600;cursor:${submitting ? "not-allowed" : "pointer"};opacity:${submitting ? "0.7" : "1"};box-shadow:0 14px 34px rgba(236,72,153,.34)`
                )}
              >
                {submitting ? "Sending…" : "Submit"}
              </button>
              {error && (
                <p
                  style={css(
                    "margin:2px 0 0;font-size:13.5px;text-align:center;color:#fca5a5"
                  )}
                >
                  {error}
                </p>
              )}
              <p
                style={css(
                  "margin:4px 0 0;font-size:12.5px;line-height:1.6;color:#9a9ab8"
                )}
              >
                Prefer to just start?{" "}
                <a href={uploadHref} style={css("color:#f472b6;font-weight:600")}>
                  Upload your photo instead →
                </a>
              </p>
            </form>
          ))}
      </div>
    </section>
  );
}
