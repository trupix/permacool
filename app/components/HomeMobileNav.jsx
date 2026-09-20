"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { extractionItems } from "./navigation-data";

export default function HomeMobileNav({ navItems }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const outside = event => {
      if (!navRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = event => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const resize = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return <nav className="ph-mobile-nav" aria-label="Homepage quick navigation" ref={navRef} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {navItems.map(([label, href]) => href === "/#extraction" ?
      <div className="ph-nav-extraction" key={href}>
        <button ref={buttonRef} className="ph-nav-trigger" type="button" aria-expanded={open} aria-controls="home-extraction-links" onClick={() => setOpen(!open)}>
          {label}<ChevronDown size={14} aria-hidden="true" />
        </button>
        {open && <div className="ph-nav-dropdown" id="home-extraction-links">
          <p>Extraction cooling systems</p>
          {extractionItems.map(([name, path]) => <Link key={path} href={path} onClick={() => setOpen(false)}>
            <span>{name}<small>{path === "/ethanol-chilling-systems" ? "Explore the BLAST ethanol chiller series" : path === "/service-plan" ? "Basic and Agentic annual service plans" : "Commercial BHO recovery systems"}</small></span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>)}
        </div>}
      </div> : <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
    )}
  </nav>;
}
