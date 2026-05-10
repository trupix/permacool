import Image from "next/image";
import { ArrowRight, CheckCircle2, Mail, Phone } from "lucide-react";
import ResponsiveHeader from "../components/ResponsiveHeader";
import { navItems } from "./insights-data";

export function InsightsHeader() {
  return <ResponsiveHeader navItems={navItems} />;
}

export function InsightsFooter() {
  return (
    <footer className="site-footer">
      <div>
        <img src="/images/brand/perma-cool.png" alt="PermaCool" />
        <p>© 2026 Perma Cool Systems Inc.</p>
      </div>
      <div className="footer-actions">
        <a href="tel:+17472081001">
          <Phone size={17} aria-hidden="true" />
          747.208.1001
        </a>
        <a href="mailto:sales@perma.cool">
          <Mail size={17} aria-hidden="true" />
          sales@perma.cool
        </a>
      </div>
    </footer>
  );
}

export function ArticleHero({ article }) {
  return (
    <section className={`insight-article-hero ${article.heroClass || ""}`}>
      <Image src={article.image} alt="" fill priority className="insight-article-hero-image" sizes="100vw" />
      <div className="insight-article-hero-overlay" />
      <div className="insight-article-hero-content">
        <a className="insight-back-link" href="/learning-center">
          ← Back to Learning Center
        </a>
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.intro}</p>
      </div>
    </section>
  );
}

export function InsightCta({ cta }) {
  return (
    <section className="insight-cta">
      <div>
        <p className="eyebrow">{cta.eyebrow}</p>
        <h2>{cta.title}</h2>
      </div>
      <div className="related-actions">
        <a className="button primary" href={cta.primary[1]}>
          {cta.primary[0]}
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href={cta.secondary[1]}>
          {cta.secondary[0]}
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

export function RelatedReading({ links }) {
  if (!links?.length) return null;

  return (
    <section className="insight-related-card">
      <p className="eyebrow">Related Reading</p>
      <div>
        {links.map(([label, href]) => (
          <a href={href} key={href}>
            {label}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function SectionCardGrid({ sections }) {
  return (
    <div className="insight-section-grid">
      {sections.map(({ icon: Icon, title, body }) => (
        <article className="insight-section-card" key={title}>
          {Icon ? <Icon size={24} aria-hidden="true" /> : null}
          <h3>{title}</h3>
          <p>{body}</p>
        </article>
      ))}
    </div>
  );
}

export function BulletPanel({ title, bullets, body }) {
  return (
    <article className="insight-bullet-panel">
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {bullets ? (
        <ul>
          {bullets.map((bullet) => (
            <li key={bullet}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
