import { ArrowRight, CheckCircle2, ClipboardList, Mail, Phone } from "lucide-react";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildPublicPageMetadata } from "../../lib/site";
import {
  allowedContactValue,
  buildContactSubmissionAction,
  contactIntentCopy,
  CONTACT_COOLING_METHODS,
  CONTACT_INTERESTS,
  CONTACT_PRODUCTS,
  CONTACT_REQUEST_TYPES,
  firstContactParam,
  normalizeContactField
} from "../../lib/contact";

export const metadata = buildPublicPageMetadata({
  path: "/contact-us",
  title: "Request a Quote | Perma Cool Extraction Cooling Systems",
  description:
    "Contact Perma Cool for ethanol chiller and butane recovery system pricing, lead times, and process-fit recommendations.",
  image: "/images/brand/permacool-social-card.jpg"
});

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const errorCode = firstContactParam(params?.error);
  const interest = allowedContactValue(params?.interest, CONTACT_INTERESTS);
  const coolingMethod = allowedContactValue(params?.cooling_method, CONTACT_COOLING_METHODS);
  const requestType = allowedContactValue(params?.request_type, CONTACT_REQUEST_TYPES, "Quote");
  const product = allowedContactValue(params?.product, CONTACT_PRODUCTS);
  const source = normalizeContactField(firstContactParam(params?.source), 120);
  const intentCopy = contactIntentCopy({ requestType, product });
  const formAction = buildContactSubmissionAction({ requestType, product, source });
  const errorMessage =
    errorCode === "invalid_submission"
      ? "Please enter a valid name, email address, and system interest."
      : errorCode === "too_many_requests"
        ? "We received several requests from this connection. Please wait a few minutes or call 747.208.1001."
        : errorCode === "submit_failed"
          ? "Something went wrong sending the form. Please try again or call 747.208.1001."
          : null;

  return (
    <main className="site-shell contact-page">
      <InsightsHeader />
      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">{intentCopy.eyebrow}</p>
          <h1>Tell us what your extraction cooling workflow needs to do.</h1>
          <p>
            Share your target temperature, throughput, and current cooling method. Perma Cool will use that information
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

        <form className="contact-form" action={formAction} method="post">
          <div className="contact-form-head">
            <ClipboardList size={24} aria-hidden="true" />
            <div>
              <h2>Contact - Perma Cool</h2>
              <p>{product || requestType !== "Quote" ? `${intentCopy.formTitle}. We will keep this context with your request.` : "We will get back to you right away — don't hesitate to call us."}</p>
            </div>
          </div>

          {errorMessage ? (
            <p className="form-alert" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <label className="contact-honeypot" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex="-1" autoComplete="off" />
          </label>

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
              <select name="interest" defaultValue={interest} required>
                <option value="" disabled>Select a system</option>
                <option>Ethanol Chillers</option>
                <option>Butane Recovery Systems</option>
                <option>Both</option>
              </select>
            </label>
            <label>
              Current Cooling Method
              <select name="cooling_method" defaultValue={coolingMethod}>
                <option value="">Select current method</option>
                <option>LN2</option>
                <option>Direct Refrigerant</option>
                <option>Hybrid</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Target Process Temperature (C)
              <input type="text" name="target_temp" placeholder="ex: −40 °C" />
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
            {intentCopy.buttonLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>

      <section className="contact-trust-strip">
        <div>
          <p className="eyebrow">What happens after you submit</p>
          <h2>A Perma Cool specialist reviews the process fit, not just the form.</h2>
        </div>
        <ul>
          <li>
            <CheckCircle2 size={18} aria-hidden="true" />
            Fast qualification review by a Perma Cool specialist.
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

    </main>
  );
}
