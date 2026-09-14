export function hasConnectionHealthNav(siteId: string | null): boolean {
  return siteId === 'site-cannon-falls' || siteId === 'site-muhameds-los-angeles';
}

export function hasConnectionHealthPanel(siteId: string): boolean {
  return hasConnectionHealthNav(siteId) || siteId === 'site-salinas';
}
