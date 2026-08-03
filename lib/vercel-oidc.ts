import { getVercelOidcToken as getVercelRuntimeOidcToken } from '@vercel/oidc';

type OidcTokenProvider = () => Promise<string>;

export async function getVercelOidcToken(
  provider: OidcTokenProvider = getVercelRuntimeOidcToken
) {
  try {
    return await provider();
  } catch {
    return '';
  }
}
