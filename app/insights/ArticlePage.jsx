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

const workflowFlowImage = "/images/generated/cold-ethanol-workflow-label-style-option-3-repeat-logo.png";

const processOwnershipDrivers = [
  "Material preparation",
  "Run management",
  "Temperature control",
  "Solvent recovery",
  "Throughput improvement",
  "Loss reduction",
  "Quality protection",
  "Repeatable SOPs"
];

const processLabComparison = [
  {
    title: "Lab A: Equipment without process discipline",
    points: ["Bottlenecks appear late", "Output changes batch to batch", "Troubleshooting becomes the operating rhythm"]
  },
  {
    title: "Lab B: Equipment guided by process knowledge",
    points: ["Constraints are measured", "Output becomes predictable", "Scaling has a controlled path forward"]
  }
];

const processTakeaways = [
  {
    title: "Process is the business",
    body: "The lab creates value through operating knowledge, not equipment ownership alone."
  },
  {
    title: "Knowledge compounds",
    body: "A few points of yield, faster recovery, and fewer failed batches become a durable advantage."
  },
  {
    title: "Scaling is control",
    body: "More volume only helps when the process can repeat quality with less waste and downtime."
  },
  {
    title: "Machines need operators",
    body: "Equipment becomes productive when trained people, SOPs, maintenance, and data make it reliable."
  }
];

const minus40Facts = [
  {
    label: "The conversion",
    value: "F = C x 9/5 + 32",
    body: "Fahrenheit changes the size of each degree and also moves the zero point. Those two choices make the scales diverge almost everywhere."
  },
  {
    label: "The crossing",
    value: "C = F = −40",
    body: "When you set the Celsius and Fahrenheit numbers equal, the only solution is −40. There is not a second meeting point."
  },
  {
    label: "The practical target",
    value: "−40 °C / −40 °F",
    body: "For Perma Cool, that makes a deep-cold process target easy to communicate. Operators, engineers, and buyers are all using the same number."
  }
];

