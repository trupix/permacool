import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Gauge,
  Phone,
  RefreshCw,
  ShieldCheck,
  Snowflake,
  ThermometerSnowflake,
  TrendingUp,
  Zap
} from "lucide-react";
import LearningCenterSection from "../components/LearningCenterSection";
import StructuredData from "../components/StructuredData";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildProductStructuredData, buildPublicPageMetadata } from "../../lib/site";

const blast150Description =
  "Perma Cool BLAST 150/45 standard 150-gallon ethanol pre-chiller chills to −40 °C in 45 minutes with 3.33 GPM chilling, direct refrigerant architecture, and PLC/HMI visibility.";

export const metadata = buildPublicPageMetadata({
  path: "/ethanol-chiller-blast-150",
  title: "BLAST™ 150/45 Ethanol Chiller | 150 Gallons to −40 °C in 45 Minutes | Perma Cool",
  description: blast150Description,
  image: "/images/generated/blast150-hero-crystal-bear.png"
});

const blast150StructuredData = buildProductStructuredData({
  path: "/ethanol-chiller-blast-150",
  name: "BLAST 150/45 Ethanol Chiller",
  model: "BLAST 150/45",
  description: blast150Description,
  image: "/images/generated/blast150-hero-crystal-bear.png",
  properties: [
    ["Ethanol capacity", "150 gallons"],
    ["Pull-down target", "Room temperature to −40 °C in 45 minutes"],
    ["Flash chilling rate", "3.33 gallons per minute"],
    ["Control system", "PLC and HMI visibility"]
  ]
});

const heroStats = [
  {
    label: "150",
    unit: "gallons",
    text: "Commercial scale operating capacity",
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
    label: "3.33",
    unit: "GPM",
    text: "Full tank flash chilling performance average",
    icon: Gauge,
    tone: "flow"
  }
];

const breakdownCards = [
  {
    title: "Standard 150-gallon pre-chiller",
    icon: TrendingUp,
    body:
      "The BLAST 150/45 is Perma Cool's standard 150-gallon ethanol pre-chiller for commercial labs that need real production capacity without jumping into the largest tank class."
  },
  {
    title: "The model name is the target",
    icon: Gauge,
    body:
      "The name is literal: 150 gallons of ethanol chilled from room temperature to −40 °C in 45 minutes, or about 3.33 gallons per minute of chilling performance."
  },
  {
    title: "The mid-size workhorse",
    icon: ShieldCheck,
    body:
      "If the 60/45 is the entry production system, the 150/45 is the standard mid-size workhorse for commercial extraction teams."
  }
];

const valueProps = [
  {
    title: "Mid-scale production capacity",
    icon: TrendingUp,
    body:
      "The BLAST 150/45 is built for labs moving beyond small-batch chilling but not yet ready for the larger 240-gallon class."
  },
  {
    title: "Predictable pull-down scheduling",
    icon: Gauge,
    body:
      "A 45-minute pull-down window gives operators a chilling target they can build daily extraction schedules around."
  },
  {
    title: "Built for repeat-cycle extraction",
    icon: RefreshCw,
    body:
      "The system supports the extract, return, re-chill, and repeat rhythm of ethanol processing with less waiting on slow recovery."
  },
  {
    title: "Controls and component protection",
    icon: Cpu,
    body:
      "Perma Cool controls give operators process visibility, while compressor self-protection and control logic help protect major refrigeration components."
  }
];

