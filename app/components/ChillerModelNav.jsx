"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { buildContactHref } from "../../lib/contact";
import { chillerModels, chillerOverview, getChillerNavigation } from "../../lib/chiller-navigation";
import "./chiller-model-nav.css";

export default function ChillerModelNav() {
  const pathname = usePathname();
  const router = useRouter();
  const context = getChillerNavigation(pathname);
  if (!context) return null;
  const links = [{ label: "All systems", href: chillerOverview }, ...chillerModels];

  return (
    <nav className="chiller-model-nav" aria-label="Ethanol chiller models">
      <div className="chiller-model-nav-links">
        {links.map(({ label, href }) => (
          <Link key={href} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
        ))}
      </div>
      <select className="chiller-model-picker" aria-label="Choose an ethanol chiller model" value={context.selectedHref}
        onChange={(event) => router.push(event.target.value)}>
        <option value="" disabled>Choose a model</option>
        {links.map(({ label, href }) => <option key={href} value={href}>{label.replace("BLAST ", "")}</option>)}
      </select>
      <Link className="chiller-model-pricing" href={buildContactHref(context.contact)} prefetch={false}>
        Request pricing <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </nav>
  );
}
