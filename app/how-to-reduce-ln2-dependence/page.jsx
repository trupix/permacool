export const metadata = {
  title: "How to Reduce LN2 Dependence in Extraction Facilities | PermaCool",
  description: "A practical guide to reducing LN2 dependence in extraction with direct refrigerant ethanol chilling and better process control."
}

const mainHtml = "<p class=\"eyebrow\">PermaCool Insights</p>\n  <h1>How to Reduce LN2 Dependence in Extraction Facilities</h1>\n  <p>Teams reducing LN2 usage usually improve in three areas: recurring cost control, process stability, and throughput predictability.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"search\"></i></span>1) Audit current LN2 cost and process load</h2>\n  <p>Track monthly spend, chill times, and temperature variance by batch. This gives a baseline for evaluating alternatives.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"snowflake\"></i></span>2) Move core chilling duty to direct refrigerant</h2>\n  <p>Direct refrigerant ethanol chillers can handle daily process loads while reducing consumable dependency.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"activity\"></i></span>3) Standardize control and monitoring</h2>\n  <p>PLC/HMI visibility helps operators maintain repeatable temperature performance and reduce downtime events.</p>\n  <section class=\"related card\"><h3>Related reading</h3><p><a href=\"/direct-refrigerant-vs-ln2\">Direct Refrigerant vs LN2</a> • <a href=\"/extraction-cooling-system-design-checklist\">Design Checklist</a></p></section>\n  <div class=\"cta-row mt\"><a class=\"btn\" href=\"/contact-us\">Request a Transition Plan</a><a class=\"btn btn-ghost\" href=\"/ethanol-chilling-systems\">Explore Ethanol Chillers</a></div>"
const stickyHtml = "<div class=\"inner\"><p>Cutting LN2 spend this quarter?</p><a class=\"btn\" href=\"/contact-us\">Plan the Transition</a></div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