const overviewCards = [
  {
    eyebrow: "Performance Profile",
    title: "150 gallons to −40 °C in 45 minutes.",
    image: "/images/generated/blast150-flash-chilling-purple.png",
    alt: "BLAST 150/45 purple performance graphic showing 150 gallons to −40 °C in 45 minutes",
    body:
      "The BLAST 150/45 sits in the middle of the BLAST lineup: more capacity than the compact 60/45, with a production footprint designed for growing extraction schedules."
  },
  {
    eyebrow: "System Architecture",
    title: "Single piston compressor/condenser platform.",
    image: "/images/generated/ethanol-systems-hero.webp",
    alt: "Industrial ethanol chilling system in a clean production facility",
    body:
      "The BLAST 150/45 uses a hardier low-temperature refrigeration setup for production use, with direct refrigerant chilling and HVAC condenser integration."
  },
  {
    eyebrow: "Workflow Fit",
    title: "A better fit for repeat-cycle extraction.",
    image: "/images/generated/workflow-banner.png",
    alt: "Cold ethanol extraction workflow visual",
    body:
      "Fast re-chill performance supports extract, return, re-chill, and repeat workflows where each gallon of ethanol needs to carry more value."
  },
  {
    eyebrow: "Operating Model",
    title: "Less consumable drag, more process control.",
    image: "/images/generated/roi-replacement.png",
    alt: "Visual transition from consumable cooling to electric industrial chilling",
    body:
      "Replacing consumable-heavy chilling with electric process equipment helps operators reduce supply-chain friction and improve production confidence."
  }
];

const workflowPoints = [
  {
    title: "Chill",
    body:
      "Bring 150 gallons of ethanol down to extraction-ready low temperature with a defined 45-minute performance target."
  },
  {
    title: "Extract",
    body:
      "Use cold ethanol in the extraction process while protecting product quality and operating consistency."
  },
  {
    title: "Re-chill",
    body:
      "Return the ethanol to the chiller, recover temperature, and prepare it for the next pass through fresh biomass."
  }
];

const highlights = [
  "150-gallon ethanol capacity",
  "Room temperature to −40 °C in 45 minutes",
  "About 3.33 gallons per minute of chilling performance",
  "Built for repeat-cycle extraction workflows",
  "Designed to reduce dependence on LN2 and dry ice",
  "Middle option between the BLAST 60/45 and 240-gallon class"
];

const fitPoints = [
  "Customers who want a true 150-gallon ethanol chilling platform.",
  "Teams that need more capacity than the BLAST 60/45 but are not ready for the 240-gallon class.",
  "Operators who want a standard production unit instead of the faster 150/25 model.",
  "Labs moving away from LN2, dry ice, or freezer-based chilling.",
  "Facilities that need repeatable re-chill performance for daily extraction scheduling."
];

const architecturePoints = [
  "Single piston compressor/condenser platform for hardier low-temperature production use.",
  "Direct refrigerant chilling focused on moving heat out of the ethanol process efficiently.",
  "Comfortably supports around 100 feet of copper run each way when facility layout requires separation between process equipment and condenser placement."
];

