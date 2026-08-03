[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Image,

  [Parameter(Mandatory = $true)]
  [string]$OpenVpnPrivateAddress,

  [Parameter(Mandatory = $true)]
  [string]$OpenVpnTlsName,

  [string]$Project = 'project-10fbf5ae-d9d0-4052-ba0',
  [string]$Region = 'us-east4',
  [string]$Service = 'permacool-openvpn-provisioning-relay',
  [string]$RuntimeServiceAccount =
    'permacool-vpn-relay@project-10fbf5ae-d9d0-4052-ba0.iam.gserviceaccount.com',
  [string]$StateBucket = 'permacool-vpn-relay-state-791405864211'
)

$ErrorActionPreference = 'Stop'

$runtimeVariables = @(
  'PROFILE_GENERATION_ENABLED=false',
  "OPENVPN_ACCESS_SERVER_URL=https://${OpenVpnTlsName}:943",
  "OPENVPN_CONNECT_HOST=$OpenVpnPrivateAddress",
  "OPENVPN_TLS_SERVER_NAME=$OpenVpnTlsName",
  "IDEMPOTENCY_BUCKET=$StateBucket"
) -join ','

$secretVariables = @(
  'OPENVPN_ACCESS_SERVER_USERNAME=openvpn-access-server-username:latest',
  'OPENVPN_ACCESS_SERVER_PASSWORD=openvpn-access-server-password:latest',
  'OPENVPN_ACCESS_SERVER_CA_PEM=openvpn-access-server-ca-pem:latest'
) -join ','

gcloud run deploy $Service `
  --project=$Project `
  --region=$Region `
  --platform=managed `
  --image=$Image `
  --service-account=$RuntimeServiceAccount `
  --no-allow-unauthenticated `
  --ingress=all `
  --network=default `
  --subnet=default `
  --vpc-egress=private-ranges-only `
  --port=8080 `
  --cpu=1 `
  --memory=256Mi `
  --min=0 `
  --max=2 `
  --concurrency=10 `
  --timeout=60 `
  --set-env-vars=$runtimeVariables `
  --set-secrets=$secretVariables `
  --quiet

if ($LASTEXITCODE -ne 0) {
  throw 'The disabled relay deployment failed.'
}

Write-Output 'Relay deployed with profile generation disabled.'
