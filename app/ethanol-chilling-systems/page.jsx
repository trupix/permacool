import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fan,
  Gauge,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  Zap
} from "lucide-react";

export const metadata = {
  title: "Ethanol Chilling Systems | Perma Cool",
  description:
    "Explore the PermaCool BLAST ethanol chiller lineup for direct refrigerant chilling, PLC visibility, and repeatable low-temperature extraction workflows."
};

const navItems = [
  ["Ethanol Chillers", "/ethanol-chilling-systems"],
  ["Butane Recovery", "/butane-recovery-system"],
  ["Insights", "/insights"],
  ["Contact", "/contact-us"]
];

const performancePoints = [
  "Target operation around -40°C for extraction-ready process windows.",
  "PLC + HMI visibility for monitoring and compressor protection.",
  "HVAC condenser integration for streamlined direct refrigerant architecture.",
  "Re-chill workflow designed for repeat extraction cycles instead of one-off batches."
];

const metrics = [
  {
    label: "Series 01",
    title: "BLAST™ 60/45",
    body: "Compact unit sized for 30-gallon centrifuge workflows and rapid room-temp to -40°C pull-down."
  },
  {
    label: "Series 02",
    title: "BLAST™ 150/45",
    body: "Production-ready configuration for up to 150-gallon process class applications."
  },
  {
    label: "Series 03",
    title: "BLAST™ 240",
    body: "Larger process-class option with the same direct refrigerant control philosophy."
  },
  {
    label: "Commercial Value",
    title: "Less Consumable Drag",
    body: "Replace recurring cryogenic supply complexity with electricity and planned maintenance."
  }
];

const products = [
  {
    eyebrow: "Compact Production",
    title: "BLAST™ 60/45 Ethanol Chiller",
    image: "/images/generated/blast60-component-01-temperature-sensor.png",
    href: "/ethanol-chiller-blast-60",
    copy:
      "Chills 60 gallons of ethanol from room temperature to -40°C in 45 minutes. Designed as the most compact unit in the current BLAST™ lineup.",
    meta: ["30-gallon centrifuge workflow", "60-gallon ethanol capacity", "45 minutes to -40°C"],
    bullets: [
      "Cascade-style architecture supporting strong low-temperature performance.",
      "Made for operators moving from small-batch chilling to real production cadence.",
      "Useful anchor page for component walk-throughs and ROI proof points."
    ]
  },
  {
    eyebrow: "Mid-Scale Production",
    title: "BLAST™ 150/45 Ethanol Chiller",
    image: "/images/generated/blast60-component-02-flux-box-wall.png",
    copy:
      "Chills 150 gallons of ethanol from room temperature to -40°C in 45 minutes. Built for up to 150-gallon process class applications.",
    meta: ["Up to 150-gallon class", "Direct refrigerant architecture", "PLC/HMI operational visibility"],
    bullets: [
      "Supports commercial production teams prioritizing throughput consistency.",
      "Pairs useful product-level claims with system-level education pages.",
      "Strong candidate for customer stories and lead-time messaging."
    ]
  },
  {
    eyebrow: "Large Process Class",
    title: "BLAST™ 240 Ethanol Chiller",
    image: "/images/generated/blast60-component-04-condensers.png",
    copy:
      "Designed for up to 240-gallon process class applications, with target low-temperature operation around -40°C depending on facility configuration.",
    meta: ["Up to 240-gallon class", "HVAC condenser integration", "Compressor protection logic"],
    bullets: [
      "Gives larger facilities a straightforward path to communicate fit and capacity.",
      "Ideal place to surface install requirements, utility needs, and service access.",
      "Built to connect buyer questions directly to quote-ready conversations."
    ]
  }
];

const switchReasons = [
  {
    icon: ShieldCheck,
    title: "Recurring spend shifts from supply chain to utility planning.",
    body: "Electric chilling reduces dependence on constant LN2 deliveries, storage handling, and supply disruptions."
  },
  {
    icon: RefreshCw,
    title: "Re-chill cycles protect cadence after extraction warms the solution.",
    body: "Operators spend less time improvising between runs and more time keeping production moving."
  },
  {
    icon: Cpu,
    title: "On-screen visibility helps standardize operation across shifts.",
    body: "PLC/HMI controls make temperature and protection logic easier to understand and repeat."
  },
  {
    icon: Gauge,
    title: "Direct refrigerant architecture stays legible for technical buyers.",
    body: "Facilities evaluating upgrades can more easily map performance claims to real plant constraints."
  }
];

