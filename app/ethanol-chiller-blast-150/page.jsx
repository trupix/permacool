import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fan,
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
import { InsightsFooter, InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "BLAST 150/45 Ethanol Chiller | 150 Gallons to -40C in 45 Minutes | PermaCool",
  description:
    "PermaCool BLAST 150/45 ethanol chiller flash-chills 150 gallons to -40C in 45 minutes with 3.33 GPM of flash chilling, direct refrigerant architecture, and PLC/HMI visibility."
};

const heroStats = [
  {
    label: "150",
    unit: "gallons",
    text: "process-class ethanol chilling capacity",
    image: "/images/product/blast-60-capacity-icon.jpg"
  },
  {
    label: "45",
    unit: "minutes",
    text: "from room temperature toward -40C",
    image: "/images/product/blast-60-cold-icon.jpg"
  },
  {
    label: "3.33",
    unit: "GPM",
    text: "of flash chilling performance",
    image: "/images/generated/blast150-flash-chilling-purple.png"
  }
];

const valueProps = [
  {
    title: "Mid-scale production capacity",
    icon: TrendingUp,
    body:
      "The BLAST 150/45 is built for labs that have outgrown compact chilling capacity but do not need the full 240-gallon process class yet."
  },
  {
    title: "Fast pull-down for real scheduling",
    icon: Gauge,
    body:
      "Flash-chill 150 gallons of ethanol to -40C in 45 minutes so operators can plan production around a predictable chilling window."
  },
  {
    title: "Direct refrigerant architecture",
    icon: Snowflake,
    body:
      "Electric direct refrigerant chilling helps reduce dependence on LN2 and dry ice consumables while keeping the process easier to control."
  },
  {
    title: "PLC/HMI visibility",
    icon: Cpu,
    body:
      "Control visibility, compressor protection logic, and operator feedback help the system feel like production equipment instead of a workaround."
  }
];

const overviewCards = [
  {
    eyebrow: "Performance Profile",
    title: "150 gallons to -40C in 45 minutes.",
    image: "/images/generated/blast150-flash-chilling-purple.png",
    alt: "BLAST 150/45 purple performance graphic showing 150 gallons to -40C in 45 minutes",
    body:
      "The BLAST 150/45 sits in the middle of the BLAST lineup: more capacity than the compact 60/45, with a production footprint designed for growing extraction schedules."
  },
  {
    eyebrow: "System Architecture",
    title: "Built around direct refrigerant chilling.",
    image: "/images/generated/ethanol-systems-hero.png",
    alt: "Industrial ethanol chilling system in a clean production facility",
    body:
      "The system is planned around process chilling, refrigeration, controls, and service access so the equipment can support day-to-day extraction work."
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
  "150 gallons to -40C in 45 minutes",
  "3.33 GPM of flash chilling",
  "Direct refrigerant process chilling",
  "HVAC condenser integration",
  "PLC/HMI control visibility",
  "Designed for commercial extraction schedules"
];

const fitPoints = [
  "Extraction labs moving beyond pilot-scale chilling capacity.",
  "Teams that need more capacity than the BLAST 60/45 but are not ready for the 240-gallon class.",
  "Operators replacing LN2 or dry ice workflows with electric process chilling.",
  "Facilities that want a clearer path to repeatable re-chill and re-extract workflows."
];

export default function Blast150Page() {
  return (
    <main className="site-shell">
      <InsightsHeader />
      <Hero />
      <section className="stat-rail" aria-label="BLAST 150/45 quick specifications">
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
      <LearningCenterSection />
      <RelatedCta />
      <InsightsFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero blast150-product-hero">
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
        <h1>BLAST 150/45 Ethanol Chiller</h1>
        <p className="hero-lede">
          Flash-chill 150 gallons of ethanol to -40C in 45 minutes, with 3.33 GPM of flash chilling for commercial
          extraction workflows.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="/contact-us">
            Request BLAST 150 pricing
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
        <h2>Mid-scale capacity with a real extraction workflow behind it.</h2>
        <p>
          The BLAST 150/45 is a practical step up for operators who need stronger production capacity, faster chilling
          recovery, and a system sized for commercial extraction growth.
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
        <h2>BLAST 150/45 performance, controls, and workflow fit.</h2>
        <p>Scan the system by what matters in production: pull-down speed, repeatability, controls, and operating cost.</p>
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
        <h2>Built for the extract, re-chill, and repeat operating rhythm.</h2>
      </div>
      <figure className="workflow-visual">
        <Image
          src="/images/generated/blast150-flash-chilling-purple.png"
          alt="BLAST 150/45 ethanol chilling performance graphic"
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
              {index === 2 ? <Snowflake size={19} aria-hidden="true" /> : null}
              {index === 3 ? <Fan size={19} aria-hidden="true" /> : null}
              {index === 4 ? <Cpu size={19} aria-hidden="true" /> : null}
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
          />
        </figure>
        <div className="roi-copy">
          <p className="eyebrow">Application Fit</p>
          <h2>A strong middle option for growing extraction labs.</h2>
          <p>
            The BLAST 150/45 gives operators a production-class chilling target without jumping straight to the largest
            process class. It is meant for teams that need stronger batch support, better temperature recovery, and a
            clearer path away from consumable-heavy chilling.
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
        <h2>Match the BLAST 150/45 to your ethanol volume, batch schedule, and facility utilities.</h2>
        <p>
          PermaCool can help compare the 60/45, 150/45, and 240/45 against your current process instead of guessing
          from capacity alone.
        </p>
      </div>
      <div className="related-actions">
        <a className="button primary" href="/contact-us">
          Request BLAST 150 pricing
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="tel:+17472081001">
          Call Engineering
          <Phone size={18} aria-hidden="true" />
        </a>
        <a className="button secondary light" href="/more-output-per-gallon">
          Read workflow article
          <CheckCircle2 size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
