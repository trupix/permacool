"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Menu, Phone, X } from "lucide-react";

const mobileProductItems = [
  ["Ethanol Chillers", "/ethanol-chilling-systems"],
  ["BLAST 60/45", "/ethanol-chiller-blast-60"],
  ["BLAST 150/45", "/ethanol-chiller-blast-150"],
  ["BLAST 240/45", "/ethanol-chiller-blast-240"],
  ["Butane Recovery", "/butane-recovery-system"]
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

export default function ResponsiveHeader({ navItems = [] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const resourceItems = [
    ["Home", "/"],
    ...(navItems || []).filter(([, href]) => href === "/learning-center" || href === "/contact-us")
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 980) setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return (
    <header className={`site-header${isOpen ? " menu-open" : ""}`}>
      <Link className="brand" href="/" aria-label="Perma Cool home" onClick={() => setIsOpen(false)}>
        <img className="brand-mark" src="/images/brand/perma-cool.png" alt="" />
        <img className="brand-wordmark" src="/images/brand/perma-cool-wordmark.png" alt="Perma Cool" />
      </Link>

      <nav aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <Link className={isActive(pathname, href) ? "active" : undefined} href={href} key={label}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <a className="header-phone" href="tel:+17472081001" aria-label="Call Perma Cool at 747.208.1001">
          <Phone size={18} aria-hidden="true" />
          <span>747.208.1001</span>
        </a>
        <Link className="header-contact" href="/contact-us" aria-label="Open contact page" onClick={() => setIsOpen(false)}>
          <Mail size={18} aria-hidden="true" />
          <span>Contact</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-primary-navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <button
            className="mobile-nav-backdrop"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          />
          <aside className="mobile-nav-panel" id="mobile-primary-navigation" aria-label="Mobile navigation">
            <div className="mobile-nav-section">
              <p className="mobile-nav-label">Systems</p>
              {mobileProductItems.map(([label, href]) => (
                <Link
                  className={isActive(pathname, href) ? "active" : undefined}
                  href={href}
                  key={href}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div className="mobile-nav-section">
              <p className="mobile-nav-label">Company</p>
              {resourceItems.map(([label, href]) => (
                <Link
                  className={isActive(pathname, href) ? "active" : undefined}
                  href={href}
                  key={href}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>

            <Link className="mobile-nav-cta" href="/contact-us" onClick={() => setIsOpen(false)}>
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </>
      ) : null}
    </header>
  );
}
