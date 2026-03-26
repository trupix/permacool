export const metadata = {
  title: "Industrial Process Chiller Maintenance for Extraction | PermaCool",
  description: "Maintenance checklist for industrial extraction chillers to improve uptime, efficiency, and process temperature stability."
}

const mainHtml = "<p class=\"eyebrow\">PermaCool Insights</p>\n  <h1>Industrial Process Chiller Maintenance for Extraction</h1>\n  <p>Consistent maintenance protects throughput and reduces emergency downtime in extraction operations.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"calendar-days\"></i></span>Weekly checks</h2><p>Inspect temperatures, pressure trends, alarms, and visible leaks; verify pumps and circulation behavior.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"calendar-range\"></i></span>Monthly checks</h2><p>Review condenser cleanliness, electrical terminations, control logs, and alarm history for early warnings.</p>\n  <h2><span class=\"icon-chip\"><i data-lucide=\"shield-check\"></i></span>Quarterly checks</h2><p>Validate sensor calibration, inspect safety controls, and confirm performance under peak process load.</p>\n  <section class=\"related card\"><h3>Related reading</h3><p><a href=\"/ethanol-chiller-blast-150\">BLAST 150</a> • <a href=\"/insights\">All Insights</a></p></section>\n  <div class=\"cta-row mt\"><a class=\"btn\" href=\"/contact-us\">Schedule System Review</a><a class=\"btn btn-ghost\" href=\"/ethanol-chilling-systems\">See Chiller Systems</a></div>"
const stickyHtml = "<div class=\"inner\"><p>Protecting uptime on a high-duty system?</p><a class=\"btn\" href=\"/contact-us\">Request Service Guidance</a></div>"

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
