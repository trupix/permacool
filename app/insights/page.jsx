export const metadata = {
  title: 'PermaCool Insights | Extraction Cooling Articles',
  description: 'Guides and technical insights on ethanol chillers, butane recovery, LN2 alternatives, and extraction cooling design.'
}

export default function InsightsPage() {
  return (
    <>
      <section className="container section">
        <p className="eyebrow">Knowledge Hub</p>
        <h1><span className="icon-chip"><i data-lucide="book-open"></i></span>PermaCool Insights</h1>
        <div className="feature-grid">
          <article className="card"><h3><span className="icon-chip"><i data-lucide="snowflake"></i></span>How to Reduce LN2 Dependence</h3><p>Steps to shift from consumable-heavy cooling to scalable operations.</p><a href="/how-to-reduce-ln2-dependence">Read article →</a></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="git-branch"></i></span>The Electric Advantage: Optimizing Extraction with the Perma Cool Ethanol Pre-Chiller</h3><p>Step-by-step extraction flow, lower LN2 dependence, and stronger operational efficiency.</p><a href="/permacool-ethanol-pre-chiller-workflow">Read article →</a></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="wrench"></i></span>Industrial Chiller Maintenance</h3><p>Practical upkeep guidance to protect uptime and process consistency.</p><a href="/industrial-process-chiller-maintenance">Read article →</a></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="clipboard-check"></i></span>Cooling System Design Checklist</h3><p>Define temp, throughput, controls, and utility constraints before buying.</p><a href="/extraction-cooling-system-design-checklist">Read article →</a></article>
          <article className="card"><h3><span className="icon-chip"><i data-lucide="scale"></i></span>Direct Refrigerant vs LN2</h3><p>Compare cost profile, control, and scale readiness.</p><a href="/direct-refrigerant-vs-ln2">Read article →</a></article>
        </div>
      </section>

      <div className="sticky-cta">
        <div className="inner">
          <p>Want a recommendation based on your facility profile?</p>
          <a className="btn" href="/contact-us">Talk to PermaCool</a>
        </div>
      </div>
    </>
  )
}
