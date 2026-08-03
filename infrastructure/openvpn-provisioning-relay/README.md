# Secure OpenVPN provisioning relay

This Cloud Run service is the only component permitted to hold OpenVPN Access Server credentials. It is invoked with a Google-signed identity token obtained through Vercel OIDC and Google Workload Identity Federation.

The service reaches OpenVPN over Direct VPC egress, verifies the private OpenVPN CA and expected TLS server name, and writes atomic idempotency reservations to a private Cloud Storage bucket. A reservation is never automatically retried after an uncertain OpenVPN result.

Profile generation is deployed disabled by default with `PROFILE_GENERATION_ENABLED=false`. The `/health` endpoint performs only authenticated login and user lookup. Cloud Run IAM must deny unauthenticated invocation.

Secrets are injected from Secret Manager and must never be committed or copied into Vercel:

- `OPENVPN_ACCESS_SERVER_USERNAME`
- `OPENVPN_ACCESS_SERVER_PASSWORD`
- `OPENVPN_ACCESS_SERVER_CA_PEM`

Non-secret runtime configuration:

- `OPENVPN_ACCESS_SERVER_URL`
- `OPENVPN_CONNECT_HOST`
- `OPENVPN_TLS_SERVER_NAME`
- `IDEMPOTENCY_BUCKET`
- `PROFILE_GENERATION_ENABLED`

The Next.js application receives only these non-secret values:

- `OPENVPN_PROVISIONING_RELAY_URL`
- `GCP_PROVISIONING_WORKLOAD_IDENTITY_AUDIENCE`
- `GCP_PROVISIONING_SERVICE_ACCOUNT_EMAIL`

## Security boundaries

- Cloud Run rejects unauthenticated invocation.
- The workload-identity provider accepts only the exact Vercel team, project,
  and Production subject configured by the operator. Preview and Development
  identities fail closed.
- The runtime service account can access only the three named secrets and can
  create objects in the dedicated idempotency bucket.
- The relay has no database credentials. Owner and organization authorization
  remain in the application before the relay is called.
- The relay does not log profiles, tokens, credentials, request bodies, or
  OpenVPN error bodies.
- A create-only state object is written before the first OpenVPN mutation. A
  duplicate or uncertain request remains locked for manual reconciliation.
- `PROFILE_GENERATION_ENABLED=false` is the safe deployment default and must
  remain false for Preview verification.

Deploy the image with `deploy-disabled.ps1`. The script accepts the private
VPN address and expected TLS identity as runtime parameters so network details
are not committed to source control.
