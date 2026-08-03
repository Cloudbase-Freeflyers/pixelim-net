import { css } from "@/app/lib/css";

/**
 * Shared "Contact Us" section. The background image, its alt text, the intro
 * paragraph and the "upload instead" link differ between the home page and the
 * product pages, so they are passed in as props.
 */
export default function ContactSection({
  bgImg,
  bgAlt,
  para,
  uploadHref,
}: {
  bgImg: string;
  bgAlt: string;
  para: string;
  uploadHref: string;
}) {
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
          "position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px;align-items:start"
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
            <a
              href="mailto:info@pixelim.net"
              style={css(
                "display:flex;align-items:center;gap:14px;font-size:17px;font-weight:500;color:#ffffff"
              )}
            >
              <span
                style={css(
                  "flex:0 0 auto;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:16px"
                )}
              >
                ✉
              </span>
              info@pixelim.net
            </a>
            <a
              href="tel:+972502225505"
              style={css(
                "display:flex;align-items:center;gap:14px;font-size:17px;font-weight:500;color:#ffffff"
              )}
            >
              <span
                style={css(
                  "flex:0 0 auto;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:16px"
                )}
              >
                ✆
              </span>
              +972 50 2225505
            </a>
          </div>
          <p
            style={css(
              "margin:22px 0 0;font-size:14px;line-height:1.7;color:#9a9ab8"
            )}
          >
            We reply within one business day. Sun–Thu, 9:00–18:00 IST.
          </p>
        </div>
        <form
          action="mailto:info@pixelim.net"
          method="post"
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
            placeholder="Jane Cohen"
            style={css(
              "width:100%;box-sizing:border-box;padding:15px 18px;border-radius:12px;border:1px solid #e2e2ee;background:#ffffff;color:#12121f;font-family:inherit;font-size:15.5px"
            )}
          />
          <label
            htmlFor="lead-phone"
            style={css(
              "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a5a5c4;margin-top:6px"
            )}
          >
            Phone number
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            placeholder="+1 555 0100"
            style={css(
              "width:100%;box-sizing:border-box;padding:15px 18px;border-radius:12px;border:1px solid #e2e2ee;background:#ffffff;color:#12121f;font-family:inherit;font-size:15.5px"
            )}
          />
          <label
            htmlFor="lead-email"
            style={css(
              "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a5a5c4;margin-top:6px"
            )}
          >
            Email
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            placeholder="you@email.com"
            style={css(
              "width:100%;box-sizing:border-box;padding:15px 18px;border-radius:12px;border:1px solid #e2e2ee;background:#ffffff;color:#12121f;font-family:inherit;font-size:15.5px"
            )}
          />
          <label
            htmlFor="lead-message"
            style={css(
              "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a5a5c4;margin-top:6px"
            )}
          >
            Message
          </label>
          <textarea
            id="lead-message"
            name="message"
            rows={4}
            placeholder="Sizes, wall measurements, deadline — anything helps."
            style={css(
              "width:100%;box-sizing:border-box;padding:15px 18px;border-radius:12px;border:1px solid #e2e2ee;background:#ffffff;color:#12121f;font-family:inherit;font-size:15.5px;resize:vertical"
            )}
          ></textarea>
          <button
            type="submit"
            style={css(
              "margin-top:10px;padding:16px 30px;border:0;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#ffffff;font-family:inherit;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 14px 34px rgba(236,72,153,.34)"
            )}
          >
            Submit
          </button>
          <p
            style={css(
              "margin:4px 0 0;font-size:12.5px;line-height:1.6;color:#9a9ab8"
            )}
          >
            Prefer to just start?{" "}
            <a
              href={uploadHref}
              style={css("color:#f472b6;font-weight:600")}
            >
              Upload your photo instead →
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
