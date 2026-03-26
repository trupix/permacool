"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function isActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname?.startsWith(`${href}/`)
}

export default function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="topbar">
      <div className="container row between center">
        <Link className="logo" href="/"><img src="/assets/images/logo/perma-cool.png" alt="PermaCool" /></Link>
        <nav className="nav">
          <Link className={isActive(pathname, '/ethanol-chilling-systems') ? 'active' : ''} href="/ethanol-chilling-systems">Ethanol Chillers</Link>
          <Link className={isActive(pathname, '/butane-recovery-system') ? 'active' : ''} href="/butane-recovery-system">Butane Recovery</Link>
          <Link className={isActive(pathname, '/insights') ? 'active' : ''} href="/insights">Insights</Link>
          <Link className={isActive(pathname, '/contact-us') ? 'active' : ''} href="/contact-us">Contact</Link>
        </nav>
        <a className="phone" href="tel:+17472081001">Call 747.208.1001</a>
      </div>
    </header>
  )
}
