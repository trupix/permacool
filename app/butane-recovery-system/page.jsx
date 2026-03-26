export const metadata = {
  title: 'Butane Recovery Systems for BHO Extraction | PermaCool',
  description: 'PermaCool butane recovery systems support BHO extraction with Triple Split™ architecture, process cooling integration, and PLC-driven control.'
}

export default function ButaneRecoveryPage() {
  return (
    <>
      <section className="container section">
        <p className="eyebrow">BHO Extraction Recovery</p>
        <h1>Butane recovery systems designed for repeatable production</h1>
        <p>
          PermaCool recovery platforms combine HVAC-based cooling strategy, process-zone architecture, and centralized
          controls to support safe, efficient BHO extraction operations.
        </p>

        <h2>System advantages</h2>
        <ul className="list icon-list">
          <li><i data-lucide="git-branch-plus"></i> Triple Split™ architecture with dedicated process zones</li>
          <li><i data-lucide="repeat"></i> Integrated in-lab process heat exchange</li>
          <li><i data-lucide="activity"></i> PLC + HMI visibility for operational monitoring</li>
          <li><i data-lucide="shield-check"></i> Industrial components built for high duty-cycle operation</li>
        </ul>

        <img className="wide" src="https://perma.cool/wp-content/uploads/2023/01/butane-1-1024x561.png" alt="Butane recovery system for BHO extraction" />

        <h2 className="mt">Who this is for</h2>
        <p>
          Extraction teams moving from small-scale setups to commercial throughput, and operators seeking better process
          consistency, lower downtime risk, and stronger control over recovery performance.
        </p>

        <section className="trust-strip mt">
          <p><strong>Why buyers move forward:</strong> Recovery system recommendations are matched to process duty cycle and control expectations.</p>
          <ul>
            <li>Triple Split™ architecture for process-zone stability</li>
            <li>Operator-visible controls via PLC/HMI</li>
            <li>Deployment planning to reduce startup risk</li>
          </ul>
        </section>

        <div className="card mt"><h3>“Can we run this reliably at commercial pace?”</h3><p>Systems are engineered for high-duty production environments with monitoring and protection logic built into controls.</p></div>

        <div className="cta-row mt">
          <a className="btn" href="/contact-us">Get Recovery System Pricing</a>
          <a className="btn btn-ghost" href="/ethanol-chilling-systems">Compare Ethanol Chillers</a>
        </div>

        <section className="related card">
          <h3>Related reading</h3>
          <p><a href="/extraction-cooling-system-design-checklist">Cooling System Design Checklist</a> • <a href="/industrial-process-chiller-maintenance">Process Chiller Maintenance</a></p>
        </section>
      </section>

      <div className="sticky-cta">
        <div className="inner">
          <p>Want a butane recovery system fit assessment?</p>
          <a className="btn" href="/contact-us">Request System Fit Review</a>
        </div>
      </div>
    </>
  )
}
