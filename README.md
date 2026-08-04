# Pixelim — Landing Pages (Next.js)

Next.js 15 (App Router, TypeScript) port of the original Pixelim landing pages.
Phase 1 is a faithful static reproduction of the four pages; further functionality
(real order app, cart, blog, form submission) comes later.

## Pages

| Route                     | Content                                  |
| ------------------------- | ---------------------------------------- |
| `/`                       | Home                                     |
| `/acrylic-photo-prints`   | Acrylic Photo Prints                     |
| `/canvas-prints`          | Canvas Prints                            |
| `/aluminium-prints`       | Aluminum Prints                          |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Structure

```
app/
  layout.tsx                 Root layout (Poppins via next/font, global metadata)
  globals.css                Body, links, responsive toggles, hover effects
  page.tsx                   Home page
  acrylic-photo-prints/      Product route -> <ProductPage product={ACRYLIC} />
  canvas-prints/             Product route -> <ProductPage product={CANVAS} />
  aluminium-prints/          Product route -> <ProductPage product={ALUMINIUM} />
  components/
    SiteHeader.tsx           Fixed nav with scroll-reactive background
    SiteFooter.tsx           Shared footer
    ContactSection.tsx       Shared "Contact Us" section
    StickyCta.tsx            Mobile-only sticky call-to-action
    ProductPage.tsx          Shared product-page template (options + FAQ state)
  lib/
    products.ts              Content data for the three product pages
    css.ts                   Helper that turns the original inline CSS strings
                             into React style objects (keeps the port faithful)
public/images/               All artwork and logos
```

The three product pages are structurally identical and differ only in the data
defined in `app/lib/products.ts`.

## Lead pipeline & admin panel

The Contact form submits real leads through the same pipeline used by the
`pixelim-us` project (MongoDB persistence, 2-minute duplicate suppression,
optional email/webhook notifications, and first-party visitor-attribution
tracking). A password-protected admin panel lives at `/admin`.

```
lib/                 Backend: Mongo (mongodb.ts, models/Lead.ts), admin sessions,
                     email transports (SMTP + Gmail OAuth), Make.com + Apps Script
                     webhooks, activity log, notification subscribers
app/api/leads/       Public lead submission endpoint (POST)
app/api/track/       First-party pageview tracking (visitor_events)
app/api/admin/       Admin API (auth, leads CRUD, notifications, email settings)
app/admin/           Admin UI (dashboard, leads, lead detail, notifications, settings)
components/admin/     Admin React components (Tailwind)
middleware.ts        Gates /admin and /api/admin behind a signed session cookie
```

Admin styling uses Tailwind, scoped to `/admin` only (config content globs +
CSS imported in `app/admin/layout.tsx`), so it never touches the inline-styled
public pages.

### Setup

1. Copy `.env.example` to `.env.local` and fill it in. Minimum to run the admin:
   `MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
2. `npm run dev`, then sign in at `/admin/login`.
3. Email notifications, Make.com, Google Apps Script sheet sync, and Google
   admin login are all optional and configured via env / the admin UI. When a
   channel isn't configured it's skipped gracefully — leads are still saved.

The `Lead` schema matches `pixelim-us` plus an optional `message` field (the
Contact form's message, shown on the lead-detail page).

## Notes

- Styling is ported verbatim from the original inline styles via the `css()`
  helper; the only stylesheet is `app/globals.css` (fonts, links, the two
  media-query visibility toggles, and the hover "lift" effects).
- Once you've confirmed everything looks right, the reference
  `Pixelim Landing Page System/` folder can be deleted from the project root.
- `npm audit` reports advisories in `postcss`/`sharp` that ship inside Next.js
  15.5.22. Do **not** run `npm audit fix --force` — it downgrades Next.js to v9.
  They clear by bumping Next.js in a later pass.
