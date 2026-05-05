import Image from "next/image";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import {
  indexTopics,
  insightArticles,
  insightHeroImage,
  insightIndexStats
} from "./insights-data";
import { InsightsFooter, InsightsHeader } from "./InsightsShell";

export const metadata = {
  title: "PermaCool Insights",
  description:
    "PermaCool insights covering direct refrigerant vs LN2, extraction workflow, maintenance planning, and cooling system design."
};

export default function InsightsPage() {
  return (
    <main className="site-shell insights-page">
      <InsightsHeader />
      <section className="insights-hero">
        <Image src={insightHeroImage} alt="" fill priority className="insights-hero-image" sizes="100vw" />
        <div className="insights-hero-overlay" />
        <div className="insights-hero-content">
          <p className="eyebrow">Knowledge Hub</p>
          <h1>The Science of Extraction - If you can’t explain it simply, you don’t understand it well enough.</h1>
          <p>
            Owning and operating an extraction lab means mastering the business of extraction itself. Long-term
            competitiveness depends on understanding every detail of the process, continuously improving efficiency, and
            building systems that can scale reliably. The labs that succeed are the ones that treat extraction not just
            as a service, but as a discipline to be refined, optimized, and executed at the highest level.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/direct-refrigerant-vs-ln2">
              Start with LN2 comparison
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/contact-us">
              Ask for a recommendation
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="insights-topic-panel">
        <div className="insights-topic-card">
          <div>
            <span className="micro-label">Live-Site Topics</span>
            <h2>Current content tracks rebuilt into this Next.js site.</h2>
          </div>
          <ul>
            {indexTopics.map((topic) => (
              <li key={topic}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="insights-stat-strip">
        {insightIndexStats.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="section insights-index-section">
        <div className="section-heading narrow">
          <p className="eyebrow">Article Library</p>
          <h2>Practical cooling education with a cleaner buyer path.</h2>
          <p>
            Each article keeps the live-site copy, then wraps it in stronger visuals, clearer cards, and working links.
          </p>
        </div>

        <div className="insight-card-grid">
          {insightArticles.map((article) => (
            <article className="insight-card" key={article.slug}>
              <a className="insight-card-media" href={article.href} aria-label={article.title}>
                <Image src={article.image} alt="" width={720} height={420} />
              </a>
              <div className="insight-card-copy">
                <p className="pill">{article.category}</p>
                <h3>{article.shortTitle}</h3>
                <p>{article.summary}</p>
                <a className="inline-link" href={article.href}>
                  Read article →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="insights-bottom-cta">
        <BookOpen size={34} aria-hidden="true" />
        <div>
          <p className="eyebrow">Recommendation Path</p>
          <h2>Want content mapped to your facility profile?</h2>
          <p>
            Insights pages work best when they connect directly to a consultative quote flow, not a dead-end brochure
            experience.
          </p>
        </div>
        <a className="button primary" href="/contact-us">
          Request a recommendation
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      <InsightsFooter />
    </main>
  );
}
