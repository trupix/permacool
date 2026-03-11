# PermaCool Site (Static SEO Build)

This repository contains a static HTML/CSS site optimized for SEO and lead capture.

## Included
- Product/commercial pages
- Insights content hub + long-tail articles
- Structured data (Organization/Product/FAQ/Article)
- `sitemap.xml` and `robots.txt`
- Basic client-side event tracking (`analytics.js`)
- Thank-you conversion page (`thank-you.html`)

## Deploy
Any static host works (Cloudflare Pages, Netlify, Vercel static, S3, GitHub Pages).

## Tracking Notes
`analytics.js` logs CTA + form events to browser console/localStorage.
If `gtag` or `plausible` exists on page, events are forwarded automatically.
