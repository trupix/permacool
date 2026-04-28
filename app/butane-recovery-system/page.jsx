import { ArrowRight } from "lucide-react";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "Butane Recovery System | PermaCool",
  description: "Perma Cool butane recovery system information and contact path."
};

export default function Page() {
  return (
    <main className="site-shell simple-page">
      <InsightsHeader />
      <section className="simple-page-hero">
        <p className="eyebrow">Butane Recovery</p>
        <h1>Butane recovery systems built around practical production support.</h1>
        <p>
          This route is ready for the full butane recovery page content. For now it keeps navigation live and points
          buyers toward the PermaCool contact path.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Talk to PermaCool
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="/insights">
            View Insights
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
      <InsightsFooter />
    </main>
  );
}
