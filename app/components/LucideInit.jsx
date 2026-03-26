"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function LucideInit() {
  const pathname = usePathname()

  useEffect(() => {
    const draw = () => {
      if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons()
      }
    }

    const t = setTimeout(draw, 0)
    return () => clearTimeout(t)
  }, [pathname])

  return null
}
