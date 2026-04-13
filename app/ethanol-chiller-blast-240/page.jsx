export const metadata = {
  title: "BLAST 240 Ethanol Chiller | Chill 240 Gallons to -40°C | PermaCool",
  description: "PermaCool BLAST 240 ethanol chiller is designed to chill up to 240 gallons toward -40°C with PLC/HMI visibility and direct refrigerant efficiency."
}

const mainHtml = "<p class=\"eyebrow\">BLAST™ Product Line</p>\n    <h1>BLAST 240 Ethanol Chiller</h1>\n    <p>\n      Built for extraction operators who need high-capacity chilling performance, the BLAST 240 class is engineered\n      for fast pull-down, low-temp stability, and reliable PLC-based control at larger throughput levels.\n    </p>\n\n    <h2>Highlights</h2>\n    <ul class=\"list\">\n      <li>Designed for up to 240-gallon process class applications</li>\n      <li>Target low-temp operation around -40°C (config/facility dependent)</li>\n      <li>Direct refrigerant architecture with HVAC condenser integration</li>\n      <li>PLC/HMI operational visibility and compressor protection logic</li>\n    </ul>\n\n    <div class=\"cta-row mt\">\n      <a class=\"btn\" href=\"/contact-us\">Request BLAST 240 Pricing</a>\n      <a class=\"btn btn-ghost\" href=\"/ethanol-chilling-systems\">Compare Chiller Options</a>\n    </div>\n\n    <section class=\"related card\">\n      <h3>Related reading</h3>\n      <p><a href=\"/direct-refrigerant-vs-ln2\">Direct Refrigerant vs LN2</a> • <a href=\"/industrial-process-chiller-maintenance\">Maintenance Guide</a></p>\n    </section>"
const stickyHtml = "<div class=\"inner\">\n      <p>Need lead time + pricing for BLAST 240?</p>\n      <a class=\"btn\" href=\"/contact-us\">Request Pricing</a>\n    </div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
