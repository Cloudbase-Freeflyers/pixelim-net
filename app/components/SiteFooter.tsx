import { css } from "@/app/lib/css";

const BADGES = [
  {
    title: "Secure shopping",
    img: "/secure-shopping-icons.png",
    alt: "Encrypted, SSL-secured shopping",
    height: 40,
  },
  {
    title: "Secure shipping",
    img: "/secure-shipping-icon.png",
    alt: "Maximum protection shipping",
    height: 40,
  },
  {
    title: "Dependable delivery",
    img: "/shipping-companies-icons.gif",
    alt: "Delivery with UPS, TNT and FedEx",
    height: 36,
  },
  {
    title: "Secure payment",
    img: "/payments-icons.gif",
    alt: "Apple Pay, Mastercard, Visa, PayPal and American Express",
    height: 74,
  },
];

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
              Over three decades of digital printing in Israel.
            </p>
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
              <a href="/#products" style={css("color:#c9c9de")}>
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
              <a href="/#about" style={css("color:#c9c9de")}>
                About
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
            "margin-top:48px;padding:clamp(24px,3vw,30px) clamp(20px,3vw,36px);background:#ffffff;border-radius:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px 24px;align-items:start"
          )}
        >
          {BADGES.map((b) => (
            <div key={b.title}>
              <h5
                style={css(
                  "margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280"
                )}
              >
                {b.title}
              </h5>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.img}
                alt={b.alt}
                style={css(`display:block;height:${b.height}px;width:auto`)}
              />
            </div>
          ))}
        </div>
        <div
          style={css(
            "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-top:36px;padding:22px 0 100px;border-top:1px solid rgba(255,255,255,.07);font-size:13px;color:#8a8aa8"
          )}
        >
          <span>© Pixelim 2026 · Prices do not include tax and shipping</span>
        </div>
      </div>
    </footer>
  );
}
