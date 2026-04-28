import {
  ArticleHero,
  BulletPanel,
  InsightCta,
  InsightsFooter,
  InsightsHeader,
  RelatedReading,
  SectionCardGrid
} from "./InsightsShell";

export function StandardArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />
      <section className="section insight-article-body">
        {article.kicker ? (
          <div className="section-heading narrow">
            <p className="eyebrow">{article.kicker}</p>
            {article.deck ? <h2>{article.deck}</h2> : null}
          </div>
        ) : null}
        <SectionCardGrid sections={article.sections} />
        {article.noteTitle ? (
          <article className="insight-note">
            <p className="eyebrow">{article.noteTitle}</p>
            <p>{article.note}</p>
          </article>
        ) : null}
        <RelatedReading links={article.related} />
      </section>
      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}

export function WorkflowArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />
      <section className="section insight-article-body">
        <div className="section-heading narrow">
          <p className="eyebrow">{article.kicker}</p>
          <h2>{article.deck}</h2>
          <p>{article.intro}</p>
        </div>
        <SectionCardGrid sections={article.steps} />
        <article className="insight-note">
          <p>{article.callout}</p>
        </article>

        <div className="section-heading narrow insight-advantage-head">
          <p className="eyebrow">The Electric Advantage</p>
          <h2>Advantages of using electricity with the Perma Cool Ethanol Pre-Chiller.</h2>
          <p>{article.advantageIntro}</p>
        </div>
        <div className="insight-bullet-grid">
          {article.groups.map((group) => (
            <BulletPanel key={group.title} {...group} />
          ))}
        </div>
      </section>
      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}
