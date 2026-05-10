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
  Wrench,
  Zap
} from "lucide-react";
import LearningCenterSection from "./components/LearningCenterSection";
import { InsightsHeader } from "./insights/InsightsShell";

const heroStats = [
  {
    label: "30",
    unit: "gallon",
    text: "centrifuge workflow or 2x 15 gallon",
    image: "/images/product/blast-60-centrifuge-icon.jpg"
  },
  {
    label: "60",
    unit: "gallon",
    text: "ethanol capacity",
    image: "/images/product/blast-60-capacity-icon.jpg"
  },
  {
    label: "45",
    unit: "Minutes",
    text: "to -40°C",
    image: "/images/product/blast-60-cold-icon.jpg"
  }
];

const valueProps = [
  {
    title: "Built smart, cascade design",
    icon: Snowflake,
    body:
      "The BLAST™ 60/45 is the most compact unit in the BLAST™ lineup and the only model built around Perma Cool’s cascade-style architecture, combining strong low-temperature performance with long-term serviceability.",
    link: "More →"
  },
  {
    title: "Production-ready workflow",
    icon: RefreshCw,
    body:
      "It replaces consumables and slower legacy chilling methods with a production-ready system sized for the ideal 30-gallon centrifuge workflow.",
    link: "workflow explained →"
  },
  {
    title: "Fast return on value",
    icon: Gauge,
    body:
      "For many operators, the 60/45 hits the sweet spot, real production capacity, smarter workflow, and a system that can often pay for itself within the first few months of operation."
  }
];

const components = [
  {
    eyebrow: "Component 01",
    title: "Ethanol Chilling Platform",
    image: "/images/generated/blast60-component-01-temperature-sensor.png",
    alt: "Labeled Perma Cool BLAST 60/45 ethanol chilling platform diagram",
    body:
      "This is the main process-side assembly of the BLAST™ 60/45, combining the tank, circulation hardware, and heat-transfer components into the core chilling package."
  },
  {
    eyebrow: "Component 02",
    title: "Flux Box",
    image: "/images/generated/blast60-component-02-flux-box-wall.png",
    alt: "Wall-mounted Perma Cool BLAST 60/45 flux box heat exchanger",
    body:
      "The flux box is part of the cascade side of the chiller and is specific to the BLAST™ 60/45. This component allows the secondary chiller to cascade the primary chiller, supporting the two-stage refrigeration design that gives the 60/45 its stronger low-temperature performance."
  },
  {
    eyebrow: "Component 03",
    title: "PLC Control System",
    image: "/images/generated/blast60-component-03-plc-control-system.png",
    alt: "Wall-mounted Perma Cool BLAST 60/45 PLC control system cabinet",
    body:
      "This is the PLC control system for the BLAST™ 60/45, giving operators centralized control and visibility over chiller operation. It supports the system’s monitoring, logic, and control functions so operators can manage process performance with clearer feedback and more consistent operation."
  },
  {
    eyebrow: "Component 04",
    title: "Condensers",
    image: "/images/generated/blast60-component-04-condensers.png",
    alt: "Two outdoor Perma Cool BLAST 60/45 condenser units",
    body:
      "These are the two condensers that come with the BLAST™ 60/45 system. Each condenser is rated at six horsepower, giving the unit the condenser capacity needed to support the cascade refrigeration design."
  }
];

const cascadeBenefits = [
  {
    title: "Better low-temp performance",
    body:
      "The cascade setup allows the machine to push colder and work harder than a simple single-stage setup in the same class."
  },
  {
    title: "Common parts, easier service",
    body: "Because it relies on more standard component sizing instead of rare oversized hardware, it is:",
    bullets: ["easier to diagnose", "easier to repair", "cheaper to repair", "easier to keep running long-term"]
  },
  {
    title: "Long life / maintainability",
    body: "This is huge. It is easy to keep these going forever.",
    bullets: [
      "built for long-term serviceability",
      "designed around repairable common components",
      "easier to maintain over the life of the machine",
      "avoids dependence on exotic hard-to-source oversized parts"
    ]
  }
];