export default function EthanolChillingSystemsPage() {
  return (
    <main className="site-shell ethanol-systems-page">
      <Header />
      <section className="ecs-hero">
        <Image
          src="/images/generated/ethanol-systems-hero.png"
          alt="Perma Cool ethanol chilling system in a clean industrial facility"
          fill
          priority
          className="ecs-hero-image"
          sizes="100vw"
        />
        <div className="ecs-hero-overlay" />
        <div className="ecs-hero-content">
          <p className="eyebrow">Direct Refrigerant Ethanol Chilling</p>
          <h1>BLAST™ pre-chiller systems built for on-demand cold ethanol.</h1>
          <p className="ecs-hero-lede">
            The PermaCool BLAST™ series is designed for labs that need fast pull-down from room temperature to
            approximately -40°C, repeated re-chill cycles, and a clearer path away from recurring liquid nitrogen
            spend.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/contact-us">
              Request lineup guidance
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/direct-refrigerant-vs-ln2">
              Compare against LN2
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="ecs-profile">
        <div className="ecs-profile-card">
          <span className="micro-label">Core Performance Profile</span>
          <h2>What buyers care about before they commit.</h2>
          <ul>
            {performancePoints.map((point, index) => (
              <li key={point}>
                {index === 0 ? <Snowflake size={20} /> : null}
                {index === 1 ? <Cpu size={20} /> : null}
                {index === 2 ? <Fan size={20} /> : null}
                {index === 3 ? <RefreshCw size={20} /> : null}
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ecs-metric-band">
        <div className="ecs-metrics">
          {metrics.map((item) => (
            <article className="ecs-metric" key={item.title}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section ecs-lineup">
        <div className="section-heading">
          <p className="eyebrow">BLAST™ Lineup</p>
          <h2>Pick the capacity class that fits today’s workflow and tomorrow’s run rate.</h2>
          <p>The page is built to support deeper spec tables, component diagrams, and media as the lineup grows.</p>
        </div>

        <div className="ecs-product-grid">
          {products.map((product) => (
            <article className="ecs-product-card" key={product.title}>
              <div className="ecs-product-media">
                <Image src={product.image} alt="" width={720} height={520} />
              </div>
              <div className="ecs-product-copy">
                <p className="pill">{product.eyebrow}</p>
                <h3>{product.title}</h3>
                <p>{product.copy}</p>
                <div className="ecs-product-meta">
                  {product.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <ul>
                  {product.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {product.href ? (
                  <a className="inline-link" href={product.href}>
                    View BLAST 60/45 page →
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section ecs-advantage">
        <div className="section-heading narrow">
          <p className="eyebrow">Why Teams Switch</p>
          <h2>Operational reasons buyers move away from consumable-heavy cooling.</h2>
        </div>
        <div className="ecs-feature-grid">
          {switchReasons.map(({ icon: Icon, title, body }) => (
            <article className="ecs-feature-card" key={title}>
              <Icon aria-hidden="true" size={24} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ecs-workflow">
        <div className="ecs-workflow-inner">
          <div>
            <p className="eyebrow">Workflow Story</p>
            <h2>Move the page from “cold equipment” to “operational advantage.”</h2>
          </div>
          <div className="ecs-workflow-copy">
            <p>
              The most persuasive ethanol chiller pages connect temperature claims to what the buyer actually feels:
              better throughput, better reuse of chilled ethanol, fewer supply interruptions, and clearer control over
              extraction rhythm.
            </p>
            <p>
              For operators still relying on consumables or slower legacy chilling, the BLAST™ lineup gives the buying
              conversation a cleaner frame: direct refrigerant chilling, practical capacity classes, and a system
              designed around repeatable production cadence.
            </p>
          </div>
        </div>
      </section>

      <section className="related-section ecs-related">
        <div>
          <p className="eyebrow">Next Step</p>
          <h2>Turn product interest into a better-fit recommendation.</h2>
          <p>Capture system interest, batch profile, and facility notes before pricing is discussed.</p>
        </div>
        <div className="related-actions">
          <a className="button primary" href="/contact-us">
            Request a quote
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="/cooling-system-design-checklist">
            Review design checklist
            <Zap size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <img className="brand-mark" src="/images/brand/perma-cool.png" alt="" />
        <img className="brand-wordmark" src="/images/brand/perma-cool-wordmark.png" alt="PermaCool" />
      </a>
      <nav aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <a href={href} key={label}>
            {label}
          </a>
        ))}
      </nav>
      <a className="header-phone" href="tel:+17472081001">
        <Phone size={18} aria-hidden="true" />
        <span>747.208.1001</span>
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <img src="/images/brand/perma-cool.png" alt="PermaCool" />
        <p>© 2026 Perma Cool Systems Inc.</p>
      </div>
      <div className="footer-actions">
        <a href="tel:+17472081001">
          <Phone size={17} aria-hidden="true" />
          747.208.1001
        </a>
        <a href="mailto:sales@perma.cool">
          <Mail size={17} aria-hidden="true" />
          sales@perma.cool
        </a>
      </div>
    </footer>
  );
}
