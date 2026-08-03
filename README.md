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

## Notes

- Styling is ported verbatim from the original inline styles via the `css()`
  helper; the only stylesheet is `app/globals.css` (fonts, links, the two
  media-query visibility toggles, and the hover "lift" effects).
- Once you've confirmed everything looks right, the reference
  `Pixelim Landing Page System/` folder can be deleted from the project root.
- `npm audit` reports advisories in `postcss`/`sharp` that ship inside Next.js
  15.5.22. Do **not** run `npm audit fix --force` — it downgrades Next.js to v9.
  They clear by bumping Next.js in a later pass.