export default function Blast150Page() {
  return (
    <main className="site-shell">
      <StructuredData data={blast150StructuredData} />
      <InsightsHeader />
      <Hero />
      <section className="stat-rail blast150-stat-rail" aria-label="BLAST 150/45 quick specifications">
        {heroStats.map((item) => {
          const Icon = item.icon;

          return (
            <article className={`stat-card blast150-stat-card blast150-stat-card--${item.tone}`} key={item.text}>
              <span className="blast150-stat-icon" aria-hidden="true">
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
      <Breakdown />
      <ValueProps />
      <SystemOverview />
      <Workflow />
      <Highlights />
      <LearningCenterSection />
      <RelatedCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero blast150-product-hero">
      <Image
        src="/images/generated/blast150-hero-crystal-bear.png"
        alt=""
        fill
        priority
        fetchPriority="high"
        className="hero-image"
        sizes="100vw"
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">BLAST Product Line</p>
        <h1>
          <span className="blast150-hero-title-accent">BLAST™ 150/45</span> Ethanol Chiller
        </h1>
        <p className="hero-lede">
          Flash-chill 150 gallons of ethanol to −40 °C in 45 minutes, with 3.33 GPM of flash chilling for commercial
          extraction workflows.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Request BLAST 150/45 pricing
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

function Breakdown() {
  return (
    <section className="section value-section">
      <div className="section-heading">
        <p className="eyebrow">BLAST 150/45 Breakdown</p>
        <h2>Standard 150-gallon production chilling.</h2>
        <p>
          The 150/45 gives extraction labs 150 gallons of cold ethanol capacity, a predictable 45-minute pull-down
          target, and a production refrigeration platform for commercial daily use.
        </p>
      </div>
      <div className="value-grid">
        {breakdownCards.map(({ title, icon: Icon, body }) => (
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

function ValueProps() {
  return (
    <section className="section value-section">
      <div className="section-heading">
        <p className="eyebrow">What It's Built For</p>
        <h2>Repeat ethanol extraction cycles where recovery and consistency matter.</h2>
        <p>
          Instead of waiting on consumables or improvised freezer workflows, the BLAST 150/45 gives the lab a dedicated
          electric chilling platform built around repeatable ethanol processing.
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
        <h2>BLAST 150/45 performance, refrigeration architecture, and workflow fit.</h2>
        <p>Scan the system by what matters in production: pull-down speed, repeatability, controls, and facility fit.</p>
      </div>
      <div className="component-grid">
        {overviewCards.map((item) => (
          <article className="component-card" key={item.title}>
            <div className="component-media">
              <Image
                src={item.image}
                alt={item.alt}
                width={720}
                height={520}
                sizes="(max-width: 980px) calc(100vw - 2rem), 580px"
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
        <h2>Built for the extract, re-chill, and repeat operating rhythm.</h2>
      </div>
      <figure className="workflow-visual">
        <Image
          src="/images/generated/blast150-bear-card-purple.png"
          alt="BLAST 150/45 crystal bear ethanol chilling performance card"
          width={1600}
          height={1100}
          sizes="(max-width: 980px) calc(100vw - 2rem), 1180px"
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
        <article className="ratio-callout">
          <Snowflake aria-hidden="true" size={28} />
          <div>
            <strong>Protect</strong>
            <p>
              Compressor self-protection and Perma Cool control logic help the refrigeration platform handle changing
              extraction-room conditions.
            </p>
          </div>
        </article>
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
              {index === 0 ? <TrendingUp size={19} aria-hidden="true" /> : null}
              {index === 1 ? <ThermometerSnowflake size={19} aria-hidden="true" /> : null}
              {index === 2 ? <Gauge size={19} aria-hidden="true" /> : null}
              {index === 3 ? <RefreshCw size={19} aria-hidden="true" /> : null}
              {index === 4 ? <Snowflake size={19} aria-hidden="true" /> : null}
              {index === 5 ? <Zap size={19} aria-hidden="true" /> : null}
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
            sizes="(max-width: 980px) calc(100vw - 2rem), 540px"
          />
        </figure>
        <div className="roi-copy">
          <p className="eyebrow">Refrigeration Architecture</p>
          <h2>A hardier platform for commercial extraction work.</h2>
          <p>
            The BLAST 150/45 is built for direct refrigerant chilling, which means the equipment is focused on moving
            heat out of the ethanol process efficiently instead of relying on consumable cryogenic media.
          </p>
          <ul className="icon-list">
            {architecturePoints.map((item) => (
              <li key={item}>
                <ShieldCheck size={19} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="highlight-panel">
        <div>
          <p className="eyebrow">Best Customer Fit</p>
          <h2>The right starting point for a true 150-gallon platform.</h2>
        </div>
        <ul className="icon-list">
          {fitPoints.map((item) => (
            <li key={item}>
              <ShieldCheck size={19} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RelatedCta() {
  return (
    <section className="related-section">
      <div>
        <p className="eyebrow">Need lead time + pricing?</p>
        <h2>Match the BLAST 150/45 to your ethanol volume, batch schedule, and facility utilities.</h2>
        <p>
          Perma Cool can help compare the 60/45, standard 150/45, faster 150/25, and 240/45 against your current process
          instead of guessing from capacity alone.
        </p>
      </div>
      <div className="related-actions">
        <a className="button primary" href="/contact-us">
          Request BLAST 150/45 pricing
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="tel:+17472081001">
          Call Engineering
          <Phone size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="/workflow">
          Read workflow article
          <CheckCircle2 size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
