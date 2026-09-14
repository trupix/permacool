# Direct VPN monitoring rollout

Read-only OpenVPN source: authenticated `GET /api/vpn/status` (official reference: https://openvpn.net/as-docs/rest-api/index-en.html).
Exact case-sensitive `username` matching only. Never match substrings, tunnel addresses or certificate common names. Malformed/partial responses, absent enrollment, pending enrollment, auth errors and stale responses remain unknown.

The website checks site and device permissions before resolving existing `external`/`issued` enrollment identities. Browsers receive only aggregate connected/disconnected/unknown and observation time; no identities, addresses, traffic or credentials. Multiple authorized PLCs are green only when all are connected. At least one confirmed disconnect is red; uncertain mapping is gray.

One browser request at a time, 30 seconds after completion. Vercel Data Cache shares each exact identity-set result across viewers for 30 seconds. Relay instances share a 30-second single-flight snapshot across callers; errors are cached as unavailable. This is not a global singleton across Cloud Run instances: cold starts, distinct scopes, rollouts or cache eviction can add probes. A strict globally scheduled limit would require an independently authorized scheduler/shared store. No background checks run without viewers. Observations expire after 60 seconds; cached timestamps are never refreshed without an upstream read.

No PLC, Node-RED, profile, certificate or database writes. OpenVPN login does create ordinary authentication/access logs. Existing generation settings and code paths are preserved. Cloud Run must continue requiring authentication and the Production-only Vercel principal restriction must not change.

## Activation gates (not performed by this branch)

1. Refresh Google Cloud login and validate the actual API response shape and existing relay account's permission to GET status, without granting broader access.
2. Run tests and deploy the reviewed relay image without changing its runtime identity, IAM, secrets, generation setting or network configuration. Do not use deploy-disabled.ps1 blindly against an active service.
3. Verify authenticated health and status, denial of unauthenticated invocation, exact MuhaMeds enrollment identity, and unknown/error behavior. Do not disconnect a real PLC to test.
4. Deploy reviewed website code with `VPN_SESSION_MONITORING_ENABLED=false` initially; enable only after relay validation. No Preview access to Production WIF.
5. Verify authenticated site isolation and real MuhaMeds status. Roll back the flag to false if verification fails; gray is the safe fallback.

Current live API validation is blocked by expired Google Cloud authentication. No Production activation, IAM changes or configuration writes have been performed.
