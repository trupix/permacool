export const metadata = {
  title: 'Workflow | PermaCool Insights',
  description: 'Workflow overview for Perma Cool pre-ethanol chilling, including diagram placement and supporting process copy.'
}

export default function WorkflowPage() {
  return (
    <>
      <section className="container section">
        <p className="eyebrow">PermaCool Insights</p>
        <h1><span className="icon-chip"><i data-lucide="git-branch"></i></span>Workflow</h1>
        <p>
          Explore how the Perma Cool pre-ethanol chiller workflow can support faster, more consistent extraction
          throughput across production runs.
        </p>

        <section className="card mt">
          <h2>Diagram</h2>
          <div
            style={{
              minHeight: '280px',
              border: '1px dashed rgba(151, 201, 255, 0.35)',
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(9, 16, 26, 0.45)',
              color: 'rgba(220, 235, 255, 0.72)',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            Diagram placeholder — drop workflow graphic here
          </div>
        </section>

        <section className="card mt">
          <h2>Body Text</h2>
          <p>
            Body copy placeholder. Add the workflow explanation, process steps, throughput notes, and supporting
            technical detail here.
          </p>
        </section>
      </section>

      <div className="sticky-cta">
        <div className="inner">
          <p>Want help matching a workflow to your extraction process?</p>
          <a className="btn" href="/contact-us">Talk to PermaCool</a>
        </div>
      </div>
    </>
  )
}
