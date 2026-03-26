export const metadata = {
  title: 'Perma Cool Ethanol Pre-Chiller Workflow & Electric Advantage | PermaCool',
  description: 'Step-by-step look at the Perma Cool ethanol pre-chiller workflow, including rechill loops, biomass filtering, and the operational advantages of electric chilling over LN2.'
}

const mainHtml = `
  <section class="container section">
    <p class="eyebrow">PermaCool Insights</p>
    <h1>Perma Cool Ethanol Pre-Chiller Workflow</h1>
    <p class="lede">A practical walkthrough of how the ethanol pre-chiller fits into extraction, plus why electric chilling can outperform LN2-heavy workflows on cost, consistency, and day-to-day operations.</p>

    <h2><span class="icon-chip"><i data-lucide="workflow"></i></span>Step-by-step process</h2>
    <div class="feature-grid">
      <article class="card">
        <h3>1. Chill ethanol</h3>
        <p>Ethanol is brought down to roughly -40°C/-40°F before entering the extraction workflow.</p>
      </article>
      <article class="card">
        <h3>2. Pump into the centrifuge</h3>
        <p>The Perma Cool pump moves chilled ethanol into the centrifuge to begin the wash cycle.</p>
      </article>
      <article class="card">
        <h3>3. Process biomass</h3>
        <p>The centrifuge uses the chilled ethanol to process biomass under low-temperature conditions.</p>
      </article>
      <article class="card">
        <h3>4. Recover tincture solution</h3>
        <p>After extraction, the ethanol—now tincture solution—is spun out of the centrifuge.</p>
      </article>
      <article class="card">
        <h3>5. Pump the tincture out</h3>
        <p>A diaphragm pump transfers the tincture solution out of the centrifuge for the next stage.</p>
      </article>
      <article class="card">
        <h3>6. Filter biomass carryover</h3>
        <p>The solution passes through a biomass strainer to remove particles and help protect the chiller from contamination.</p>
      </article>
      <article class="card">
        <h3>7. Return and rechill</h3>
        <p>The tincture solution, often returning about 10°F warmer after extraction and transfer, cycles back to the chiller for fast recovery.</p>
      </article>
      <article class="card">
        <h3>8. Repeat to target ratio</h3>
        <p>The loop repeats until the desired ethanol-to-material ratio is reached, supporting larger biomass runs with reusable chilled ethanol.</p>
      </article>
    </div>

    <section class="trust-strip mt">
      <p><strong>Pro tip:</strong> Keeping biomass fines out of the return stream helps preserve chiller performance and supports more stable low-temp recovery between runs.</p>
    </section>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="zap"></i></span>Why electric chilling wins</h2>
    <div class="card">
      <h3>Cost savings</h3>
      <p>Electric chilling removes recurring LN2 consumable expense. For many operators, the savings stack up fast because the system is doing daily process work without depending on constant cryogenic deliveries.</p>
    </div>
    <div class="card mt">
      <h3>Workflow efficiency</h3>
      <ul class="list">
        <li>Previously extracted ethanol can be reused to improve process efficiency.</li>
        <li>Higher batch-volume chilling supports better throughput planning.</li>
        <li>Fast rechill after small temperature rise helps maintain consistent cycle times.</li>
      </ul>
    </div>
    <div class="card mt">
      <h3>Less operational hassle</h3>
      <p>Electric systems reduce dependence on deliveries, tank logistics, and supply interruptions that can otherwise slow or stop production.</p>
    </div>
    <div class="card mt">
      <h3>Safer day-to-day operation</h3>
      <p>Moving large-scale chilling duty away from LN2 can reduce handling risk for staff while simplifying the production environment.</p>
    </div>
    <div class="card mt">
      <h3>Better downstream concentration</h3>
      <p>More concentrated tincture means less ethanol per pound of material, which can reduce evaporation energy and shorten downstream processing time.</p>
    </div>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="bar-chart-3"></i></span>Bottom line</h2>
    <p>The Perma Cool ethanol pre-chiller workflow is built around reuse, rapid rechill, and repeatable low-temperature extraction. For facilities trying to scale without carrying LN2 inefficiency into every batch, electric chilling gives a cleaner path to stable production.</p>

    <section class="related card mt">
      <h3>Related reading</h3>
      <p><a href="/how-to-reduce-ln2-dependence">How to Reduce LN2 Dependence</a> • <a href="/ethanol-chilling-systems">Explore Ethanol Chillers</a></p>
    </section>

    <div class="cta-row mt">
      <a class="btn" href="/contact-us">Request a Quote</a>
      <a class="btn btn-ghost" href="/ethanol-chillers-direct-refrigerant-chilling-systems">View Chiller Solutions</a>
    </div>
  </section>
`

const stickyHtml = `<div class="inner"><p>Want to replace LN2-heavy ethanol chilling with a production-ready system?</p><a class="btn" href="/contact-us">Talk to PermaCool</a></div>`

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} />
    </>
  )
}
