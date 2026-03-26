export const metadata = {
  title: 'Workflow | PermaCool Insights',
  description: 'Workflow overview for Perma Cool pre-ethanol chilling, including process steps, diagram support, and the operational advantages of electric chilling.'
}

export default function WorkflowPage() {
  return (
    <>
      <section className="container section">
        <p className="eyebrow">PermaCool Insights</p>
        <h1><span className="icon-chip"><i data-lucide="git-branch"></i></span>Workflow</h1>
        <p>
          Learn how the Perma Cool pre-ethanol chiller workflow can drastically increase extraction throughput while
          improving consistency, safety, and operating efficiency.
        </p>

        <section className="card mt">
          <h2>Diagram</h2>
          <img
            src="/assets/images/insights/workflow-diagram.png"
            alt="Perma Cool pre-ethanol chiller workflow diagram"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '18px',
              background: '#05080d'
            }}
          />
        </section>

        <section className="card mt">
          <h2><span className="icon-chip"><i data-lucide="snowflake"></i></span>Perma Cool Ethanol Pre-Chiller</h2>
          <p><strong>Step-by-Step Process &amp; The Electric Advantage</strong></p>

          <h3 className="mt">Step-by-Step Process for Using the Perma Cool Ethanol Pre-Chiller</h3>
          <div className="feature-grid">
            <article className="card">
              <h3>1. Chill Ethanol</h3>
              <p>Ethanol is chilled to -40°C/F.</p>
            </article>
            <article className="card">
              <h3>2. Pump Ethanol</h3>
              <p>The chilled ethanol is pumped by the Perma Cool pump to fill the centrifuge.</p>
            </article>
            <article className="card">
              <h3>3. Process Biomass</h3>
              <p>The centrifuge processes the biomass using the chilled ethanol.</p>
            </article>
            <article className="card">
              <h3>4. Extract Tincture Solution</h3>
              <p>The ethanol, now called the &quot;tincture solution,&quot; is spun out of the centrifuge.</p>
            </article>
            <article className="card">
              <h3>5. Pump Tincture Solution</h3>
              <p>A diaphragm pump moves the tincture solution out of the centrifuge.</p>
            </article>
            <article className="card">
              <h3>6. Filter Biomass</h3>
              <p>The tincture solution passes through a biomass strainer to filter out any biomass particles. Filtering the tincture solution helps protect the Perma Cool chiller from biomass contamination.</p>
            </article>
            <article className="card">
              <h3>7. Return and Rechill</h3>
              <p>The tincture solution, now typically around -30°F (10 degrees warmer due to the extraction, pumping, and filtering stages), returns to the Perma Cool chiller.</p>
            </article>
            <article className="card">
              <h3>8. Repeat</h3>
              <p>The tincture solution is re-chilled to -40°C/F to continue extraction. Repeat these steps until you reach at least a 2 lbs of material to 1 gallon of ethanol ratio, processing up to 440 lbs of biomass in your 270 gallon ethanol chilling tank.</p>
            </article>
          </div>

          <section className="trust-strip mt">
            <p><strong>Pro Tip:</strong> By following these steps, you ensure efficient and consistent extraction using the Perma Cool Ethanol Pre-Chiller.</p>
          </section>

          <h3 className="mt">Advantages of Using Electricity with the Perma Cool Ethanol Pre-Chiller</h3>
          <p>Switching from liquid nitrogen (LN2) to electricity with the Perma Cool Ethanol Pre-Chiller delivers major benefits in cost, efficiency, safety, and reliability.</p>

          <div className="card mt">
            <h3>Cost Savings</h3>
            <ul className="list">
              <li>Electricity is significantly more economical than LN2, eliminating ongoing consumable costs.</li>
              <li>The Perma Cool units often pay for themselves within the first one to two months through LN2 savings alone—before factoring in the cost of LN2 chillers themselves.</li>
            </ul>
          </div>

          <div className="card mt">
            <h3>Workflow Efficiency</h3>
            <ul className="list">
              <li><strong>Extraction Efficiency:</strong> Each gallon of ethanol can be used to extract at least two pounds of material. Ethanol that has already gone through extraction can be reused, maximizing efficiency.</li>
              <li><strong>Optimized Ethanol Usage:</strong> Re-washing material with previously extracted ethanol maintains the proper ethanol-to-material ratio for centrifuge operation, while also allowing larger ethanol batches to be chilled at once. This speeds up overall throughput.</li>
              <li><strong>Consistent Temperature Control:</strong> The system quickly rechills ethanol back to -40°C/°F after extraction. Because the ethanol only needs to be cooled from a small temperature rise, chilling is faster, and overall productivity is higher.</li>
            </ul>
          </div>

          <div className="card mt">
            <h3>Reduced Labor and Hassle</h3>
            <ul className="list">
              <li>LN2 requires constant deliveries, tank handling, and storage management. A missed delivery or supply shortage can halt production.</li>
              <li>Electricity removes these issues, reducing labor hours and eliminating supply chain risks.</li>
            </ul>
          </div>

          <div className="card mt">
            <h3>Safety</h3>
            <ul className="list">
              <li>LN2 is one of the leading causes of laboratory accidents in the United States.</li>
              <li>By removing LN2 from the large-scale chilling process, the Perma Cool system minimizes safety risks for staff and reduces environmental hazards.</li>
            </ul>
          </div>

          <div className="card mt">
            <h3>Additional Advantage: Concentrated Tincture</h3>
            <ul className="list">
              <li>A higher-saturation ethanol tincture also improves downstream efficiency.</li>
              <li>With less ethanol per pound of material, evaporation requires less energy and time, further streamlining production.</li>
            </ul>
          </div>

          <div className="card mt">
            <h3>Summary</h3>
            <p>Using electricity with the Perma Cool Ethanol Pre-Chiller lowers costs, increases workflow efficiency, enhances safety, and simplifies operations. The result is faster processing, higher productivity, and a safer, more reliable extraction environment.</p>
          </div>
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
