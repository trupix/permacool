export const metadata = {
  title: "Extraction Cooling System Design Checklist | PermaCool",
  description: "Use this extraction cooling design checklist to align throughput, temperature targets, controls, and facility constraints."
}

const mainHtml = "<p class=\"eyebrow\">PermaCool Insights</p>\n  <h1>Extraction Cooling System Design Checklist</h1>\n  <p>Before selecting equipment, define process requirements so your system matches real production demand.</p>\n  <h2>Checklist</h2>\n  <ul class=\"list icon-list\">\n    <li><i data-lucide=\"thermometer-snowflake\"></i> Target process temperature (e.g., around -40°C)</li>\n    <li><i data-lucide=\"timer\"></i> Required pull-down time and batch cadence</li>\n    <li><i data-lucide=\"building-2\"></i> Facility utilities and condenser placement constraints</li>\n    <li><i data-lucide=\"monitor-cog\"></i> Control requirements (PLC/HMI, alarms, visibility)</li>\n    <li><i data-lucide=\"trending-up\"></i> Future scale plan for added throughput</li>\n  </ul>\n  <section class=\"related card\"><h3>Related reading</h3><p><a href=\"/how-to-reduce-ln2-dependence\">Reduce LN2 Dependence</a> • <a href=\"/direct-refrigerant-vs-ln2\">Direct Refrigerant vs LN2</a></p></section>\n  <div class=\"cta-row mt\"><a class=\"btn\" href=\"/contact-us\">Get a Design Consultation</a><a class=\"btn btn-ghost\" href=\"/direct-refrigerant-vs-ln2\">Compare Cooling Approaches</a></div>"
const stickyHtml = "<div class=\"inner\"><p>Need help sizing your cooling architecture?</p><a class=\"btn\" href=\"/contact-us\">Book a Design Call</a></div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
