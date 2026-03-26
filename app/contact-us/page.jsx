export const metadata = {
  title: 'Request a Quote | PermaCool Extraction Cooling Systems',
  description: 'Contact PermaCool for ethanol chiller and butane recovery system pricing, lead times, and process-fit recommendations.'
}

export default function ContactPage() {
  return (
    <>
      <section className="container section">
        <h1><span className="icon-chip"><i data-lucide="clipboard-list"></i></span>Request a Quote</h1>
        <p>Share your extraction process goals and target throughput. We’ll help scope the right ethanol chiller or butane recovery configuration for your operation.</p>

        <form className="contact-form" action="/thank-you" method="get">
          <label>Name<input required type="text" name="name" autoComplete="name" /></label>
          <label>Email<input required type="email" name="email" autoComplete="email" /></label>
          <label>Company<input type="text" name="company" autoComplete="organization" /></label>
          <label>Phone<input type="tel" name="phone" autoComplete="tel" /></label>
          <label>Primary Interest
            <select name="interest">
              <option>Ethanol Chillers</option>
              <option>Butane Recovery Systems</option>
              <option>Both</option>
            </select>
          </label>
          <label>Current Cooling Method
            <select name="cooling_method">
              <option>LN2</option>
              <option>Direct Refrigerant</option>
              <option>Hybrid</option>
              <option>Other</option>
            </select>
          </label>
          <label>Target Process Temperature (°C)<input type="text" name="target_temp" placeholder="ex: -40°C" /></label>
          <label>Estimated Throughput<input type="text" name="throughput" placeholder="ex: 150 gallons / 45 min" /></label>
          <label>Message<textarea name="message" rows="6" placeholder="Facility constraints, timeline, and project goals"></textarea></label>
          <button className="btn" type="submit">Get My Quote</button>
        </form>

        <section className="trust-strip mt">
          <p><strong>What happens after you submit:</strong></p>
          <ul>
            <li>Fast qualification review by a PermaCool specialist</li>
            <li>Process-fit recommendation based on your goals</li>
            <li>Clear next-step quote path (not a generic brochure dump)</li>
          </ul>
        </section>
      </section>

      <div className="sticky-cta">
        <div className="inner">
          <p>Ready to scope your system? Share your throughput and target temp.</p>
          <a className="btn" href="tel:+17472081001">Call 747.208.1001</a>
        </div>
      </div>
    </>
  )
}
