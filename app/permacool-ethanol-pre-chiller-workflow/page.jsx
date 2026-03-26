export const metadata = {
  title: 'The Electric Advantage: Optimizing Extraction with the Perma Cool Ethanol Pre-Chiller | PermaCool',
  description: 'Discover how the electric Perma Cool Ethanol Pre-Chiller improves extraction workflow, safety, reliability, and operating cost compared to liquid nitrogen systems.'
}

const mainHtml = `
  <section class="container section">
    <p class="eyebrow">PermaCool Insights</p>
    <h1>The Electric Advantage: Optimizing Extraction with the Perma Cool Ethanol Pre-Chiller</h1>
    <p class="lede">Discover how switching to the electric Perma Cool Ethanol Pre-Chiller streamlines your extraction workflow, enhances facility safety, and significantly lowers operational costs compared to liquid nitrogen systems.</p>

    <section class="card mt">
      <img src="/assets/images/insights/permacool-ethanol-pre-chiller-workflow.png" alt="Perma Cool ethanol pre-chiller extraction workflow diagram" style="width:100%;height:auto;border-radius:18px;display:block;" />
    </section>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="git-branch"></i></span>The 8-Step Extraction Process</h2>
    <div class="card">
      <p>The process begins by chilling up to 270 gallons of ethanol to -40°C/F, which is then pumped into the centrifuge to process the biomass. Once the extraction occurs, the resulting tincture solution is spun out and moved via a diaphragm pump through a biomass strainer to safely filter out particles.</p>
      <p class="mt">The filtered tincture, which naturally warms to around -30°F during extraction, returns to the Perma Cool chiller where it is rapidly re-chilled to -40°C/F. This cycle repeats until achieving a ratio of at least 2 lbs of material to 1 gallon of ethanol, allowing operators to process up to 440 lbs of biomass efficiently in a single tank.</p>
    </div>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="gauge"></i></span>Maximized Workflow Efficiency</h2>
    <div class="card">
      <p>Each gallon of ethanol can be used to extract at least two pounds of material, allowing previously used ethanol to be recycled for maximum efficiency. Re-washing material with extracted ethanol maintains the proper ratio for centrifuge operation while allowing larger batches to be chilled at once, accelerating overall throughput.</p>
      <p class="mt">The system provides highly consistent temperature control. Because the ethanol only needs to recover from a minor 10-degree temperature rise after an extraction cycle, the re-chilling process back to -40°C/F is exceptionally fast, keeping productivity high.</p>
    </div>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="badge-dollar-sign"></i></span>Unbeatable Cost Savings and Reliability</h2>
    <div class="card">
      <p>Transitioning from liquid nitrogen (LN2) to an electric system eliminates massive, ongoing consumable costs. Perma Cool units routinely pay for themselves within the first one to two months strictly through LN2 savings, long before factoring in the high cost of LN2 chillers themselves.</p>
      <p class="mt">Relying on electricity removes the extensive labor and downtime associated with LN2, which demands constant deliveries, heavy tank handling, and complex storage management. Eliminating these supply chain risks ensures that a missed delivery never halts your production line.</p>
    </div>

    <h2 class="mt"><span class="icon-chip"><i data-lucide="shield-check"></i></span>Enhanced Safety and Downstream Benefits</h2>
    <div class="card">
      <p>Liquid nitrogen remains one of the leading causes of laboratory accidents in the United States. By entirely removing LN2 from the large-scale chilling process, the Perma Cool system drastically minimizes safety risks for staff and mitigates environmental hazards.</p>
      <p class="mt">Operating the Perma Cool system also yields a highly concentrated tincture. Because the process uses less ethanol per pound of material, the downstream evaporation stage requires significantly less time and energy, streamlining the complete production cycle.</p>
    </div>

    <section class="related card mt">
      <h3>Related reading</h3>
      <p><a href="/ethanol-chilling-systems">Ethanol Chillers</a> • <a href="/how-to-reduce-ln2-dependence">How to Reduce LN2 Dependence</a> • <a href="/contact-us">Request a Quote</a></p>
    </section>

    <div class="cta-row mt">
      <a class="btn" href="https://perma.cool" target="_blank" rel="noreferrer">Upgrade your extraction workflow with the electric advantage today.</a>
      <a class="btn btn-ghost" href="/insights">Back to Insights</a>
    </div>
  </section>
`

const stickyHtml = `<div class="inner"><p>Ready to replace LN2-heavy chilling with a cleaner electric workflow?</p><a class="btn" href="https://perma.cool" target="_blank" rel="noreferrer">Explore PermaCool</a></div>`

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} />
    </>
  )
}
