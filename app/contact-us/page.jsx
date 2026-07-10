import { ArrowRight, CheckCircle2, ClipboardList, Mail, Phone } from "lucide-react";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  alternates: { canonical: "https://perma.cool/contact-us" },
  title: "Request a Quote | PermaCool Extraction Cooling Systems",
  description:
    "Contact PermaCool for ethanol chiller and butane recovery system pricing, lead times, and process-fit recommendations."
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "submit_failed";

  return (
    <main className="site-shell contact-page">
      <InsightsHeader />
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">Request a Quote</p>
          <h1>Tell us what your extraction cooling workflow needs to do.</h1>
          <p>
            Share your target temperature, throughput, and current cooling method. PermaCool will use that information
            to scope the right ethanol chiller or butane recovery configuration for your operation.
          </p>
          <div className="contact-direct-links">
            <a href="tel:+17472081001">
              <Phone size={18} aria-hidden="true" />
              747.208.1001
            </a>
            <a href="mailto:sales@perma.cool">
              <Mail size={18} aria-hidden="true" />
              sales@perma.cool
            </a>
          </div>
        </div>

        <form className="contact-form" action="/api/contact" method="post">
          <div className="contact-form-head">
            <ClipboardList size={24} aria-hidden="true" />
            <div>
              <h2>Contact - Perma Cool</h2>
              <p>We will get back to you right away - don't hesitate to call us</p>
            </div>
          </div>

          {hasError ? (
            <p className="form-alert" role="alert">
              Something went wrong sending the form. Please try again or call 747.208.1001.
            </p>
          ) : null}

          <div className="form-grid">
            <label>
              Name
              <input required type="text" name="name" autoComplete="name" />
            </label>
            <label>
              Email
              <input required type="email" name="email" autoComplete="email" />
            </label>
            <label>
              Company
              <input type="text" name="company" autoComplete="organization" />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" autoComplete="tel" />
            </label>
            <label>
              Primary Interest
              <select name="interest" defaultValue="Ethanol Chillers">
                <option>Ethanol Chillers</option>
                <option>Butane Recovery Systems</option>
                <option>Both</option>
              </select>
            </label>
            <label>
              Current Cooling Method
              <select name="cooling_method" defaultValue="LN2">
                <option>LN2</option>
                <option>Direct Refrigerant</option>
                <option>Hybrid</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Target Process Temperature (C)
              <input type="text" name="target_temp" placeholder="ex: -40 °C" />
            </label>
            <label>
              Estimated Throughput
              <input type="text" name="throughput" placeholder="ex: 150 gallons / 45 min" />
            </label>
          </div>

          <label>
            Message
            <textarea
              name="message"
              rows="6"
              placeholder="Facility constraints, timeline, current equipment, utility needs, and project goals"
            />
          </label>

          <button className="button primary contact-submit" type="submit">
            Get My Quote
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="contact-trust-strip">
        <div>
          <p className="eyebrow">What happens after you submit</p>
          <h2>A PermaCool specialist reviews the process fit, not just the form.</h2>
        </div>
        <ul>
          <li>
            <CheckCircle2 size={18} aria-hidden="true" />
            Fast qualification review by a PermaCool specialist.
          </li>
          <li>
            <CheckCircle2 size={18} aria-hidden="true" />
            Process-fit recommendation based on target temperature, capacity, and workflow.
          </li>
          <li>
            <CheckCircle2 size={18} aria-hidden="true" />
            Clear recommendations and next steps for pricing and system planning.
          </li>
        </ul>
      </section>

      <InsightsFooter />
    </main>
  );
}
