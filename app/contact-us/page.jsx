import { ArrowRight, Mail, Phone } from "lucide-react";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "Contact PermaCool",
  description: "Contact Perma Cool Systems for ethanol chilling system guidance, pricing, and support."
};

export default function Page() {
  return (
    <main className="site-shell simple-page">
      <InsightsHeader />
      <section className="simple-page-hero">
        <p className="eyebrow">Contact</p>
        <h1>Talk to PermaCool about your cooling workflow.</h1>
        <p>
          Share the batch profile, target temperature, and current cooling method. The team can help map that to the
          right PermaCool system path.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="tel:+17472081001">
            <Phone size={18} aria-hidden="true" />
            Call 747.208.1001
          </a>
          <a className="button secondary light" href="mailto:sales@perma.cool">
            <Mail size={18} aria-hidden="true" />
            Email sales@perma.cool
          </a>
        </div>
      </section>
      <InsightsFooter />
    </main>
  );
}
