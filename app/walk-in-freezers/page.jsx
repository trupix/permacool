export const metadata = {
  title: "Redirecting… | PermaCool",
  description: "PermaCool"
}

const mainHtml = ""
const stickyHtml = ""

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: mainHtml }} />
      {stickyHtml ? <div className="sticky-cta" dangerouslySetInnerHTML={{ __html: stickyHtml }} /> : null}
    </>
  )
}
