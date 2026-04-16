export const metadata = {
  title: "BLAST 60 Ethanol Chiller | Chill 60 Gallons to -40°C | PermaCool",
  description: "PermaCool BLAST 60 ethanol chiller is designed to chill up to 60 gallons toward -40°C with PLC/HMI visibility and direct refrigerant efficiency."
}

const mainHtml = "<p class=\"eyebrow\">BLAST™ Product Line</p>\n    <h1>BLAST 60 Ethanol Chiller</h1>\n    <p>\n      Built for extraction operators who need compact, production-ready chilling performance, the BLAST 60 class is engineered\n      for fast pull-down, low-temp stability, and reliable PLC-based control.\n    </p>\n\n    <h2>Cascade refrigeration design</h2>\n    <p>\n      The Blast 60/45 is a cascade unit, meaning it uses two compressors working together instead of forcing one oversized\n      system to do everything on its own.\n    </p>\n    <p>\n      The primary refrigeration circuit is what directly chills the ethanol.\n      The cascade refrigeration circuit cools the primary circuit, allowing the overall system to reach lower temperatures\n      and stronger chilling performance.\n      That two-stage approach lets the Blast 60 produce high-powered chilling while still using common-sized condensers\n      and widely serviceable components.\n    </p>\n\n    <h2>Highlights</h2>\n    <ul class=\"list\">\n      <li>Designed for up to 60-gallon process class applications</li>\n      <li>Target low-temp operation around -40°C (config/facility dependent)</li>\n      <li>Direct refrigerant architecture with HVAC condenser integration</li>\n      <li>PLC/HMI operational visibility and compressor protection logic</li>\n    </ul>\n\n    <div class=\"cta-row mt\">\n      <a class=\"btn\" href=\"/contact-us\">Request BLAST 60 Pricing</a>\n      <a class=\"btn btn-ghost\" href=\"/ethanol-chilling-systems\">Compare Chiller Options</a>\n    </div>\n\n    <section class=\"related card\">\n      <h3>Related reading</h3>\n      <p><a href=\"/direct-refrigerant-vs-ln2\">Direct Refrigerant vs LN2</a> • <a href=\"/industrial-process-chiller-maintenance\">Maintenance Guide</a></p>\n    </section>"
const stickyHtml = "<div class=\"inner\">\n      <p>Need lead time + pricing for BLAST 60?</p>\n      <a class=\"btn\" href=\"/contact-us\">Request Pricing</a>\n    </div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
