export function getVercelOidcToken(requestHeaders: Pick<Headers, 'get'>) {
  return requestHeaders.get('x-vercel-oidc-token') ?? process.env.VERCEL_OIDC_TOKEN ?? '';
}
