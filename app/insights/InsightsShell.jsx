import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ResponsiveHeader from "../components/ResponsiveHeader";
import StructuredData from "../components/StructuredData";
import { buildArticleStructuredData } from "../../lib/site";
import { navItems } from "./insights-data";

function formatArticleDate(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function InsightsHeader() {
  return <ResponsiveHeader navItems={navItems} />;
}

export function ArticleHero({ article }) {
  const updatedLabel = formatArticleDate(article.updatedAt);

  return (
    <>
      <StructuredData data={buildArticleStructuredData(article)} />
      <section className={`insight-article-hero ${article.heroClass || ""}`}>
        <Image src={article.image} alt="" fill priority fetchPriority="high" className="insight-article-hero-image" sizes="100vw" />
        <div className="insight-article-hero-overlay" />
        <div className="insight-article-hero-content">
          <a className="insight-back-link" href="/learning-center">
            ← Back to Learning Center
          </a>
          <p className="eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
          <div className="insight-article-trustline">
            <span>Published by Perma Cool</span>
            {updatedLabel ? (
              <>
                <span aria-hidden="true">/</span>
                <time dateTime={article.updatedAt}>Updated {updatedLabel}</time>
              </>
            ) : null}
          </div>
          {article.goalTicket ? <LearningGoalTicket text={article.goalTicket} /> : null}
        </div>
      </section>
    </>
  );
}

export function LearningGoalTicket({ text }) {
  return (
    <div className="learning-goal-ticket">
      <img src="/images/generated/permacool-golden-ticket-original.png" alt="" aria-hidden="true" />
      <p>{text}</p>
    </div>
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
