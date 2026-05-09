import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fan,
  Gauge,
  Network,
  Phone,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  ThermometerSnowflake,
  TrendingUp,
  Zap
} from "lucide-react";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "BLAST 240/45 Ethanol Chiller | 240 Gallons to -40C in 45 Minutes | PermaCool",
  description:
    "PermaCool BLAST 240/45 ethanol chiller flash-chills 240 gallons to -40C in 45 minutes with 6.0 GPM of flash chilling, direct refrigerant architecture, and PLC/HMI visibility."
};

const heroStats = [
  {
    label: "240",
    unit: "gallons",
    text: "large process-class ethanol chilling capacity",
    image: "/images/product/blast-60-capacity-icon.jpg"
  },
  {
    label: "45",
    unit: "minutes",
    text: "from room temperature toward -40C",
    image: "/images/product/blast-60-cold-icon.jpg"
  },
  {
    label: "6.0",
    unit: "GPM",
    text: "of flash chilling performance",
    image: "/images/generated/blast240-flash-chilling.png"
  }
];

const valueProps = [
  {
    title: "Large process-class capacity",
    icon: TrendingUp,
    body:
      "The BLAST 240/45 is built for facilities that need the largest BLAST ethanol chilling capacity and a clearer path to higher production volume."
  },
  {
    title: "High-volume pull-down",
    icon: Gauge,
    body:
      "Flash-chill 240 gallons of ethanol to -40C in 45 minutes so larger extraction teams can plan around a strong chilling target."
  },
  {
    title: "Facility-ready integration",
    icon: Network,
    body:
      "Direct refrigerant architecture with HVAC condenser integration helps the system fit into commercial facilities with planned utilities and service access."
  },
  {
    title: "Production control visibility",
    icon: Cpu,
    body:
      "PLC/HMI visibility, compressor protection logic, and operator feedback support repeatable operation at larger throughput levels."
  }
];

const overviewCards = [
  {
    eyebrow: "Performance Profile",
    title: "240 gallons to -40C in 45 minutes.",
    image: "/images/generated/blast240-flash-chilling.png",
    alt: "BLAST 240/45 green performance graphic showing 240 gallons to -40C in 45 minutes",
    body:
      "The BLAST 240/45 is the large process-class option in the BLAST lineup, designed for teams that need more ethanol capacity and stronger schedule support."
  },
  {
    eyebrow: "System Architecture",
    title: "Built for larger direct refrigerant chilling loads.",
    image: "/images/generated/ethanol-systems-hero.png",
    alt: "Industrial ethanol chilling system in a clean production facility",
    body:
      "The system is planned around process chilling, refrigeration, controls, condenser integration, and service access for commercial extraction environments."
  },
  {
    eyebrow: "Workflow Fit",
    title: "More chilled ethanol for higher-volume production.",
    image: "/images/generated/workflow-banner.png",
    alt: "Cold ethanol extraction workflow visual",
    body:
      "Higher process volume gives operators more room to support repeat-cycle extraction where ethanol needs to be re-chilled and put back to work."
  },
  {
    eyebrow: "Operating Model",
    title: "Scale without leaning on consumables.",
    image: "/images/generated/roi-replacement.png",
    alt: "Visual transition from consumable cooling to electric industrial chilling",
    body:
      "For larger labs, reducing LN2 and dry ice dependency can simplify purchasing, receiving, safety planning, and production scheduling."
  }
];

const workflowPoints = [
  {
    title: "Chill",
    body:
      "Bring 240 gallons of ethanol down to extraction-ready low temperature with a defined 45-minute performance target."
  },
  {
    title: "Feed production",
    body:
      "Support larger extraction schedules with a deeper reserve of cold ethanol and a stronger pull-down profile."
  },
  {
    title: "Recover and repeat",
    body:
      "Return ethanol to the system, recover temperature, and keep the extraction workflow moving with less consumable drag."
  }
];

const highlights = [
  "240 gallons to -40C in 45 minutes",
  "6.0 GPM of flash chilling",
  "Large process-class ethanol capacity",
  "Direct refrigerant process chilling",
  "HVAC condenser integration",
  "PLC/HMI control visibility"
];

const fitPoints = [
  "Commercial extraction facilities planning around higher ethanol volume.",
  "Teams that need more process capacity than the BLAST 150/45.",
  "Facilities replacing consumable-heavy cooling with electric process chilling.",
  "Operators who want larger-scale chilling without giving up process visibility and control."
];

