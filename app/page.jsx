import Image from "next/image";
import {
  ArrowRight,
  BadgeDollarSign,
  Factory,
  Gauge,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  ThermometerSnowflake
} from "lucide-react";
import LearningCenterSection from "./components/LearningCenterSection";
import { InsightsFooter, InsightsHeader } from "./insights/InsightsShell";

export const metadata = {
  title: "Perma Cool Ethanol Chillers & Butane Recovery Systems | Industrial Extraction Cooling",
  description:
    "Perma Cool builds industrial ethanol chilling systems and butane recovery solutions for extraction labs.",
  alternates: { canonical: "https://perma.cool/" }
};

const ethanolOverview = {
  title: "Ethanol Chilling Systems",
  body:
    "Direct refrigerant process chilling with HVAC condenser integration. Reach target process temperatures around −40 °C while reducing LN2 dependency and consumable spend.",
  href: "/ethanol-chilling-systems",
  image: "/images/generated/blast60-hero-most-accurate-outdoor-condensers.png",
  cta: "Explore Ethanol Chillers"
};

const blastSystems = [
  {
    title: "Ethanol Chilling Systems",
    body:
      "Direct refrigerant process chilling with HVAC condenser integration. Reach target process temperatures around −40 °C while reducing LN2 dependency and consumable spend.",
    href: "/ethanol-chilling-systems",
    image: "/images/generated/blast60-hero-most-accurate-outdoor-condensers.png",
    cta: "Explore Ethanol Chillers"
  },
  {
    title: "BLAST 60/45",
    body:
      "A compact cascade ethanol chiller built around the 30-gallon centrifuge workflow, 60 gallons of ethanol capacity, and fast recovery back toward −40 °C.",
    href: "/ethanol-chiller-blast-60",
    image: "/images/generated/blast60-bear-card.png",
    cta: "View BLAST 60/45"
  },
  {
    title: "BLAST 150/45",
    body:
      "Mid-scale production chilling for up to 150-gallon process class applications, with the same direct refrigerant control philosophy and PLC/HMI visibility.",
    href: "/ethanol-chiller-blast-150",
    image: "/images/generated/blast150-bear-card-purple.png",
    cta: "View BLAST 150/45"
  },
  {
    title: "BLAST 240/45",
    body:
      "Large process-class chilling for facilities that need more ethanol capacity, HVAC condenser integration, and a clearer path away from consumable-heavy cooling.",
    href: "/ethanol-chiller-blast-240",
    image: "/images/generated/blast240-bear-card.png",
    cta: "View BLAST 240/45"
  }
].filter((system) => system.title !== "Ethanol Chilling Systems");

const butaneRecovery = {
  title: "Butane Recovery",
  body:
    "Commercial BHO recovery systems planned around process control, cooling load, facility utilities, and production throughput.",
  href: "/butane-recovery-system",
  image: "/images/generated/bho-blast15-bear-card.png",
  cta: "Explore Butane Recovery"
};

const processSteps = [
  {
    icon: Snowflake,
    title: "Pull-down",
    body: "Rapid refrigerant pull-down to hit target extraction temperature windows."
  },
  {
    icon: RefreshCw,
    title: "Stabilize",
    body: "Repeatable chilling architecture helps operators recover between cycles instead of resetting the process."
  },
  {
    icon: Factory,
    title: "Produce",
    body: "Purpose-built systems support commercial extraction throughput with less consumable dependency."
  }
];

const switchReasons = [
  {
    icon: BadgeDollarSign,
    title: "Lower recurring costs",
    body: "Reduce dependence on liquid nitrogen deliveries and the operational surprises that come with consumables."
  },
  {
    icon: SlidersHorizontal,
    title: "Better process control",
    body: "PLC/HMI-driven chilling gives operators clearer visibility into pull-down, recovery, and repeat-cycle performance."
  },
  {
    icon: ShieldCheck,
    title: "Built for scale",
    body: "Equipment is planned around real extraction throughput instead of temporary workarounds that become bottlenecks."
  }
];

