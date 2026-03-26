export const metadata = {
  title: "Direct Refrigerant Ethanol Chillers vs LN2 | PermaCool",
  description: "Compare direct refrigerant ethanol chillers vs LN2 cooling for extraction: operating cost, control, scalability, and long-term reliability."
}

const mainHtml = "<p class=\"eyebrow\">Extraction Cooling Guide</p>\n    <h1>Direct Refrigerant Ethanol Chillers vs. LN2</h1>\n    <p>\n      For many extraction teams, the core decision is no longer whether to chill, but how to chill efficiently at scale.\n      Direct refrigerant systems are increasingly preferred where long-term operating costs and process control matter.\n    </p>\n\n    <h2>Key comparison factors</h2>\n    <div class=\"feature-grid\">\n      <article class=\"card\"><h3><span class=\"icon-chip\"><i data-lucide=\"badge-dollar-sign\"></i></span>Recurring cost profile</h3><p>LN2 can carry continuous consumable spend. Direct refrigerant systems shift costs toward power + maintenance.</p></article>\n      <article class=\"card\"><h3><span class=\"icon-chip\"><i data-lucide=\"sliders-horizontal\"></i></span>Operational control</h3><p>PLC/HMI-based control can provide clearer visibility and more repeatable process behavior.</p></article>\n      <article class=\"card\"><h3><span class=\"icon-chip\"><i data-lucide=\"factory\"></i></span>Scale readiness</h3><p>Commercial facilities often prioritize systems that support stable throughput over ad-hoc cooling inputs.</p></article>\n      <article class=\"card\"><h3><span class=\"icon-chip\"><i data-lucide=\"network\"></i></span>System integration</h3><p>HVAC condenser integration supports streamlined process chilling architecture.</p></article>\n    </div>\n\n    <h2 class=\"mt\">When LN2 still makes sense</h2>\n    <p>\n      LN2 may still be useful in specific short-term, niche, or legacy workflows. But for sustained production,\n      many operators evaluate total annual cost and control consistency before committing.\n    </p>\n\n    <div class=\"cta-row mt\">\n      <a class=\"btn\" href=\"/contact-us\">Talk to an Engineer</a>\n      <a class=\"btn btn-ghost\" href=\"/ethanol-chiller-blast-150\">See BLAST 150</a>\n    </div>\n\n    <section class=\"related card\">\n      <h3>Related reading</h3>\n      <p><a href=\"/how-to-reduce-ln2-dependence\">How to Reduce LN2 Dependence</a> • <a href=\"/insights\">More Insights</a></p>\n    </section>"
const stickyHtml = "<div class=\"inner\">\n      <p>Need help modeling LN2 replacement economics?</p>\n      <a class=\"btn\" href=\"/contact-us\">Get a Cost Comparison Call</a>\n    </div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
