"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Mail, Menu, Phone, X } from "lucide-react";

const extractionItems = [
  ["Ethanol Chillers", "/ethanol-chilling-systems"],
  ["Butane Recovery", "/butane-recovery-system"]
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

export default function ResponsiveHeader({ navItems = [] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [mobileExtractionOpen, setMobileExtractionOpen] = useState(false);
  const extractionRef = useRef(null);
  const extractionButtonRef = useRef(null);
  const isExtractionActive = pathname?.startsWith("/ethanol-") || pathname === "/butane-recovery-system";
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const openerRef = useRef(null);
  const shouldRestoreFocusRef = useRef(false);
  const resourceItems = [
    ["Home", "/"],
    ...(navItems || []).filter(([, href]) => href === "/learning-center" || href === "/contact-us")
  ];

  const closeMenu = useCallback((restoreFocus = true) => {
    shouldRestoreFocusRef.current = restoreFocus;
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setExtractionOpen(false);
    setMobileExtractionOpen(Boolean(pathname?.startsWith("/ethanol-") || pathname === "/butane-recovery-system"));
  }, [pathname]);

  useEffect(() => {
    if (!extractionOpen) return undefined;
    const closeOutside = (event) => {
      if (!extractionRef.current?.contains(event.target)) setExtractionOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setExtractionOpen(false);
        extractionButtonRef.current?.focus();
      }
    };
    const closeOnResize = () => setExtractionOpen(false);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [extractionOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const header = headerRef.current;
    const pageContainer = header?.parentElement;
    const backgroundElements = [
      ...(pageContainer ? Array.from(pageContainer.children).filter((element) => element !== header) : []),
      ...Array.from(document.body.children).filter((element) => element !== pageContainer && !element.contains(header))
    ];
    const previousInertValues = backgroundElements.map((element) => [element, element.hasAttribute("inert")]);

    backgroundElements.forEach((element) => {
      element.setAttribute("inert", "");
    });

    const getFocusableElements = () => {
      const panelElements = mobilePanelRef.current
        ? Array.from(
            mobilePanelRef.current.querySelectorAll(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

      return [menuButtonRef.current, ...panelElements].filter(
        (element) => element && !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
      );
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (!focusableElements.length) {
        event.preventDefault();
        mobilePanelRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (!focusableElements.includes(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 980) closeMenu(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    window.requestAnimationFrame(() => {
      const firstPanelControl = mobilePanelRef.current?.querySelector(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (firstPanelControl || mobilePanelRef.current)?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      previousInertValues.forEach(([element, wasInert]) => {
        if (!wasInert) element.removeAttribute("inert");
      });
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);

      if (shouldRestoreFocusRef.current) {
        const focusTarget = openerRef.current || menuButtonRef.current;
        focusTarget?.focus();
        shouldRestoreFocusRef.current = false;
      }
    };
  }, [closeMenu, isOpen]);

  const handleMenuToggle = (event) => {
    if (isOpen) {
      closeMenu(true);
      return;
    }

    openerRef.current = event.currentTarget;
    shouldRestoreFocusRef.current = false;
    setIsOpen(true);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header ref={headerRef} className={`site-header${isOpen ? " menu-open" : ""}`}>
        <Link className="brand" href="/" aria-label="Perma Cool home" onClick={() => closeMenu(false)}>
          <img className="brand-mark" src="/images/brand/perma-cool.png" alt="" />
          <img className="brand-wordmark" src="/images/brand/perma-cool-wordmark.png" alt="Perma Cool" />
        </Link>

      <nav aria-label="Primary navigation">
        {navItems.map(([label, href]) => href === "/#extraction" ? (
          <div className="extraction-nav" ref={extractionRef} key={href} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setExtractionOpen(false);
          }}>
            <button ref={extractionButtonRef} type="button" className={`extraction-nav-toggle${isExtractionActive ? " active" : ""}`} aria-expanded={extractionOpen} aria-controls="extraction-navigation" onClick={() => setExtractionOpen(!extractionOpen)}>
              {label}<ChevronDown size={15} aria-hidden="true" />
            </button>
            <div className="extraction-nav-links" id="extraction-navigation" data-open={extractionOpen} aria-hidden={!extractionOpen} inert={!extractionOpen}>
              <p>Extraction cooling systems</p>
              {extractionItems.map(([name, path]) => <Link href={path} key={path} tabIndex={extractionOpen ? undefined : -1} aria-current={isActive(pathname, path) ? "page" : undefined} onClick={() => setExtractionOpen(false)}><span>{name}<small>{path === "/ethanol-chilling-systems" ? "Explore the BLAST ethanol chiller series" : "Commercial BHO recovery systems"}</small></span><ArrowRight size={17} aria-hidden="true" /></Link>)}
            </div>
          </div>
        ) : (
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
        <Link className="header-contact" href="/contact-us" aria-label="Open contact page" onClick={() => closeMenu(false)}>
          <Mail size={18} aria-hidden="true" />
          <span>Contact</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          ref={menuButtonRef}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-primary-navigation"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={handleMenuToggle}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <div
            className="mobile-nav-backdrop"
            aria-hidden="true"
            onClick={() => closeMenu(true)}
          />
          <aside
            className="mobile-nav-panel"
            id="mobile-primary-navigation"
            ref={mobilePanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            tabIndex={-1}
          >
            <div className="mobile-nav-section">
              <p className="mobile-nav-label" id="mobile-navigation-title">Systems</p>
              <button className={`mobile-extraction-toggle${isExtractionActive ? " active" : ""}`} type="button" aria-expanded={mobileExtractionOpen} aria-controls="mobile-extraction-links" onClick={() => setMobileExtractionOpen(!mobileExtractionOpen)}>Extraction Chillers<ChevronDown size={18} aria-hidden="true" /></button>
              {mobileExtractionOpen && <div className="mobile-extraction-links" id="mobile-extraction-links">{extractionItems.map(([label, href]) => (
                <Link
                  className={isActive(pathname, href) ? "active" : undefined}
                  href={href}
                  key={href}
                  onClick={() => closeMenu(false)}
                >
                  {label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}</div>}
              <Link className={isActive(pathname, "/perma-lab-process") ? "active" : undefined} href="/perma-lab-process" onClick={() => closeMenu(false)}>PERMA Lab Process<ArrowRight size={16} aria-hidden="true" /></Link>
            </div>

            <div className="mobile-nav-section">
              <p className="mobile-nav-label">Company</p>
              {resourceItems.map(([label, href]) => (
                <Link
                  className={isActive(pathname, href) ? "active" : undefined}
                  href={href}
                  key={href}
                  onClick={() => closeMenu(false)}
                >
                  {label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>

            <Link className="mobile-nav-cta" href="/contact-us" onClick={() => closeMenu(false)}>
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </>
      ) : null}
      </header>
      <span className="main-content-anchor" id="main-content" tabIndex={-1}>
        Main content
      </span>
    </>
  );
}
