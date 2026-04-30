import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  ArticleHero,
  BulletPanel,
  InsightCta,
  InsightsFooter,
  InsightsHeader,
  RelatedReading,
  SectionCardGrid
} from "./InsightsShell";

const moreOutputSteps = [
  "Extract with properly chilled ethanol.",
  "Strain the ethanol before it returns to the chiller.",
  "Re-chill the same ethanol back to the target temperature.",
  "Re-run that ethanol through fresh biomass.",
  "Repeat until the desired biomass-to-ethanol ratio is reached."
];

const moreOutputHighlights = [
  "Less lightly loaded ethanol going to recovery.",
  "More extracted value per gallon of ethanol.",
  "Better throughput through a common recovery bottleneck."
];

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

export function MoreOutputPerGallonArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />

      <section className="section insight-article-body more-output-article">
        <article className="more-output-lede">
          <p>
            In cold ethanol extraction, solvent recovery is often the slowest part of the process. The extractor may be
            ready for more biomass, and the chiller may be able to keep ethanol cold, but the evaporator still has to
            remove and recover every gallon of ethanol that gets sent downstream.
          </p>
          <p className="more-output-punch">That makes every gallon matter.</p>
        </article>

        <figure className="more-output-figure">
          <img src="/images/generated/more-output-workflow-diagram.svg" alt="Extract, strain, re-chill, re-run, repeat workflow diagram" />
        </figure>

        <section className="more-output-split">
          <div>
            <p className="eyebrow">The Workflow</p>
            <h2>Use the same ethanol harder before recovery has to touch it.</h2>
            <p>
              One way to improve the return on each gallon is to use an extract, re-chill, and re-run workflow. Instead
              of running cold ethanol through biomass once and immediately sending that ethanol to evaporation, the same
              ethanol can be re-chilled and run again across fresh biomass.
            </p>
            <p>
              This cycle can be repeated until the ethanol reaches a heavier loading ratio, with operators working
              toward as much as three pounds of biomass extracted per one gallon of ethanol.
            </p>
          </div>
          <ol className="more-output-steps">
            {moreOutputSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <article className="more-output-strainer">
          <div>
            <p className="eyebrow">Protect the Chiller</p>
            <h2>The straining step matters.</h2>
          </div>
          <div>
            <p>
              When ethanol is being reused through multiple extraction passes, biomass particles and fines need to be
              kept out of the Perma Cool. A 50-100 micron strainer helps protect the system by catching unwanted solids
              before the ethanol returns to the chiller.
            </p>
            <p>
              Perma Cool makes a strainer specifically for this application. It is not a disposable consumable or a
              generic filter bag. It is a durable process component designed for the way cold ethanol extraction
              actually runs in production.
            </p>
          </div>
        </article>

        <figure className="more-output-figure">
          <img src="/images/generated/more-output-recovery-bottleneck.svg" alt="Evaporation bottleneck comparison showing more value per gallon" />
        </figure>

        <section className="more-output-split">
          <div>
            <p className="eyebrow">Recovery Efficiency</p>
            <h2>Each gallon entering recovery should carry more extracted value.</h2>
          </div>
          <div>
            <p>
              If one gallon of ethanol is only used on a light biomass load, the recovery system still has to spend the
              time and energy to evaporate and recover that full gallon. But when that same gallon has been used across
              multiple biomass passes, it carries more extracted value into recovery.
            </p>
            <p>
              For facilities where evaporation and recovery are the bottleneck, this can improve overall production
              efficiency without immediately increasing recovery capacity. The goal is not simply to move more ethanol.
              The goal is to make each gallon of ethanol do more work before it reaches the slowest stage of the
              process.
            </p>
          </div>
        </section>

        <article className="more-output-note">
          <p className="eyebrow">Why reliable chilling makes it practical</p>
          <p>
            After each extraction pass, ethanol needs to be pulled back down to the correct cold operating range before
            it is reused. If it warms up too much, the extraction process can lose the selectivity and performance that
            cold ethanol is used for in the first place.
          </p>
          <p>
            Perma Cool ethanol pre-chillers are built around that production reality: keeping ethanol cold, recoverable,
            and ready to run again.
          </p>
        </article>

        <div className="more-output-highlights">
          {moreOutputHighlights.map((item) => (
            <article key={item}>
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>

        <section className="more-output-workflow-link">
          <div>
            <p className="eyebrow">Keep Learning</p>
            <h2>Want the full re-chill and re-extract sequence?</h2>
            <p>
              The workflow article breaks down the operating rhythm step by step, including pumping, straining,
              returning, and repeating the cycle.
            </p>
          </div>
          <a className="button primary" href="/workflow">
            Read the Workflow Article
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>

        <RelatedReading links={article.related} />
      </section>

      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}
