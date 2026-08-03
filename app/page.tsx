import { css } from "@/app/lib/css";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import ContactSection from "@/app/components/ContactSection";
import StickyCta from "@/app/components/StickyCta";
import ScrollReveal from "@/app/components/ScrollReveal";

const ACRYLIC_ORDER = "/acrylic-photo-prints#order-app";

const TRUST = [
  { glyph: "◈", title: "Safe purchase", body: "Encrypted checkout, no card details stored." },
  { glyph: "◇", title: "Fast delivery", body: "Printed in 24–72h, insured worldwide shipping." },
  { glyph: "◆", title: "100% guarantee", body: "Damaged or faulty? We reprint it, no argument." },
  { glyph: "○", title: "Quality product", body: "Our own factory, our own presses, our own name on it." },
];

const PRODUCTS = [
  {
    title: "Acrylic Glass Prints",
    body: "Glass-like depth and dazzling colour. The gallery look.",
    price: "From $39",
    shot: "Panoramic acrylic print in a hallway",
    src: "/images/gallery-hallway.png",
    href: "/acrylic-photo-prints",
  },
  {
    title: "Canvas Prints",
    body: "Matte canvas on a solid stretcher frame. Warm and classic.",
    price: "From $29",
    shot: "Canvas print above a sofa",
    src: "/images/product-canvas.png",
    href: "/canvas-prints",
  },
  {
    title: "Aluminum Prints",
    body: "Slim 3mm metal, weatherproof. Great indoors and out.",
    price: "From $45",
    shot: "Aluminium prints in an office reception",
    src: "/images/product-aluminum.png",
    href: "/aluminium-prints",
  },
];

const POSTS = [
  {
    title: "Printing on acrylic glass",
    body: "Direct printing onto transparent acrylic — how it gets that three-dimensional glow.",
    shot: "Close-up of an acrylic print edge",
    src: "/images/standoff-closeup.png",
  },
  {
    title: "Printing on aluminum",
    body: "Alucobond is durable, light and happy outdoors. Two finishes to choose from.",
    shot: "Aluminium prints in a reception",
    src: "/images/product-aluminum.png",
  },
  {
    title: "Large-format work",
    body: "Six feet wide, still razor sharp. How we handle statement walls.",
    shot: "Large acrylic print in a stairwell",
    src: "/images/gallery-stairwell.png",
  },
];

const HOME_CONTACT_PARA =
  "Big wall, unusual size, or a photo you are not sure about? Tell us what you have in mind and we will come back with a plan and a price.";