export default function HomePage() {
  return (
    <main className="site-shell home-page">
      <InsightsHeader />

      <section className="home-hero">
        <Image
          src="/images/generated/ethanol-systems-hero.png"
          alt=""
          fill
          priority
          className="home-hero-image"
          sizes="100vw"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="eyebrow">Industrial Extraction Cooling</p>
          <h1>Purpose built chillers for botanical plant extraction</h1>
          <p>
            Perma Cool systems are full turnkey chilling solutions for extraction labs looking to make more money,
            eliminate bottlenecks and outperform the competition.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/ethanol-chilling-systems">
              Explore Ethanol Chillers
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button butane" href="/butane-recovery-system">
              Explore Butane Recovery
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/contact-us">
              Request a Quote
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="home-proof-strip" aria-label="Perma Cool operating highlights">
        <article>
          <ThermometerSnowflake size={24} aria-hidden="true" />
          <strong>−40 °C</strong>
          <span>target process window</span>
        </article>
        <article>
          <Gauge size={24} aria-hidden="true" />
          <strong>PLC/HMI</strong>
          <span>operator visibility</span>
        </article>
        <article>
          <BadgeDollarSign size={24} aria-hidden="true" />
          <strong>LN2 + DRY ICE</strong>
          <span>Consumable Elimination</span>
        </article>
      </section>

      <section className="section home-systems-section">
        <div className="section-heading">
          <p className="eyebrow">Ethanol Extraction Chilling Systems</p>
          <h2>Ethanol extraction pre-chiller systems for distillate production</h2>
        </div>
        <div className="home-ethanol-layout">
          <article className="home-ethanol-overview">
            <a className="home-ethanol-overview-media" href={ethanolOverview.href} aria-label={ethanolOverview.title}>
              <Image src={ethanolOverview.image} alt="" width={900} height={540} />
            </a>
            <div className="home-ethanol-overview-copy">
              <p className="eyebrow">Category Overview</p>
              <h3>{ethanolOverview.title}</h3>
              <p>{ethanolOverview.body}</p>
              <a className="button primary" href={ethanolOverview.href}>
                {ethanolOverview.cta}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </article>
          <div className="home-blast-lineup">
            <div className="home-blast-heading">
              <p className="eyebrow">BLAST™ Lineup</p>
              <h3>Choose the production class that matches your extraction volume.</h3>
              <a className="inline-link home-blast-compare-link" href="/ethanol-chiller-comparison">
                Compare all three BLAST chillers
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="home-system-grid">
              {blastSystems.map((system) => (
                <article className="home-system-card" key={system.title}>
                  <a className="home-system-media" href={system.href} aria-label={system.title}>
                    <Image src={system.image} alt="" width={720} height={440} />
                  </a>
                  <div className="home-system-copy">
                    <h3>{system.title}</h3>
                    <p>{system.body}</p>
                    <a className="inline-link" href={system.href}>
                      {system.cta}
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-butane-section" aria-labelledby="home-butane-heading">
        <div className="home-butane-inner">
          <a className="home-butane-media" href={butaneRecovery.href} aria-label={butaneRecovery.title}>
            <Image src={butaneRecovery.image} alt="" width={720} height={440} />
          </a>
          <div className="home-butane-copy">
            <p className="eyebrow">Butane Recovery</p>
            <h2 id="home-butane-heading">Butane recovery systems for BHO production support.</h2>
            <p>{butaneRecovery.body}</p>
            <a className="button butane" href={butaneRecovery.href}>
              {butaneRecovery.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="home-process-section">
        <div className="section-heading narrow">
          <p className="eyebrow">Process Cooling Flow</p>
          <h2>From rapid pull-down to repeat-cycle production.</h2>
        </div>
        <div className="home-process-grid">
          {processSteps.map(({ icon: Icon, title, body }, index) => (
            <article className="home-process-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon size={25} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-ln2-section">
        <div>
          <p className="eyebrow">Why Operators Switch</p>
          <h2>Reduce consumable costs without giving up process control.</h2>
        </div>
        <div className="home-switch-grid">
          {switchReasons.map(({ icon: Icon, title, body }) => (
            <article className="home-switch-card" key={title}>
              <Icon size={24} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="home-ln2-card">
          <p>
            For many extraction teams, the buying decision is not just about getting cold. It is about replacing
            recurring LN2 spend, missed delivery risk, and inconsistent improvised workflows with a dedicated chilling
            platform.
          </p>
          <a className="button primary" href="/direct-refrigerant-vs-ln2">
            Compare Direct Refrigerant vs LN2
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <LearningCenterSection />

      <section className="related-section">
        <div>
          <p className="eyebrow">Build-Spec Quote</p>
          <h2>Need pricing fast? Tell us your extraction throughput.</h2>
        </div>
        <div className="related-actions">
          <a className="button primary" href="/contact-us">
            Request a Quote
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="tel:+17472081001">
            Talk to an Engineer
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <InsightsFooter />
    </main>
  );
}
