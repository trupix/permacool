import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "Thank You | PermaCool",
  description: "Thanks for contacting PermaCool. Our team will follow up with recommendations and pricing.",
  robots: {
    index: false,
    follow: false
  }
};

export default function Page() {
  return (
    <main className="site-shell thank-page">
      <InsightsHeader />
      <section className="thank-hero">
        <div className="thank-card">
          <CheckCircle2 size={34} aria-hidden="true" />
          <p className="eyebrow">Request Received</p>
          <h1>Thanks. We got your request.</h1>
          <p>
            A PermaCool specialist will review your submission and follow up with system-fit recommendations, pricing
            direction, and practical next steps.
          </p>
          <ul>
            <li>Gather your target process temperature and throughput notes.</li>
            <li>Have current cooling method details ready if you want a faster comparison.</li>
            <li>Need immediate help? Call 747.208.1001.</li>
          </ul>
          <div className="hero-actions">
            <a className="button primary" href="/ethanol-chilling-systems">
              Explore Ethanol Chillers
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary light" href="tel:+17472081001">
              <Phone size={18} aria-hidden="true" />
              Call Now
            </a>
          </div>
        </div>
      </section>
      <InsightsFooter />
    </main>
  );
}
