import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, GitCompareArrows, Snowflake } from "lucide-react";
import { InsightsHeader } from "./insights/InsightsShell";

export const metadata = {
  title: "Page Not Found | Perma Cool",
  description: "Find Perma Cool ethanol chillers, product comparisons, technical guidance, and quote support.",
  robots: {
    index: false,
    follow: true
  }
};

const destinations = [
  {
    title: "Ethanol Chiller Lineup",
    body: "Explore the BLAST 60/45, 150/45, and 240/45 extraction cooling systems.",
    href: "/ethanol-chilling-systems",
    label: "View the lineup",
    icon: Snowflake
  },
  {
    title: "Compare BLAST Systems",
    body: "Compare capacity, workflow fit, architecture, controls, and facility integration.",
    href: "/ethanol-chiller-comparison",
    label: "Compare systems",
    icon: GitCompareArrows
  },
  {
    title: "Learning Center",
    body: "Read practical guidance on chilling methods, process design, maintenance, and operating cost.",
    href: "/learning-center",
    label: "Browse technical guides",
    icon: BookOpen
  },
  {
    title: "Request a Quote",
    body: "Share your throughput, temperature target, and current cooling method for a process-fit recommendation.",
    href: "/contact-us",
    label: "Start a quote",
    icon: FileText
  }
];

export default function NotFound() {
  return (
    <main className="site-shell not-found-page">
      <InsightsHeader />

      <section className="not-found-hero">
        <Image
          className="not-found-hero-image"
          src="/images/generated/blast60-hero-most-accurate-outdoor-condensers.png"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="not-found-hero-overlay" />
        <div className="not-found-hero-content">
          <p className="not-found-code">404 / Page not found</p>
          <h1>This page moved. The right cooling system is still easy to find.</h1>
          <p>
            The address may be outdated, but the current Perma Cool product lineup, comparison tools, technical
            guidance, and quote support are available below.
          </p>
          <div className="not-found-actions">
            <Link className="button primary" href="/ethanol-chilling-systems">
              Explore Ethanol Chillers
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button secondary light" href="/contact-us">
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="not-found-guide" aria-labelledby="not-found-guide-heading">
        <div className="not-found-guide-heading">
          <p className="eyebrow">Choose your next step</p>
          <h2 id="not-found-guide-heading">Go directly to the information you need.</h2>
        </div>
        <div className="not-found-grid">
          {destinations.map(({ title, body, href, label, icon: Icon }) => (
            <Link className="not-found-card" href={href} key={href}>
              <span className="not-found-card-icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="not-found-card-link">
                {label}
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
