import Script from 'next/script'
import './globals.css'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import LucideInit from './components/LucideInit'

export const metadata = {
  title: 'PermaCool Systems',
  description: 'Industrial extraction cooling systems by PermaCool.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://unpkg.com/lucide@latest" strategy="afterInteractive" />
        <Script src="/analytics.js" strategy="afterInteractive" />
        <LucideInit />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
