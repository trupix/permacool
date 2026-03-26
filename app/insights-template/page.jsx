export const metadata = {
  title: "[Article Title] | PermaCool Insights",
  description: "[150-160 char summary with primary keyword]"
}

const mainHtml = "<p class=\"eyebrow\">PermaCool Insights</p>\n    <h1>[Article H1]</h1>\n    <p class=\"muted\">Published: [YYYY-MM-DD] • Reading time: [X min]</p>\n\n    <h2>Intro</h2>\n    <p>[Lead paragraph with primary keyword and user intent.]</p>\n\n    <h2>[Section Heading with secondary keyword]</h2>\n    <p>[Body copy]</p>\n\n    <h2>FAQ</h2>\n    <div class=\"card\"><h3>[Question 1]</h3><p>[Answer 1]</p></div>\n    <div class=\"card\"><h3>[Question 2]</h3><p>[Answer 2]</p></div>\n\n    <div class=\"cta-row mt\">\n      <a class=\"btn\" href=\"/contact-us\">Request a Quote</a>\n      <a class=\"btn btn-ghost\" href=\"/ethanol-chilling-systems\">Explore Systems</a>\n    </div>"
const stickyHtml = ""

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