export default function Home() {
  return (
    <div
      className="page-anim"
      style={css(
        "font-family:var(--font-poppins),Helvetica,Arial,sans-serif;background:#0d0d1a;color:#ffffff;overflow-x:hidden"
      )}
    >
      <ScrollReveal />
      <SiteHeader active="home" createHref={ACRYLIC_ORDER} />

      {/* Hero */}
      <section
        style={css(
          "position:relative;padding:140px 20px 104px;background:radial-gradient(110% 90% at 20% 0%,#4c1d95 0%,rgba(76,29,149,0) 58%),radial-gradient(90% 80% at 90% 30%,#831843 0%,rgba(131,24,67,0) 62%),#0d0d1a"
        )}
      >
        <div
          style={css(
            "max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:56px;align-items:center"
          )}
        >
          <div>
            <span
              style={css(
                "display:inline-block;padding:7px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#f0abfc"
              )}
            >
              30+ years of printing
            </span>
            <h1
              style={css(
                "margin:22px 0 0;font-size:clamp(34px,5vw,60px);line-height:1.05;font-weight:600;letter-spacing:-.025em;text-wrap:balance"
              )}
            >
              Bring your vision to life with premium printing
            </h1>
            <p
              style={css(
                "margin:20px 0 0;font-size:clamp(16px,1.6vw,19px);line-height:1.6;color:#c4c4dc;max-width:520px;text-wrap:pretty"
              )}
            >
              Acrylic glass, canvas and aluminum prints made in our own factory.
              Crafted to perfection. Made to last.
            </p>
            <div
              style={css(
                "display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-top:34px"
              )}
            >
              <a
                href={ACRYLIC_ORDER}
                style={css(
                  "padding:17px 34px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:16px;font-weight:600;box-shadow:0 16px 40px rgba(236,72,153,.35)"
                )}
              >
                Upload Your Photo →
              </a>
              <a
                href="#products"
                style={css(
                  "padding:16px 30px;border-radius:999px;border:1px solid rgba(255,255,255,.22);color:#fff;font-size:15.5px;font-weight:500"
                )}
              >
                Browse products
              </a>
            </div>
          </div>
          <div style={css("position:relative")}>
            <div
              style={css(
                "position:absolute;inset:-8%;background:radial-gradient(60% 60% at 50% 50%,rgba(236,72,153,.4),rgba(123,47,247,0) 70%);filter:blur(44px)"
              )}
            ></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-living-room.png"
              alt="Acrylic glass photo print above a linen sofa in a warm modern living room"
              style={css(
                "position:relative;display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:22px;border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 90px rgba(0,0,0,.55)"
              )}
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={css("padding:64px 20px;background:#f7f7fb;color:#12121f")}>
        <div style={css("max-width:1240px;margin:0 auto")}>
          <h2
            style={css(
              "margin:0;text-align:center;font-size:clamp(22px,2.6vw,30px);font-weight:600;letter-spacing:-.02em;text-wrap:balance"
            )}
          >
            Perfect printing, fast delivery &amp; peace of mind with every order
          </h2>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;margin-top:38px"
            )}
          >
            {TRUST.map((t) => (
              <div
                key={t.title}
                style={css(
                  "background:#fff;border:1px solid #ececf4;border-radius:18px;padding:24px;text-align:center"
                )}
              >
                <span
                  style={css(
                    "display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,rgba(123,47,247,.12),rgba(236,72,153,.16));font-size:19px"
                  )}
                >
                  {t.glyph}
                </span>
                <h3
                  style={css("margin:16px 0 6px;font-size:16.5px;font-weight:600")}
                >
                  {t.title}
                </h3>
                <p
                  style={css(
                    "margin:0;font-size:13.5px;line-height:1.6;color:#5a5a72"
                  )}
                >
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        style={css("padding:88px 20px;background:#ffffff;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div style={css("text-align:center;max-width:640px;margin:0 auto")}>
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
              )}
            >
              Our products
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              Upgrade your space
            </h2>
            <p
              style={css(
                "margin:14px 0 0;font-size:17px;line-height:1.6;color:#55556e;text-wrap:pretty"
              )}
            >
              Three ways to put your photo on the wall. Pick the one that fits
              your room.
            </p>
          </div>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:44px"
            )}
          >
            {PRODUCTS.map((p) => (
              <a
                key={p.title}
                href={p.href}
                className="card-product"
                style={css(
                  "display:block;border:1px solid #ececf4;border-radius:22px;overflow:hidden;background:#fdfdff;color:#12121f;box-shadow:0 14px 38px rgba(18,18,31,.06)"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.shot}
                  style={css(
                    "display:block;width:100%;aspect-ratio:4/3;object-fit:cover"
                  )}
                />
                <div style={css("padding:26px")}>
                  <h3 style={css("margin:0;font-size:20px;font-weight:600")}>
                    {p.title}
                  </h3>
                  <p
                    style={css(
                      "margin:10px 0 16px;font-size:14.5px;line-height:1.6;color:#5a5a72"
                    )}
                  >
                    {p.body}
                  </p>
                  <span
                    style={css(
                      "display:flex;align-items:center;justify-content:space-between;gap:12px"
                    )}
                  >
                    <span style={css("font-size:14px;color:#8a8aa2")}>
                      {p.price}
                    </span>
                    <span
                      style={css(
                        "font-size:14.5px;font-weight:600;color:#ec4899"
                      )}
                    >
                      Explore →
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section style={css("padding:88px 20px;background:#0d0d1a")}>
        <div
          style={css(
            "max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:52px;align-items:center"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/press-floor.png"
            alt="Large-format printer producing a photo on acrylic glass"
            style={css(
              "display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:22px;border:1px solid rgba(255,255,255,.12)"
            )}
          />
          <div>
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
              )}
            >
              About Pixelim
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              Three decades. One standard.
            </h2>
            <p
              style={css(
                "margin:18px 0 0;font-size:16.5px;line-height:1.7;color:#c4c4dc;max-width:520px;text-wrap:pretty"
              )}
            >
              For over thirty years we&apos;ve set the bar for printing in
              Israel. An experienced team, the most advanced digital presses
              available, and no shortcuts on the part that matters — how your
              photo looks on the wall.
            </p>
            <div
              style={css(
                "display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:18px;margin-top:30px"
              )}
            >
              {[
                { big: "30+", small: "years printing" },
                { big: "24–72h", small: "production time" },
                { big: "100%", small: "quality guarantee" },
              ].map((stat) => (
                <div key={stat.small}>
                  <span
                    style={css(
                      "display:block;font-size:30px;font-weight:600;background:linear-gradient(90deg,#a855f7,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent"
                    )}
                  >
                    {stat.big}
                  </span>
                  <span style={css("font-size:13.5px;color:#a5a5c4")}>
                    {stat.small}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* From the print floor */}
      <section style={css("padding:88px 20px;background:#f7f7fb;color:#12121f")}>
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div
            style={css(
              "display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px"
            )}
          >
            <div>
              <p
                style={css(
                  "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
                )}
              >
                Latest updates
              </p>
              <h2
                style={css(
                  "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
                )}
              >
                From the print floor
              </h2>
            </div>
            <a
              href="#"
              style={css("font-size:15px;font-weight:600;color:#a855f7")}
            >
              More updates →
            </a>
          </div>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:36px"
            )}
          >
            {POSTS.map((p) => (
              <a
                key={p.title}
                href="#"
                className="card-post"
                style={css(
                  "display:block;background:#fff;border:1px solid #ececf4;border-radius:20px;overflow:hidden;color:#12121f"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.shot}
                  style={css(
                    "display:block;width:100%;aspect-ratio:16/10;object-fit:cover"
                  )}
                />
                <div style={css("padding:22px")}>
                  <h3
                    style={css(
                      "margin:0 0 8px;font-size:17.5px;font-weight:600"
                    )}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={css(
                      "margin:0;font-size:14px;line-height:1.6;color:#5a5a72"
                    )}
                  >
                    {p.body}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ContactSection
        bgImg="/images/gallery-stairwell.png"
        bgAlt="Large print in a warm modern stairwell"
        para={HOME_CONTACT_PARA}
        uploadHref={ACRYLIC_ORDER}
      />

      {/* Final CTA */}
      <section
        style={css(
          "padding:96px 20px;background:radial-gradient(100% 120% at 50% 0%,#4c1d95 0%,rgba(76,29,149,0) 60%),#0d0d1a;text-align:center"
        )}
      >
        <div style={css("max-width:760px;margin:0 auto")}>
          <h2
            style={css(
              "margin:0;font-size:clamp(30px,4vw,48px);font-weight:600;letter-spacing:-.025em;text-wrap:balance"
            )}
          >
            Ready to see your photo on the wall?
          </h2>
          <p
            style={css(
              "margin:18px 0 32px;font-size:17px;line-height:1.6;color:#c4c4dc"
            )}
          >
            Upload it now — live pricing, free file check, worldwide shipping.
          </p>
          <a
            href={ACRYLIC_ORDER}
            style={css(
              "display:inline-block;padding:18px 40px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:17px;font-weight:600;box-shadow:0 18px 46px rgba(236,72,153,.4)"
            )}
          >
            Start Your Print →
          </a>
        </div>
      </section>

      <SiteFooter />
      <StickyCta href={ACRYLIC_ORDER} />
    </div>
  );
}