export default function Blast240Page() {
  return (
    <main className="site-shell">
      <InsightsHeader />
      <Hero />
      <section className="stat-rail" aria-label="BLAST 240/45 quick specifications">
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
      <SystemOverview />
      <Workflow />
      <Highlights />
      <RelatedCta />
      <InsightsFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero blast240-product-hero">
      <Image
        src="/images/generated/ethanol-systems-hero.png"
        alt=""
        fill
        priority
        className="hero-image"
        sizes="100vw"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">BLAST Product Line</p>
        <h1>BLAST 240/45 Ethanol Chiller</h1>
        <p className="hero-lede">
          Flash-chill 240 gallons of ethanol to -40C in 45 minutes, with 6.0 GPM of flash chilling for large
          process-class extraction workflows.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Request BLAST 240 pricing
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary" href="/ethanol-chiller-comparison">
            Compare BLAST lineup
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
        <h2>Large process-class capacity for higher-volume extraction schedules.</h2>
        <p>
          The BLAST 240/45 is built for teams that need the largest ethanol chilling option in the BLAST lineup, with
          more volume, fast pull-down, and a system architecture suited to commercial production.
        </p>
      </div>
      <div className="value-grid">
        {valueProps.map(({ title, icon: Icon, body }) => (
          <article className="value-card" key={title}>
            <Icon aria-hidden="true" size={26} />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SystemOverview() {
  return (
    <section className="section component-section" id="system-overview">
      <div className="section-heading narrow">
        <p className="eyebrow">System Overview</p>
        <h2>BLAST 240/45 performance, integration, and workflow fit.</h2>
        <p>Scan the system by what matters at scale: capacity, pull-down speed, utility fit, and production control.</p>
      </div>
      <div className="component-grid">
        {overviewCards.map((item) => (
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

function Workflow() {
  return (
    <section className="section workflow-section">
      <div className="section-heading narrow">
        <p className="eyebrow">Extraction Workflow</p>
        <h2>Built for higher-volume chill, extract, recover, and repeat cycles.</h2>
      </div>
      <figure className="workflow-visual">
        <Image
          src="/images/generated/blast240-flash-chilling.png"
          alt="BLAST 240/45 ethanol chilling performance graphic"
          width={1600}
          height={1100}
        />
      </figure>
      <div className="workflow-copy">
        {workflowPoints.map((point) => (
          <article className="ratio-callout" key={point.title}>
            <RefreshCw aria-hidden="true" size={28} />
            <div>
              <strong>{point.title}</strong>
              <p>{point.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="section roi-section">
      <div className="highlight-panel">
        <div>
          <p className="eyebrow">Highlights</p>
          <h2>Spec points buyers can scan fast.</h2>
        </div>
        <ul className="icon-list">
          {highlights.map((item, index) => (
            <li key={item}>
              {index === 0 ? <ThermometerSnowflake size={19} aria-hidden="true" /> : null}
              {index === 1 ? <Gauge size={19} aria-hidden="true" /> : null}
              {index === 2 ? <TrendingUp size={19} aria-hidden="true" /> : null}
              {index === 3 ? <Snowflake size={19} aria-hidden="true" /> : null}
              {index === 4 ? <Fan size={19} aria-hidden="true" /> : null}
              {index === 5 ? <Cpu size={19} aria-hidden="true" /> : null}
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
          <p className="eyebrow">Application Fit</p>
          <h2>The high-capacity option for large extraction operators.</h2>
          <p>
            The BLAST 240/45 is the right direction when the process needs more ethanol capacity, more chilling duty,
            and a stronger path away from consumable-heavy cooling. It is built for teams planning around higher
            throughput and more repeatable production schedules.
          </p>
          <ul className="icon-list">
            {fitPoints.map((item) => (
              <li key={item}>
                <ShieldCheck size={19} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function RelatedCta() {
  return (
    <section className="related-section">
      <div>
        <p className="eyebrow">Need lead time + pricing?</p>
        <h2>Match the BLAST 240/45 to your ethanol volume, batch schedule, and facility utilities.</h2>
        <p>
          PermaCool can help compare the 60/45, 150/45, and 240/45 against your process goals, utility constraints,
          and expansion plan.
        </p>
      </div>
      <div className="related-actions">
        <a className="button primary" href="/contact-us">
          Request BLAST 240 pricing
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="tel:+17472081001">
          Call Engineering
          <Phone size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="/direct-refrigerant-vs-ln2">
          Compare against LN2
          <Zap size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