const highlights = [
  "Designed for up to 60-gallon process class applications",
  "Target low-temp operation around -40°C (config/facility dependent)",
  "Direct refrigerant architecture with HVAC condenser integration",
  "PLC/HMI operational visibility and compressor protection logic"
];

const roiBullets = [
  "Reduces dependence on recurring consumables",
  "Supports faster re-chill and repeat-cycle extraction",
  "Built around serviceable, common-sized components for lower long-term ownership cost"
];

export default function Blast60Page() {
  return (
    <main className="site-shell">
      <InsightsHeader />
      <Hero />
      <section className="stat-rail" aria-label="BLAST 60/45 quick specifications">
        {heroStats.map((item) => (
          <article className="stat-card" key={item.text}>
            <Image src={item.image} alt="" width={96} height={96} />
            <div>
              <strong>{item.label}</strong>
              <span>{item.unit}</span>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>
      <ValueProps />
      <Components />
      <CascadeDesign />
      <CentrifugePairing />
      <HighlightsAndRoi />
      <LearningCenterSection />
      <RelatedCta />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero">
      <Image
        src="/images/generated/blast60-hero-most-accurate-outdoor-condensers.png"
        alt="Industrial ethanol chilling platform in a clean production facility"
        fill
        priority
        className="hero-image"
        sizes="100vw"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">BLAST™ Product Line</p>
        <h1>BLAST™ 60/45 Ethanol Chiller</h1>
        <p className="hero-lede">Chill 60 gallons of ethanol from room temperature to -40°C in 45 minutes.</p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Request lead time + pricing
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary" href="#components">
            View components
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  return (
    <section className="section value-section">
      <div className="section-heading">
        <p className="eyebrow">Production Fit</p>
        <h2>Compact capacity with a real extraction workflow behind it.</h2>
      </div>
      <div className="value-grid">
        {valueProps.map(({ title, icon: Icon, body, link }) => (
          <article className="value-card" key={title}>
            <Icon aria-hidden="true" size={26} />
            <h3>{title}</h3>
            <p>{body}</p>
            {link ? <span className="inline-link">{link}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Components() {
  return (
    <section className="section component-section" id="components">
      <div className="section-heading narrow">
        <p className="eyebrow">Component Overview</p>
        <h2>BLAST™ 60/45 Component Walkthrough</h2>
        <p>A quick visual walkthrough of the major BLAST™ 60/45 components.</p>
      </div>
      <div className="component-grid">
        {components.map((item) => (
          <article className="component-card" key={item.title}>
            <div className="component-media">
              <Image src={item.image} alt={item.alt} width={720} height={520} />
            </div>
            <div className="component-copy">
              <p className="eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CascadeDesign() {
  return (
    <section className="section cascade-section">
      <div className="cascade-layout">
        <div className="cascade-copy">
          <p className="eyebrow">Cascade Refrigeration Design</p>
          <h2>Dual-stage architecture designed around lower temperatures and better serviceability.</h2>
          <p>
            The BLAST™ 60/45 is built around Perma Cool’s dual-stage cascade architecture, using two smaller,
            more common-sized refrigeration stages instead of one oversized unit. The primary refrigeration
            circuit directly chills the ethanol, while the cascade refrigeration circuit cools the primary
            circuit so the system can reach lower temperatures with efficient, consistent pull-down.
          </p>
          <p>
            That two-stage design gives the BLAST™ 60/45 strong low-temperature performance while keeping the
            system built around more serviceable, widely available components. The result is easier parts
            sourcing, lower service cost, and a machine that is simpler to maintain in real production use.
          </p>
        </div>
        <figure className="diagram-frame">
          <Image
            src="/images/generated/cascade-refrigerant-flow-ethanol-labels.png"
            alt="Photo-based refrigerant pipe flow diagram for the BLAST 60/45 cascade system"
            width={1536}
            height={1024}
          />
        </figure>
      </div>

      <div className="benefit-row">
        <h3>Why that matters in the field</h3>
        <div className="benefit-grid">
          {cascadeBenefits.map((item, index) => (
            <article className="benefit-card" key={item.title}>
              <span>{index + 1}.</span>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
              {item.bullets ? (
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CentrifugePairing() {
  return (
    <section className="section workflow-section">
      <div className="section-heading narrow">
        <p className="eyebrow">Built for better centrifuge pairing</p>
        <h2>60 gallons gives a 30-gallon centrifuge the reserve it needs.</h2>
      </div>
      <figure className="workflow-visual">
        <Image
          src="/images/generated/workflow-banner.png"
          alt="Visual workflow showing a centrifuge paired with a chilled ethanol tank"
          width={1792}
          height={768}
        />
      </figure>
      <div className="workflow-copy">
        <p>
          Perma Cool’s legacy ACP-30 put more than 200 units into the field and proved the value of dedicated
          ethanol pre-chilling. But at roughly 40 gallons, it was sized more for basic single-pass centrifuge
          support than for the most efficient repeat-cycle workflow.
        </p>
        <p>The ideal approach is to pair your ethanol tank at about 2x the capacity of your centrifuge.</p>
        <div className="ratio-callout">
          <RefreshCw aria-hidden="true" size={28} />
          <strong>30-gallon centrifuge = 60-gallon tank</strong>
        </div>
        <p>
          With that ratio, returning ethanol mixes back into a substantial reserve of already cold ethanol
          instead of resetting the whole tank. The temperature shift stays much smaller, recovery back to -40 is
          faster, and operators can move back into extraction sooner.
        </p>
        <p>
          This allows repeated extraction and re-chill cycles until the ethanol reaches roughly 2 to 3 lb of
          material per gallon, at which point it is ready to move to filtration and evaporation.
        </p>
        <p>The BLAST™ 60/45 is built around that more efficient real-world workflow.</p>
      </div>
    </section>
  );
}

function HighlightsAndRoi() {
  return (
    <section className="section roi-section">
      <div className="highlight-panel">
        <p className="eyebrow">Highlights</p>
        <h2>Spec points buyers can scan fast.</h2>
        <ul className="icon-list">
          {highlights.map((item, index) => (
            <li key={item}>
              {index === 0 ? <Zap size={19} /> : null}
              {index === 1 ? <Snowflake size={19} /> : null}
              {index === 2 ? <Fan size={19} /> : null}
              {index === 3 ? <Cpu size={19} /> : null}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="roi-layout">
        <figure className="roi-image">
          <Image
            src="/images/generated/roi-replacement.png"
            alt="Visual transition from consumable cooling to electric industrial chilling"
            width={1365}
            height={1024}
          />
        </figure>
        <div className="roi-copy">
          <p className="eyebrow">ROI / Replacement</p>
          <h2>A cleaner production path for operators replacing consumables or slower legacy chilling.</h2>
          <p>
            For operators still relying on consumables, slower legacy chilling methods, or improvised
            cold-ethanol workflows, the BLAST™ 60/45 offers a cleaner production path. Instead of ongoing
            consumable spend and workflow drag, you get dedicated electric chilling built for repeatable
            low-temperature performance, faster recovery between cycles, and simpler day-to-day operation.
          </p>
          <ul className="icon-list">
            {roiBullets.map((item) => (
              <li key={item}>
                <ShieldCheck size={19} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            For many operators, that makes the BLAST™ 60/45 more than a replacement. It is a move toward
            lower operating cost, better throughput, and a more reliable production workflow.
          </p>
        </div>
      </div>
    </section>
  );
}

function RelatedCta() {
  return (
    <section className="related-section">
      <div>
        <p className="eyebrow">Related reading</p>
        <h2>Direct Refrigerant vs LN2 • Maintenance Guide</h2>
      </div>
      <div className="related-actions">
        <a className="button primary" href="/direct-refrigerant-vs-ln2">
          Compare cooling methods
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="/industrial-chiller-maintenance">
          Maintenance guide
          <Wrench size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
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
