export const metadata = {
  title: "Thank You | PermaCool",
  description: "Thanks for contacting PermaCool. Our team will follow up with recommendations and pricing."
}

const mainHtml = "<section class=\"card\">\n      <h1>Thanks — we got your request.</h1>\n      <p>A PermaCool specialist will review your submission and follow up with system-fit recommendations.</p>\n      <ul class=\"list\">\n        <li>Need immediate help? Call <a href=\"tel:+17472081001\">747.208.1001</a></li>\n        <li>Want to prep? Gather target temp, throughput, and current cooling method.</li>\n      </ul>\n      <div class=\"cta-row mt\">\n        <a class=\"btn\" href=\"/ethanol-chilling-systems\">Explore Ethanol Chillers</a>\n        <a class=\"btn btn-ghost\" href=\"/insights\">Read Insights</a>\n      </div>\n    </section>"
const stickyHtml = ""

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
