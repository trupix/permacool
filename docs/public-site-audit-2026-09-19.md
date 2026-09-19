# Public website audit — September 19, 2026

Scope: public marketing site and the newly published service-plan/contact flow. Authenticated operations, hardware telemetry, and third-party email delivery were not exercised.

## Results
- All 21 sitemap URLs returned HTTP 200, with one H1, a title, description, and canonical URL.
- 44 discovered internal page and static-asset URLs passed HTTP checks.
- All 21 public pages were checked at 390px for horizontal overflow; none found. Rendered image checks and local anchor checks found no failures on the product, learning, and policy pages checked.
- Service-plan layouts passed at 320, 390, 768, 1024, and 1440px.
- Both service-plan contact preloads retain their selections. Contact controls have associated labels and required name/email/interest fields.
- Contact normalization and context tests pass. No live inquiry was sent; actual email receipt remains unverified.

## Fixes
- Preserve the preselected interest and cooling method in early submission-error redirects, including unavailable email configuration and rate limiting. A local failure-path request confirmed Agentic remained selected. Posted form selections still take precedence after parsing.
- Remove obsolete service-card styles and superseded phone declarations from the initial four-service design.
- Move the contact test success message after all assertions and add regression coverage for support-plan retry context.

## Limits
This was a public-site functional and responsive audit, not a penetration test or an audit of authenticated customer operations. Lazy-loaded media not loaded during the browser checks and external third-party links were not exhaustively tested.
