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
  title: "PermaCool Learning Center",
  description:
    "PermaCool learning center covering direct refrigerant vs LN2, extraction workflow, maintenance planning, and cooling system design.",
  alternates: { canonical: "https://perma.cool/learning-center" }
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
            Journey into the art, science and business of extraction through our knowledge hub. Learn the why, not just
            the how and take your extraction process to the next level.
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
            <span className="micro-label">Cooling Topics</span>
            <h2>Practical guidance for extraction cooling decisions.</h2>
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
          <h2>Technical guidance for better cooling and extraction decisions.</h2>
          <p>
            Explore cooling methods, operating workflows, maintenance planning, and system-design considerations for
            commercial extraction facilities.
          </p>
        </div>

        <div className="insight-card-grid">
          {insightArticles.filter((article) => !article.hidden).map((article) => (
            <article className="insight-card" key={article.slug}>
              <a className="insight-card-media" href={article.href} aria-label={article.title}>
                <Image src={article.previewImage || article.image} alt="" width={720} height={420} />
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
          <p className="eyebrow">System Recommendation</p>
          <h2>Need guidance for your facility?</h2>
          <p>
            Share your throughput, temperature target, current cooling method, and facility constraints. PermaCool can
            help identify the most appropriate next step.
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
