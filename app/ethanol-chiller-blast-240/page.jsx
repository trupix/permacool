import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
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
import LearningCenterSection from "../components/LearningCenterSection";
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "BLAST™ 240/45 Ethanol Chiller | 240 Gallons to −40 °C in 45 Minutes | Perma Cool",
  description:
    "Perma Cool BLAST 240/45 ethanol chiller flash-chills 240 gallons to −40 °C in 45 minutes with 6.0 GPM of flash chilling, direct refrigerant architecture, and PLC/HMI visibility.",
  alternates: { canonical: "https://perma.cool/ethanol-chiller-blast-240" }
};

const heroStats = [
  {
    label: "240",
    unit: "gallons",
    text: "Enterprise level operating capacity",
    icon: Droplets,
    tone: "capacity"
  },
  {
    label: "45",
    unit: "minutes",
    text: "Room temperature to −40 °C — continuous-duty 24/7 operation",
    icon: Clock,
    tone: "pull-down"
  },
  {
    label: "6.0",
    unit: "GPM",
    text: "Full tank flash chilling performance average",
    icon: Gauge,
    tone: "flow"
  }
];

const valueProps = [
  {
    title: "Enterprise process-class capacity",
    icon: TrendingUp,
    body:
      "The BLAST 240/45 is built for facilities that need the largest BLAST ethanol chilling capacity and a clearer path to higher production volume."
  },
  {
    title: "High-volume pull-down",
    icon: Gauge,
    body:
      "Flash-chill 240 gallons of ethanol to −40 °C in 45 minutes so larger extraction teams can plan around a strong chilling target."
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
    title: "240 gallons to −40 °C in 45 minutes.",
    image: "/images/generated/blast240-bear-card.png",
    imageWidth: 1440,
    imageHeight: 1040,
    alt: "BLAST 240/45 crystal bear ethanol chilling performance stats card",
    body:
      "The BLAST 240/45 is the large process-class option in the BLAST lineup, designed for teams that need more ethanol capacity and stronger schedule support."
  },
  {
    eyebrow: "System Architecture",
    title: "Direct refrigerant chilling with regeneration recovery.",
    image: "/images/generated/blast240-system-architecture-flow.png",
    imageWidth: 1672,
    imageHeight: 941,
    alt: "BLAST 240/45 direct refrigerant system architecture with process tank, heat exchangers, pump, and flow arrows",
    body:
      "Regeneration adds heat-transfer surface that lets returning ethanol exchange energy with the colder side of the loop before final pull-down. The system reclaims useful cold from the process stream, lowers the load the refrigeration circuit has to absorb, and helps the 240-gallon tank recover faster between extraction cycles."
  },
  {
    eyebrow: "Workflow Fit",
    title: "More chilled ethanol for higher-volume production.",
    image: "/images/generated/blast240-workflow-fit-two-centrifuges.png",
    imageWidth: 1672,
    imageHeight: 941,
    alt: "BLAST 240/45 workflow fit showing two 70-gallon centrifuges feeding a high-capacity ethanol chilling system",
    body:
      "With 240 gallons of cold ethanol capacity, the BLAST 240/45 can fully support extraction workflows built around two 70-gallon centrifuges, with reserve volume left for re-chilling, staging, and repeat cycles. Larger facilities can plan around two centrifuges or more without making the chiller the bottleneck."
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
  "240 gallons to −40 °C in 45 minutes",
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
      <section className="stat-rail blast240-stat-rail" aria-label="BLAST 240/45 quick specifications">
        {heroStats.map((item) => {
          const Icon = item.icon;

          return (
            <article className={`stat-card blast240-stat-card blast240-stat-card--${item.tone}`} key={item.text}>
              <span className="blast240-stat-icon" aria-hidden="true">
                <Icon size={34} strokeWidth={2.4} />
              </span>
              <div>
                <strong>{item.label}</strong>
                <span>{item.unit}</span>
                <p>{item.text}</p>
              </div>
            </article>
          );
        })}
      </section>
      <ValueProps />
      <SystemOverview />
      <Workflow />
      <Highlights />
      <LearningCenterSection />
      <RelatedCta />
      <InsightsFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero blast240-product-hero">
      <Image
        src="/images/generated/blast240-hero-crystal-bear.png"
        alt=""
        fill
        priority
        className="hero-image"
        sizes="100vw"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">BLAST Product Line</p>
        <h1>
          <span className="blast240-hero-title-accent">BLAST™ 240/45</span> Ethanol Chiller
        </h1>
        <p className="hero-lede">
          Flash-chill 240 gallons of ethanol to −40 °C in 45 minutes, with 6.0 GPM of flash chilling for large
          enterprise level extraction workflows.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Request BLAST 240/45 pricing
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
        <p className="eyebrow">Enterprise Level</p>
        <h2>High-volume capacity for large commercial extraction facilities.</h2>
        <p>
          The BLAST 240/45 is built for facilities running multiple large centrifuges. Its nominal 6.0 GPM
          flash-chilling rate is supported by 100 kW of direct refrigeration and 100 kW of regeneration surface
          capacity. In-tank directional mixing, a 19-inch C1D2 HMI touchscreen, an upgraded PLC, and optional automation
          upgrades give operators high-volume process control.
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
            <div
              className="component-media"
              style={
                item.imageWidth && item.imageHeight
                  ? { aspectRatio: `${item.imageWidth} / ${item.imageHeight}` }
                  : undefined
              }
            >
              <Image
                src={item.image}
                alt={item.alt}
                width={item.imageWidth || 720}
                height={item.imageHeight || 520}
              />
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
          src="/images/generated/blast240-bear-card.png"
          alt="BLAST 240/45 crystal bear ethanol chilling performance card"
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
          Perma Cool can help compare the 60/45, 150/45, and 240/45 against your process goals, utility constraints,
          and expansion plan.
        </p>
      </div>
      <div className="related-actions">
        <a className="button primary" href="/contact-us">
          Request BLAST 240/45 pricing
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
