import { css } from "@/app/lib/css";

const PAYMENTS = ["PayPal", "Visa", "Mastercard", "Amex", "Apple Pay"];
const DELIVERY = ["UPS", "FedEx", "TNT"];
const SHOPPING = ["SSL encrypted", "Max protection"];

function Chip({ label }: { label: string }) {
  return (
    <span
      style={css(
        "padding:7px 12px;border-radius:8px;background:rgba(255,255,255,.06);font-size:11.5px;color:#d4d4e6"
      )}
    >
      {label}
    </span>
  );
}

/** Site-wide footer. Identical on every page. */
export default function SiteFooter() {
  return (
    <footer
      style={css(
        "background:#08080f;padding:64px 20px 0;border-top:1px solid rgba(255,255,255,.07)"
      )}
    >
      <div style={css("max-width:1240px;margin:0 auto")}>
        <div
          style={css(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px"
          )}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-light-v2.svg"
              alt="Pixelim — Digital Design Factory"
              style={css("display:block;height:40px;width:auto")}
            />
            <p
              style={css(
                "margin:16px 0 0;font-size:14px;line-height:1.7;color:#9a9ab8;max-width:260px"
              )}
            >
              Over three decades of digital printing in Israel. Shipping
              worldwide.
            </p>
            <div style={css("display:flex;gap:10px;margin-top:18px")}>
              {["in", "f", "yt"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={css(
                    "width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:12px;color:#c9c9de"
                  )}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4
              style={css(
                "margin:0 0 16px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
              )}
            >
              Products
            </h4>
            <div style={css("display:grid;gap:10px;font-size:14.5px")}>
              <a href="/acrylic-photo-prints" style={css("color:#c9c9de")}>
                Acrylic Photo Prints
              </a>
              <a href="/canvas-prints" style={css("color:#c9c9de")}>
                Canvas Prints
              </a>
              <a href="/aluminium-prints" style={css("color:#c9c9de")}>
                Aluminum Prints
              </a>
              <a href="#products" style={css("color:#c9c9de")}>
                Products Catalog
              </a>
            </div>
          </div>
          <div>
            <h4
              style={css(
                "margin:0 0 16px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
              )}
            >
              Quick links
            </h4>
            <div style={css("display:grid;gap:10px;font-size:14.5px")}>
              <a href="/" style={css("color:#c9c9de")}>
                Home
              </a>
              <a href="#" style={css("color:#c9c9de")}>
                About
              </a>
              <a href="#" style={css("color:#c9c9de")}>
                Blog
              </a>
              <a href="#contact" style={css("color:#c9c9de")}>
                Contact us
              </a>
            </div>
          </div>
          <div>
            <h4
              style={css(
                "margin:0 0 16px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
              )}
            >
              Contact
            </h4>
            <div style={css("display:grid;gap:10px;font-size:14.5px")}>
              <a href="mailto:info@pixelim.net" style={css("color:#c9c9de")}>
                info@pixelim.net
              </a>
              <a href="tel:+972502225505" style={css("color:#c9c9de")}>
                +972 50 2225505
              </a>
            </div>
          </div>
        </div>
        <div
          style={css(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;margin-top:48px;padding-top:32px;border-top:1px solid rgba(255,255,255,.07)"
          )}
        >
          <div>
            <h5
              style={css(
                "margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#8a8aa8"
              )}
            >
              Secure payment
            </h5>
            <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
              {PAYMENTS.map((p) => (
                <Chip key={p} label={p} />
              ))}
            </div>
          </div>
          <div>
            <h5
              style={css(
                "margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#8a8aa8"
              )}
            >
              Dependable delivery
            </h5>
            <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
              {DELIVERY.map((d) => (
                <Chip key={d} label={d} />
              ))}
            </div>
          </div>
          <div>
            <h5
              style={css(
                "margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#8a8aa8"
              )}
            >
              Secure shopping
            </h5>
            <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
              {SHOPPING.map((s) => (
                <Chip key={s} label={s} />
              ))}
            </div>
          </div>
        </div>
        <div
          style={css(
            "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-top:36px;padding:22px 0 100px;border-top:1px solid rgba(255,255,255,.07);font-size:13px;color:#8a8aa8"
          )}
        >
          <div style={css("display:flex;gap:18px")}>
            <a href="#" style={css("color:#8a8aa8")}>
              Terms and Conditions
            </a>
            <a href="#" style={css("color:#8a8aa8")}>
              Privacy Policy
            </a>
          </div>
          <span>© Pixelim 2026 · Prices do not include tax and shipping</span>
        </div>
      </div>
    </footer>
  );
}