const minus40Takeaways = [
  "Most converted temperature numbers look different across the two scales.",
  "−40 is the single point where Celsius and Fahrenheit share the same reading.",
  "The match happens because the Fahrenheit scale has both a different degree size and a different zero point.",
  "The conversion is linear, so the two lines can meet only once.",
  "That makes −40 rare in everyday science communication: simple, exact, and useful.",
  "For cold ethanol extraction, the shared number makes the temperature target easier to remember."
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
      <section className="section insight-article-body workflow-article">
        <article className="workflow-primary-lede">
          <div>
            <p className="eyebrow">Consolidated Workflow</p>
            <h2>One page for the operating sequence and output-per-gallon strategy.</h2>
          </div>
          <p>
            This workflow combines the step-by-step Perma Cool pre-chiller process with the extract, strain, re-chill,
            and repeat method that helps each gallon of ethanol do more work before recovery.
          </p>
        </article>

        <div className="section-heading narrow">
          <p className="eyebrow">{article.kicker}</p>
          <h2>{article.deck}</h2>
          <p>{article.processIntro || article.intro}</p>
        </div>

        <figure className="more-output-figure">
          <img
            src={workflowFlowImage}
            alt="Cold ethanol workflow showing centrifuge extraction, diaphragm pump transfer, straining, and return to the BLAST 240/45 chiller"
          />
        </figure>

        <WorkflowStageGrid stages={article.steps} />
        <article className="insight-note">
          <p>{article.callout}</p>
        </article>

        <MoreOutputWorkflowSections />

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

function WorkflowStageGrid({ stages }) {
  return (
    <div className="workflow-stage-grid">
      {stages.map(({ icon: Icon, title, body, actions }) => (
        <article className="workflow-stage-card" key={title}>
          <div className="workflow-stage-card-head">
            {Icon ? <Icon size={24} aria-hidden="true" /> : null}
            <h3>{title}</h3>
          </div>
          <p>{body}</p>
          {actions?.length ? (
            <ul>
              {actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function MoreOutputWorkflowSections() {
  return (
    <div className="more-output-article workflow-merged-sections">
      <article className="more-output-lede">
        <p>
          In cold ethanol extraction, solvent recovery is often the slowest part of the process. The extractor may be
          ready for more biomass, and the chiller may be able to keep ethanol cold, but the evaporator still has to
          remove and recover every gallon of ethanol that gets sent downstream.
        </p>
        <p className="more-output-punch">That makes every gallon matter.</p>
      </article>

      <section className="more-output-split">
        <div>
          <p className="eyebrow">The Workflow</p>
          <h2>Use the same ethanol harder before recovery has to touch it.</h2>
          <p>
            One way to improve the return on each gallon is to use an extract, re-chill, and re-run workflow. Instead of
            running cold ethanol through biomass once and immediately sending that ethanol to evaporation, the same
            ethanol can be re-chilled and run again across fresh biomass.
          </p>
          <p>
            This cycle can be repeated until the ethanol reaches a heavier loading ratio, with operators working toward
            as much as three pounds of biomass extracted per one gallon of ethanol.
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
            When ethanol is being reused through multiple extraction passes, biomass particles and fines need to be kept
            out of the Perma Cool. A 50-100 micron strainer helps protect the system by catching unwanted solids before
            the ethanol returns to the chiller.
          </p>
          <p>
            Perma Cool makes a strainer specifically for this application. It is not a disposable consumable or a
            generic filter bag. It is a durable process component designed for the way cold ethanol extraction actually
            runs in production.
          </p>
        </div>
      </article>

      <figure className="more-output-figure">
        <img
          src="/images/generated/more-output-recovery-bottleneck.svg"
          alt="Evaporation bottleneck comparison showing more value per gallon"
        />
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
            efficiency without immediately increasing recovery capacity. The goal is not simply to move more ethanol. The
            goal is to make each gallon of ethanol do more work before it reaches the slowest stage of the process.
          </p>
        </div>
      </section>

      <article className="more-output-note">
        <p className="eyebrow">Why reliable chilling makes it practical</p>
        <p>
          After each extraction pass, ethanol needs to be pulled back down to the correct cold operating range before it
          is reused. If it warms up too much, the extraction process can lose the selectivity and performance that cold
          ethanol is used for in the first place.
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
          <p className="eyebrow">Full Sequence</p>
          <h2>Re-chill and re-extract to get more value from each gallon.</h2>
          <p>
            Pumping, straining, returning, and repeating the cycle helps operators use cold ethanol more effectively
            before it moves to recovery.
          </p>
        </div>
        <a className="button primary" href="/contact-us">
          Talk to Perma Cool
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}

export function MoreOutputPerGallonArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />

      <section className="section insight-article-body more-output-teaser-page">
        <section className="more-output-workflow-link more-output-teaser-card">
          <div>
            <p className="eyebrow">Moved Into Workflow</p>
            <h2>The full article now lives at /workflow.</h2>
            <p>
              The output-per-gallon idea has been folded into the full cold ethanol workflow, including the extract,
              strain, re-chill, repeat sequence, the straining guidance, and the recovery bottleneck explanation.
            </p>
          </div>
          <a className="button primary" href="/workflow">
            Read the Workflow Article
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>

        <figure className="more-output-figure">
          <img
            src={workflowFlowImage}
            alt="Cold ethanol workflow showing centrifuge extraction, diaphragm pump transfer, straining, and return to the BLAST 240/45 chiller"
          />
        </figure>

        <div className="more-output-highlights">
          {moreOutputHighlights.map((item) => (
            <article key={item}>
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>

        <RelatedReading links={article.related} />
      </section>

      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}

export function ProcessOwnershipArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />

      <section className="section insight-article-body process-ownership-article">
        <article className="process-ownership-lede">
          <div>
            <p className="eyebrow">Core Idea</p>
            <h2>The extraction process is the business.</h2>
          </div>
          <div>
            <p>A lot of people misunderstand what it means to own an extraction lab.</p>
            <p>
              From the outside, it can look simple: buy extraction equipment, put it in a compliant lab, run material
              through the machine, make oil, sell the product. That version of the business sounds almost automatic, as
              if the equipment itself is the company.
            </p>
            <p>But that is not how real extraction works.</p>
          </div>
        </article>

        <figure className="process-ownership-figure">
          <img src="/images/generated/insights-process-ownership.svg" alt="Process ownership operating discipline visual" />
        </figure>

        <section className="process-ownership-section">
          <div>
            <p className="eyebrow">Where Value Lives</p>
            <h2>Real value is created in daily operation.</h2>
          </div>
          <div>
            <p>
              The equipment matters, of course. The facility matters. Compliance matters. But none of those things
              create a successful operation by themselves.
            </p>
            <p>
              The real value is created in how the lab is operated every day: how material is prepared, how runs are
              managed, how temperature is controlled, how solvent is recovered, how throughput is improved, how losses
              are reduced, how quality is protected, and how repeatable the entire process becomes.
            </p>
            <p>That is where the business actually lives.</p>
          </div>
        </section>

        <section className="process-ownership-map" aria-label="Extraction process ownership operating areas">
          <div className="process-map-center">
            <span>Operating</span>
            <strong>Discipline</strong>
          </div>
          {processOwnershipDrivers.map((driver) => (
            <span className="process-map-chip" key={driver}>
              {driver}
            </span>
          ))}
        </section>

        <section className="process-ownership-section">
          <div>
            <p className="eyebrow">Compounding Advantage</p>
            <h2>Small improvements inside the process become major advantages.</h2>
          </div>
          <div>
            <p>
              Owning an extraction lab means mastering the discipline of extraction itself. It means understanding every
              detail that affects yield, quality, consistency, labor, downtime, recovery speed, energy use, and
              scalability.
            </p>
            <p>
              Small improvements inside the process can become major advantages over time. A few percentage points of
              better yield, a faster recovery cycle, cleaner workflow, fewer failed batches, or more consistent output
              can be the difference between a lab that survives and a lab that leads its market.
            </p>
          </div>
        </section>

        <blockquote className="process-pullquote">
          <p>Extraction is not a button you press. It is a system you build.</p>
        </blockquote>

        <section className="process-ownership-section">
          <div>
            <p className="eyebrow">The Competitive Gap</p>
            <h2>Two labs can buy similar equipment and get very different results.</h2>
          </div>
          <div>
            <p>This is also where competition happens.</p>
            <p>
              Two companies can buy similar equipment and build similar rooms, but they will not get the same results.
              One lab may struggle with bottlenecks, inconsistent product, and constant troubleshooting. Another may run
              with discipline, predictable output, and a clear path to higher volume.
            </p>
            <p>The difference is not just the hardware. The difference is the operating knowledge behind the hardware.</p>
          </div>
        </section>

        <section className="process-lab-compare" aria-label="Extraction lab operating comparison">
          {processLabComparison.map((lab) => (
            <article key={lab.title}>
              <h3>{lab.title}</h3>
              <ul>
                {lab.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="process-ownership-section">
          <div>
            <p className="eyebrow">The Restaurant Comparison</p>
            <h2>The equipment is the kitchen. The process is the cuisine.</h2>
          </div>
          <div>
            <p>A good comparison is a restaurant.</p>
            <p>
              Nobody opens a restaurant, buys the most expensive kitchen equipment, and assumes the food will cook
              itself. A great kitchen needs more than ovens, ranges, refrigerators, and prep tables. It needs a chef who
              understands the menu, ingredients, timing, technique, consistency, and presentation. It needs a trained
              team that can execute that standard every day, even under pressure.
            </p>
            <p>An extraction lab is no different.</p>
            <p>
              The equipment is the kitchen. The process is the cuisine. The operators, managers, and technical leaders
              are the people who turn raw inputs into a high-quality, repeatable product. Without that expertise, even
              the best equipment becomes underused, misused, or wasted.
            </p>
          </div>
        </section>

        <section className="process-ownership-section process-ownership-dark">
          <div>
            <p className="eyebrow">Scaling Is Process Control</p>
            <h2>Scaling is not just buying a bigger machine.</h2>
          </div>
          <div>
            <p>
              The labs that succeed long term are the ones that stop thinking of extraction as a simple production step
              and start treating it as the core business discipline.
            </p>
            <p>
              They know that scaling is not just buying a bigger machine. Scaling means building a process that can
              handle more volume without losing control. It means creating systems that produce the same high-quality
              result again and again, with less waste, less downtime, and more confidence.
            </p>
            <p>That is what separates serious operators from everyone else.</p>
          </div>
        </section>

        <div className="process-takeaways">
          {processTakeaways.map((item) => (
            <article key={item.title}>
              <CheckCircle2 size={22} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <section className="process-closing">
          <p>
            The future of extraction will not belong only to the companies with the most expensive equipment. It will
            belong to the companies that understand the process better, execute it more consistently, and keep improving
            it over time.
          </p>
          <p>Owning an extraction lab is not just owning machines.</p>
          <h2>It is owning the craft, the system, and the discipline of extraction. That is the business.</h2>
        </section>

        <RelatedReading links={article.related} />
      </section>

      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}

export function Minus40ArticlePage({ article }) {
  return (
    <main className="site-shell insight-article-page">
      <InsightsHeader />
      <ArticleHero article={article} />

      <section className="section insight-article-body minus-40-article">
        <article className="minus-40-hook">
          <figure className="minus-40-battle-figure">
            <img
              src="/images/generated/minus-40-unit-truce.svg"
              alt="Funny illustration of imperial and metric temperature scales ending their debate at minus forty degrees"
            />
          </figure>
          <div>
            <p className="eyebrow">The unit-system ceasefire</p>
            <p>
              Americans and the rest of the planet can keep fighting over inches, centimeters, miles, kilometers,
              gallons, liters, and whether 72°F sounds pleasant or like someone forgot to translate the weather. Celsius
              definitely has the cleaner résumé: water freezes at 0°C and boils at 100°C, which makes sense in a “humans
              designed this on purpose” kind of way. Fahrenheit, meanwhile, feels more like it was built around vibes:
              32°F is when your driveway becomes a lawsuit, 100°F is when everyone starts questioning their life choices,
              and somewhere below that, your face stops participating. But when the thermometer drops far enough, even
              America and the metric world have to put down their rulers, stop yelling across the table, and admit they
              finally landed on the same icy punchline.
            </p>
          </div>
        </article>

        <article className="minus-40-lede">
          <div>
            <p className="eyebrow">The rare overlap</p>
            <h2>At −40, Celsius and Fahrenheit finally agree.</h2>
          </div>
          <div>
            <p>
              Temperature conversion usually feels messy. A comfortable room is about 20°C, which is 68°F. Water
              freezes at 0°C, which is 32°F. Water boils at 100°C, which is 212°F. The two scales almost never show the
              same number.
            </p>
            <p>
              But at −40, something unexpected happens: <strong>−40 °C is exactly −40 °F.</strong> It’s the one
              temperature where both systems meet, which makes it feel like a little mathematical magic was left for us
              in the cold.
            </p>
          </div>
        </article>

        <figure className="minus-40-figure">
          <img
            src="/images/generated/minus-40-temperature-curves.svg"
            alt="Celsius and Fahrenheit conversion lines crossing at minus forty"
          />
        </figure>

        <figure className="minus-40-figure">
          <img
            src="/images/generated/minus-40-why-diagram.svg"
            alt="Diagram explaining why Celsius and Fahrenheit meet at minus forty through scale size, offset, and convergence"
          />
        </figure>

        <div className="minus-40-fact-grid">
          {minus40Facts.map((fact) => (
            <article key={fact.label}>
              <p className="eyebrow">{fact.label}</p>
              <strong>{fact.value}</strong>
              <p>{fact.body}</p>
            </article>
          ))}
        </div>

        <blockquote className="minus-40-pullquote">
          <p>−40 is not a rounded marketing number. It is a real mathematical crossing between two temperature worlds.</p>
        </blockquote>

        <section className="minus-40-split">
          <div>
            <p className="eyebrow">Why it feels special</p>
            <h2>Science has lots of conversions. Very few give people a shared number this clean.</h2>
          </div>
          <div>
            <p>
              Unit conversions are everywhere in science and engineering: inches to millimeters, gallons to liters,
              horsepower to kilowatts, PSI to bar. Most conversions either multiply by a constant or shift by an offset,
              and the converted numbers usually stay different.
            </p>
            <p>
              The −40 temperature match is different. It is simple enough for any operator to remember, but it still
              comes from the underlying math of the scales. That combination is rare in day-to-day technical language:
              memorable, useful, exact, and not just a rounding trick.
            </p>
          </div>
        </section>

        <section className="minus-40-process-note">
          <div>
            <p className="eyebrow">Why Perma Cool talks about it</p>
            <h2>Cold ethanol extraction needs a temperature target everyone understands.</h2>
          </div>
          <div>
            <p>
              Perma Cool ethanol pre-chillers are built around pulling ethanol down into the deep-cold operating range
              used by extraction teams. When the target is −40, the number carries cleanly between Celsius and
              Fahrenheit. A spec sheet, a controller screen, a field note, and an operator conversation can all point to
              the same target without extra mental math.
            </p>
            <p>
              That matters because temperature control is not trivia in extraction. It affects workflow timing, solvent
              readiness, operator confidence, and repeatability from batch to batch.
            </p>
          </div>
        </section>

        <div className="minus-40-takeaways">
          {minus40Takeaways.map((item) => (
            <article key={item}>
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>

        <section className="minus-40-closing">
          <p>
            The fact that −40 °C and −40 °F are the same temperature does not make −40 cold by itself. The cold is real
            because of the process target. The special part is that two major measurement systems meet right there, at a
            number that is already important to ethanol chilling.
          </p>
          <h2>That makes −40 more than a setpoint. It is a rare place where math, science, and process language line up.</h2>
        </section>

        <RelatedReading links={article.related} />
      </section>

      <InsightCta cta={article.cta} />
      <InsightsFooter />
    </main>
  );
}
