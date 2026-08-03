"use client";

import { useState } from "react";
import { css } from "@/app/lib/css";
import type { Product } from "@/app/lib/products";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import ContactSection from "@/app/components/ContactSection";
import StickyCta from "@/app/components/StickyCta";
import ScrollReveal from "@/app/components/ScrollReveal";

const ACCENT_A = "#7b2ff7";
const ACCENT_B = "#ec4899";
const APP_MIN_HEIGHT = "min(700px, max(550px, 62vh))";

const PRODUCT_CONTACT_PARA =
  "Custom size, tricky wall, or a photo you are unsure about? Send us the details and we will come back with a plan and a price.";

export default function ProductPage({ product }: { product: Product }) {
  const [option, setOption] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div
      className="page-anim"
      style={css(
        "font-family:var(--font-poppins),Helvetica,Arial,sans-serif;background:#0d0d1a;color:#ffffff;overflow-x:hidden"
      )}
    >
      <ScrollReveal />
      <SiteHeader active={product.active} createHref="#order-app" />

      {/* Hero */}
      <section
        style={css(
          "position:relative;padding:132px 20px 96px;background:radial-gradient(120% 90% at 80% 0%,#4c1d95 0%,rgba(76,29,149,0) 55%),radial-gradient(90% 70% at 10% 20%,#831843 0%,rgba(131,24,67,0) 60%),#0d0d1a"
        )}
      >
        <div
          style={css(
            "max-width:1240px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:56px;align-items:center"
          )}
        >
          <div style={css("position:relative")}>
            <div
              style={css(
                "position:absolute;inset:-8%;background:radial-gradient(60% 60% at 50% 50%,rgba(236,72,153,.45),rgba(123,47,247,0) 70%);filter:blur(40px)"
              )}
            ></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.hero.img}
              alt={product.hero.alt}
              style={css(
                "position:relative;display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:22px;border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 90px rgba(0,0,0,.55)"
              )}
            />
          </div>
          <div>
            <span
              style={css(
                "display:inline-block;padding:7px 16px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase"
              )}
            >
              {product.hero.badge}
            </span>
            <h1
              style={css(
                "margin:20px 0 0;font-size:clamp(34px,5.2vw,58px);line-height:1.06;font-weight:600;letter-spacing:-.025em;text-wrap:balance"
              )}
            >
              {product.hero.titleLines[0]}
              <br />
              {product.hero.titleLines[1]}
            </h1>
            <p
              style={css(
                "margin:20px 0 0;font-size:clamp(16px,1.6vw,19px);line-height:1.6;color:#c4c4dc;max-width:520px;text-wrap:pretty"
              )}
            >
              {product.hero.para}
            </p>
            <div
              style={css(
                "display:flex;flex-wrap:wrap;gap:10px;margin-top:28px"
              )}
            >
              {product.hero.tags.map((tag) => (
                <span
                  key={tag}
                  style={css(
                    "padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.05);font-size:13px;color:#e6e6f2"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              style={css(
                "display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-top:34px"
              )}
            >
              <a
                href="#order-app"
                className="btn-lift"
                style={css(
                  "padding:17px 34px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:16px;font-weight:600;box-shadow:0 16px 40px rgba(236,72,153,.35)"
                )}
              >
                Create Yours Now →
              </a>
              <span style={css("font-size:13.5px;color:#a5a5c4")}>
                {product.hero.priceLine}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section
        style={css("padding:88px 20px;background:#f7f7fb;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <p
            style={css(
              "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
            )}
          >
            {product.why.kicker}
          </p>
          <h2
            style={css(
              "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
            )}
          >
            {product.why.heading}
          </h2>
          <p
            style={css(
              "margin:14px 0 0;font-size:17px;line-height:1.6;color:#55556e;max-width:620px;text-wrap:pretty"
            )}
          >
            {product.why.para}
          </p>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:44px"
            )}
          >
            {product.benefits.map((b) => (
              <div
                key={b.title}
                className="card-benefit"
                style={css(
                  "background:#fff;border:1px solid #ececf4;border-radius:20px;padding:28px;box-shadow:0 12px 34px rgba(18,18,31,.05)"
                )}
              >
                <span
                  style={css(
                    "display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,rgba(123,47,247,.12),rgba(236,72,153,.16));font-size:19px"
                  )}
                >
                  {b.glyph}
                </span>
                <h3
                  style={css(
                    "margin:20px 0 8px;font-size:18px;font-weight:600"
                  )}
                >
                  {b.title}
                </h3>
                <p
                  style={css(
                    "margin:0;font-size:14.5px;line-height:1.6;color:#5a5a72"
                  )}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options */}
      <section
        style={css("padding:88px 20px;background:#ffffff;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:44px;align-items:center"
            )}
          >
            <div>
              <p
                style={css(
                  "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
                )}
              >
                Options
              </p>
              <h2
                style={css(
                  "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
                )}
              >
                {product.options.heading}
              </h2>
              <p
                style={css(
                  "margin:14px 0 0;font-size:17px;line-height:1.6;color:#55556e;max-width:460px;text-wrap:pretty"
                )}
              >
                {product.options.para}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.options.edgeImg}
                alt={product.options.edgeAlt}
                style={css(
                  "display:block;width:100%;margin-top:26px;aspect-ratio:16/9;object-fit:cover;border-radius:18px;box-shadow:0 16px 40px rgba(18,18,31,.1)"
                )}
              />
            </div>
            <div style={css("display:grid;gap:16px")}>
              {product.options.items.map((o, i) => {
                const selected = option === i;
                const border = selected
                  ? `2px solid ${ACCENT_B}`
                  : "1px solid #e6e6f0";
                const bg = selected
                  ? "linear-gradient(135deg,rgba(123,47,247,.06),rgba(236,72,153,.08))"
                  : "#fdfdff";
                const dotBorder = selected
                  ? `6px solid ${ACCENT_B}`
                  : "2px solid #d6d6e4";
                const dotBg = selected ? "#fff" : "transparent";
                return (
                  <div
                    key={o.title}
                    onClick={() => setOption(i)}
                    style={css(
                      `cursor:pointer;position:relative;border:${border};border-radius:20px;padding:26px;background:${bg};transition:border-color .2s ease,box-shadow .2s ease`
                    )}
                  >
                    <div
                      style={css(
                        "display:flex;align-items:center;justify-content:space-between;gap:16px"
                      )}
                    >
                      <h3
                        style={css("margin:0;font-size:19px;font-weight:600")}
                      >
                        {o.title}
                      </h3>
                      <span
                        style={css(
                          `width:22px;height:22px;border-radius:50%;border:${dotBorder};background:${dotBg};flex:0 0 auto`
                        )}
                      ></span>
                    </div>
                    <p
                      style={css(
                        "margin:10px 0 0;font-size:14.5px;line-height:1.6;color:#5a5a72"
                      )}
                    >
                      {o.body}
                    </p>
                    <div
                      style={css(
                        "display:flex;flex-wrap:wrap;gap:8px;margin-top:16px"
                      )}
                    >
                      {o.tags.map((t) => (
                        <span
                          key={t}
                          style={css(
                            "padding:6px 12px;border-radius:999px;background:#f4f4fa;font-size:12.5px;color:#4a4a63"
                          )}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <a
                href="#order-app"
                style={css(
                  "padding:16px 30px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:15.5px;font-weight:600;text-align:center;box-shadow:0 14px 34px rgba(236,72,153,.28)"
                )}
              >
                Order Yours Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Order app */}
      <section
        id="order-app"
        style={css(
          "padding:80px 20px 90px;background:linear-gradient(180deg,#0d0d1a 0%,#15102b 100%)"
        )}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div
            style={css(
              "text-align:center;max-width:640px;margin:0 auto 36px"
            )}
          >
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#f472b6"
              )}
            >
              Start here
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,42px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              Choose size, material &amp; finish
            </h2>
            <p
              style={css(
                "margin:14px 0 0;font-size:17px;line-height:1.6;color:#c4c4dc;text-wrap:pretty"
              )}
            >
              Upload your photo and see the live price. Takes about two minutes.
            </p>
          </div>
          <div
            style={css(
              "background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1)"
            )}
          >
            <div
              style={css(
                "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid #ececf4;background:#fafafd"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dark-v2.svg"
                alt="Pixelim"
                style={css("display:block;height:26px;width:auto")}
              />
              <span
                style={css(
                  "font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#9a9ab0"
                )}
              >
                iframe · id=&quot;order-app&quot;
              </span>
            </div>
            <div
              style={css(
                `min-height:${APP_MIN_HEIGHT};background:#fff;display:flex;align-items:center;justify-content:center;padding:clamp(20px,4vw,56px)`
              )}
            >
              <div style={css("width:100%;max-width:820px")}>
                <div
                  style={css(
                    "border:2px dashed #d6d6e4;border-radius:18px;padding:clamp(30px,6vw,64px) 20px;text-align:center"
                  )}
                >
                  <h3
                    style={css(
                      "margin:0;font-size:clamp(20px,3vw,28px);font-weight:500;background:linear-gradient(90deg,#7b2ff7,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent"
                    )}
                  >
                    Drag &amp; Drop Your Files Here
                  </h3>
                  <p
                    style={css(
                      "margin:16px 0;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:#a3a3b8"
                    )}
                  >
                    or
                  </p>
                  <span
                    style={css(
                      "display:inline-block;padding:15px 34px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:16px;font-weight:600;box-shadow:0 14px 34px rgba(236,72,153,.3)"
                    )}
                  >
                    Upload Files
                  </span>
                </div>
                <p
                  style={css(
                    "margin:22px 0 0;text-align:center;font-size:13.5px;line-height:1.8;color:#8a8aa2"
                  )}
                >
                  Allowed file types: JPG, PNG
                  <br />
                  Max size: 20MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to order */}
      <section
        style={css("padding:88px 20px;background:#ffffff;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div style={css("text-align:center;max-width:600px;margin:0 auto")}>
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
              )}
            >
              Four steps
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              How to order
            </h2>
          </div>
          <div
            style={css(
              "position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px;margin-top:48px"
            )}
          >
            <div
              style={css(
                "position:absolute;top:26px;left:8%;right:8%;height:2px;background:linear-gradient(90deg,rgba(123,47,247,.25),rgba(236,72,153,.55));z-index:0"
              )}
            ></div>
            {product.steps.map((s) => (
              <div
                key={s.n}
                style={css("position:relative;z-index:1;text-align:center")}
              >
                <span
                  style={css(
                    "display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:19px;font-weight:600;box-shadow:0 0 0 8px #ffffff"
                  )}
                >
                  {s.n}
                </span>
                <h3
                  style={css(
                    "margin:18px 0 8px;font-size:17.5px;font-weight:600"
                  )}
                >
                  {s.title}
                </h3>
                <p
                  style={css(
                    "margin:0;font-size:14.5px;line-height:1.6;color:#5a5a72"
                  )}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div style={css("text-align:center;margin-top:44px")}>
            <a
              href="#order-app"
              style={css(
                "display:inline-block;padding:16px 32px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:15.5px;font-weight:600;box-shadow:0 14px 34px rgba(236,72,153,.28)"
              )}
            >
              Upload your photo
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        style={css("padding:88px 20px;background:#f7f7fb;color:#12121f")}
      >
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
                Gallery
              </p>
              <h2
                style={css(
                  "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
                )}
              >
                Finished prints, real rooms
              </h2>
            </div>
            <a
              href="#order-app"
              style={css("font-size:15px;font-weight:600;color:#a855f7")}
            >
              See yours here →
            </a>
          </div>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:36px"
            )}
          >
            {product.gallery.map((g) => (
              <div
                key={g.label}
                title={g.label}
                className="tile-gallery"
                style={css(
                  `width:100%;aspect-ratio:3/2;border-radius:18px;background-color:#e7e7f1;background-image:url(${g.img});background-size:cover;background-position:center;box-shadow:0 14px 36px rgba(18,18,31,.08)`
                )}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section
        style={css("padding:88px 20px;background:#ffffff;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <div style={css("text-align:center;max-width:600px;margin:0 auto")}>
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
              )}
            >
              Reviews
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              What our customers say
            </h2>
          </div>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:44px"
            )}
          >
            {product.reviews.map((r) => (
              <div
                key={r.name}
                style={css(
                  "border:1px solid #ececf4;border-radius:20px;padding:28px;background:#fdfdff;box-shadow:0 12px 34px rgba(18,18,31,.05)"
                )}
              >
                <span
                  style={css(
                    "color:#f59e0b;font-size:15px;letter-spacing:.14em"
                  )}
                >
                  ★★★★★
                </span>
                <p
                  style={css(
                    "margin:16px 0 20px;font-size:15.5px;line-height:1.7;color:#3d3d52;text-wrap:pretty"
                  )}
                >
                  {r.quote}
                </p>
                <div
                  style={css("display:flex;align-items:center;gap:12px")}
                >
                  <span
                    style={css(
                      "width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ec4899);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff"
                    )}
                  >
                    {r.initial}
                  </span>
                  <span
                    style={css(
                      "display:flex;flex-direction:column;line-height:1.35"
                    )}
                  >
                    <span
                      style={css("font-size:14.5px;font-weight:600")}
                    >
                      {r.name}
                    </span>
                    <span
                      style={css("font-size:12.5px;color:#8a8aa2")}
                    >
                      {r.meta}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={css("padding:88px 20px;background:#f7f7fb;color:#12121f")}
      >
        <div style={css("max-width:860px;margin:0 auto")}>
          <div style={css("text-align:center")}>
            <p
              style={css(
                "margin:0;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#a855f7"
              )}
            >
              FAQ
            </p>
            <h2
              style={css(
                "margin:12px 0 0;font-size:clamp(28px,3.4vw,40px);font-weight:600;letter-spacing:-.02em"
              )}
            >
              Good questions, quick answers
            </h2>
          </div>
          <div style={css("display:grid;gap:12px;margin-top:40px")}>
            {product.faqs.map((f, i) => {
              const open = openFaq === i;
              const icon = open ? "−" : "+";
              const iconBg = open
                ? `linear-gradient(135deg,${ACCENT_A},${ACCENT_B})`
                : "#f2f2f8";
              const iconColor = open ? "#fff" : "#7b2ff7";
              const display = open ? "block" : "none";
              return (
                <div
                  key={f.q}
                  style={css(
                    "background:#fff;border:1px solid #ececf4;border-radius:16px;overflow:hidden"
                  )}
                >
                  <div
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    style={css(
                      "cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px"
                    )}
                  >
                    <span
                      style={css("font-size:16.5px;font-weight:600")}
                    >
                      {f.q}
                    </span>
                    <span
                      style={css(
                        `flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:${iconBg};color:${iconColor};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600`
                      )}
                    >
                      {icon}
                    </span>
                  </div>
                  <div
                    style={css(
                      `display:${display};padding:0 24px 22px;font-size:15px;line-height:1.7;color:#5a5a72`
                    )}
                  >
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help */}
      <section
        id="help"
        style={css("padding:88px 20px;background:#ffffff;color:#12121f")}
      >
        <div style={css("max-width:1240px;margin:0 auto")}>
          <h2
            style={css(
              "margin:0;text-align:center;font-size:clamp(26px,3.2vw,36px);font-weight:600;letter-spacing:-.02em"
            )}
          >
            We&apos;re here to help
          </h2>
          <div
            style={css(
              "display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:36px"
            )}
          >
            <div
              style={css(
                "border:1px solid #ececf4;border-radius:20px;padding:28px;background:#fdfdff"
              )}
            >
              <h3
                style={css(
                  "margin:0 0 8px;font-size:18px;font-weight:600;color:#a855f7"
                )}
              >
                Free design consult
              </h3>
              <p
                style={css(
                  "margin:0 0 16px;font-size:14.5px;line-height:1.6;color:#5a5a72"
                )}
              >
                Not sure your photo is big enough? Send it over — we&apos;ll
                check it free.
              </p>
              <a
                href="mailto:info@pixelim.net"
                style={css(
                  "font-size:14.5px;font-weight:600;color:#ec4899"
                )}
              >
                info@pixelim.net →
              </a>
            </div>
            <div
              style={css(
                "border:1px solid #ececf4;border-radius:20px;padding:28px;background:#fdfdff"
              )}
            >
              <h3
                style={css(
                  "margin:0 0 8px;font-size:18px;font-weight:600;color:#a855f7"
                )}
              >
                Order tracking
              </h3>
              <p
                style={css(
                  "margin:0 0 16px;font-size:14.5px;line-height:1.6;color:#5a5a72"
                )}
              >
                Know exactly where your print is, from press to doorstep.
              </p>
              <a
                href="tel:+972502225505"
                style={css(
                  "font-size:14.5px;font-weight:600;color:#ec4899"
                )}
              >
                +972 50 2225505 →
              </a>
            </div>
            <div
              style={css(
                "border:1px solid #ececf4;border-radius:20px;padding:28px;background:#fdfdff"
              )}
            >
              <h3
                style={css(
                  "margin:0 0 8px;font-size:18px;font-weight:600;color:#a855f7"
                )}
              >
                Custom sizes
              </h3>
              <p
                style={css(
                  "margin:0 0 16px;font-size:14.5px;line-height:1.6;color:#5a5a72"
                )}
              >
                Odd wall, odd size. Tell us the measurements and we&apos;ll
                quote it.
              </p>
              <a
                href="mailto:info@pixelim.net"
                style={css(
                  "font-size:14.5px;font-weight:600;color:#ec4899"
                )}
              >
                Request a quote →
              </a>
            </div>
          </div>
        </div>
      </section>

      <ContactSection
        bgImg={product.contact.img}
        bgAlt={product.contact.alt}
        para={PRODUCT_CONTACT_PARA}
        uploadHref="#order-app"
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
            {product.finalCta.heading}
          </h2>
          <p
            style={css(
              "margin:18px 0 32px;font-size:17px;line-height:1.6;color:#c4c4dc"
            )}
          >
            {product.finalCta.para}
          </p>
          <a
            href="#order-app"
            style={css(
              "display:inline-block;padding:18px 40px;border-radius:999px;background:linear-gradient(135deg,#7b2ff7,#ec4899);color:#fff;font-size:17px;font-weight:600;box-shadow:0 18px 46px rgba(236,72,153,.4)"
            )}
          >
            Create Yours Now →
          </a>
        </div>
      </section>

      <SiteFooter />
      <StickyCta href="#order-app" />
    </div>
  );
}
