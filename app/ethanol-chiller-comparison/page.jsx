import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Gauge,
  Network,
  Snowflake,
  ThermometerSnowflake,
  TrendingUp
} from "lucide-react";
import LearningCenterSection from "../components/LearningCenterSection";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildPublicPageMetadata } from "../../lib/site";
import { buildContactHref } from "../../lib/contact";

const comparisonRecommendationHref = buildContactHref({
  interest: "Ethanol Chillers",
  requestType: "System Recommendation",
  source: "ethanol-chiller-comparison"
});

export const metadata = buildPublicPageMetadata({
  path: "/ethanol-chiller-comparison",
  title: "Compare BLAST™ Ethanol Chillers | 60/45, 150/45, 150/30 & 240/45 | Perma Cool",
  description:
    "Compare Perma Cool BLAST 60/45, BLAST 150/45, BLAST 150/30, and BLAST 240/45 ethanol chillers by capacity, pull-down target, workflow fit, controls, and production scale.",
  image: "/images/generated/ethanol-systems-hero.png"
});

const models = [
  {
    name: "BLAST 60/45",
    href: "/ethanol-chiller-blast-60",
    image: "/images/generated/blast60-flash-chilling.png",
    capacity: "60 gallons",
    time: "45 minutes",
    rate: "1.33 GPM",
    fit: "Compact production and 30-gallon centrifuge workflows",
    architecture: "Dual-stage cascade architecture",
    controls: "PLC/HMI visibility",
    condenser: "Two outdoor condenser units",
    bestFor:
      "Labs that want a compact, serviceable ethanol chiller with strong low-temperature performance and a clean path away from LN2 or dry ice.",
    cta: "View BLAST 60/45"
  },
  {
    name: "BLAST 150/45",
    href: "/ethanol-chiller-blast-150",
    image: "/images/generated/blast150-flash-chilling-purple.png",
    capacity: "150 gallons",
    time: "45 minutes",
    rate: "3.33 GPM",
    fit: "Mid-scale commercial extraction",
    architecture: "Direct refrigerant process chilling",
    controls: "PLC/HMI visibility",
    condenser: "HVAC condenser integration",
    bestFor:
      "Teams that have outgrown compact chilling capacity and need a stronger production-class target without jumping to the largest unit.",
    cta: "View BLAST 150/45"
  },
  {
    name: "BLAST 150/30",
    href: "/ethanol-chiller-blast-150-30",
    image: "/images/generated/blast15030/desert-system-hero.png",
    capacity: "150 gallons",
    time: "30 minutes",
    rate: "5 GPM",
    fit: "High-speed 150-gallon commercial extraction",
    architecture: "22 HP + 6 HP cascade with regenerative chilling",
    controls: "Mirage 1.0 PLC/HMI visibility",
    condenser: "Two aligned outdoor condenser units",
    bestFor:
      "Teams that need 150-gallon capacity with faster pull-down, cascade subcooling, regenerative chilling, and coordinated control across all three equipment zones.",
    cta: "View BLAST 150/30"
  },
  {
    name: "BLAST 240/45",
    href: "/ethanol-chiller-blast-240",
    image: "/images/generated/blast240-flash-chilling.png",
    capacity: "240 gallons",
    time: "45 minutes",
    rate: "6.0 GPM",
    fit: "Large process-class extraction facilities",
    architecture: "Direct refrigerant process chilling",
    controls: "PLC/HMI visibility",
    condenser: "HVAC condenser integration",
    bestFor:
      "Facilities planning around higher ethanol volume, larger production schedules, and a stronger path away from consumable-heavy cooling.",
    cta: "View BLAST 240/45"
  }
];

const comparisonRows = [
  ["Ethanol capacity", "60 gallons", "150 gallons", "150 gallons", "240 gallons"],
  ["Pull-down target", "Room temperature to −40 °C", "Room temperature to −40 °C", "Room temperature to −40 °C", "Room temperature to −40 °C"],
  ["Target timing", "45 minutes", "45 minutes", "30 minutes", "45 minutes"],
  ["Flash-chilling rate", "1.33 GPM", "3.33 GPM", "5 GPM", "6.0 GPM"],
  ["Best production fit", "Compact production", "Mid-scale production", "High-speed mid-scale production", "Large process class"],
  ["Workflow match", "30-gallon centrifuge or 2x 15-gallon workflow", "Growing commercial extraction schedules", "Faster 150-gallon repeat cycles", "Higher-volume extraction schedules"],
  ["System architecture", "Dual-stage cascade design", "Direct refrigerant chilling", "22 HP + 6 HP cascade with regeneration", "Direct refrigerant chilling"],
  ["Controls", "PLC/HMI visibility", "PLC/HMI visibility", "Mirage 1.0 PLC/HMI", "PLC/HMI visibility"],
  ["Facility integration", "Outdoor condenser units", "HVAC condenser integration", "Three-zone coordinated installation", "HVAC condenser integration"]
];

const decisionCards = [
  {
    icon: Snowflake,
    title: "Choose 60/45 for compact speed",
    body:
      "Best when the workflow centers on a 30-gallon centrifuge class and the facility wants a serviceable, lower-temperature cascade design."
  },
  {
    icon: Gauge,
    title: "Choose 150/45 for the middle lane",
    body:
      "Best when production has moved past pilot scale and needs more chilling capacity without stepping into the largest process class."
  },
  {
    icon: Gauge,
    title: "Choose 150/30 for faster 150-gallon cycles",
    body:
      "Best when the operation needs 150-gallon capacity with five-gallon-per-minute chilling, cascade subcooling, and regenerative heat transfer."
  },
  {
    icon: TrendingUp,
    title: "Choose 240/45 for volume",
    body:
      "Best when the operation needs the largest BLAST ethanol capacity, faster schedule support, and room for higher production volume."
  }
];

export default function EthanolChillerComparisonPage() {
  return (
    <main className="site-shell comparison-page">
      <InsightsHeader />

      <section className="comparison-hero">
        <Image
          src="/images/generated/ethanol-systems-hero.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="comparison-hero-image"
          sizes="100vw"
        />
        <div className="comparison-hero-overlay" />
        <div className="comparison-hero-content">
          <p className="eyebrow">BLAST Ethanol Chiller Comparison</p>
          <h1>Compare BLAST™ 60/45, 150/45, 150/30, and 240/45 ethanol chillers.</h1>
          <p>
            Pick the production class that matches your ethanol volume, centrifuge workflow, facility utilities, and
            throughput target.
          </p>
          <div className="hero-actions">
            <a className="button primary" href={comparisonRecommendationHref}>
              Get a System Recommendation
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/ethanol-chilling-systems">
              View Ethanol Chillers
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="comparison-model-strip" aria-label="BLAST ethanol chiller summary">
        {models.map((model) => (
          <article key={model.name}>
            <Image
              src={model.image}
              alt={`${model.name} ethanol chiller`}
              width={520}
              height={320}
              sizes="(max-width: 680px) 76px, 96px"
            />
            <div>
              <h2>{model.name}</h2>
              <p>{model.capacity} to −40 °C in {model.time}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section comparison-chart-section">
        <div className="section-heading">
          <p className="eyebrow">Comparison Chart</p>
          <h2>Four ethanol chillers, one production-class decision.</h2>
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">Spec / Fit</th>
                {models.map((model) => (
                  <th scope="col" key={model.name}>{model.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([label, ...values]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {values.map((value, index) => <td key={`${label}-${models[index].name}`}>{value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section comparison-cards-section">
        <div className="section-heading">
          <p className="eyebrow">Quick Recommendation</p>
          <h2>Use the chiller size that matches the bottleneck you are solving.</h2>
        </div>
        <div className="comparison-decision-grid">
          {decisionCards.map(({ icon: Icon, title, body }) => (
            <article key={title}>
              <Icon size={26} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section comparison-model-section">
        <div className="section-heading">
          <p className="eyebrow">Model Details</p>
          <h2>Compare each BLAST chiller in context.</h2>
        </div>
        <div className="comparison-model-grid">
          {models.map((model) => (
            <article className="comparison-model-card" key={model.name}>
              <Image
                src={model.image}
                alt={`${model.name} ethanol chiller product rendering`}
                width={680}
                height={420}
                sizes="(max-width: 980px) calc(100vw - 2rem), 380px"
              />
              <div>
                <h3>{model.name}</h3>
                <ul>
                  <li><ThermometerSnowflake size={18} aria-hidden="true" /> {model.capacity} capacity</li>
                  <li><Gauge size={18} aria-hidden="true" /> {model.rate}</li>
                  <li><Cpu size={18} aria-hidden="true" /> {model.controls}</li>
                  <li><Network size={18} aria-hidden="true" /> {model.condenser}</li>
                </ul>
                <p>{model.bestFor}</p>
                <a className="inline-link" href={model.href}>
                  {model.cta}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LearningCenterSection />

      <section className="related-section comparison-related">
        <div>
          <p className="eyebrow">Still Choosing?</p>
          <h2>Tell Perma Cool your ethanol volume and run schedule.</h2>
          <p>A system recommendation can match capacity, utilities, and extraction goals instead of guessing from a chart.</p>
        </div>
        <div className="related-actions">
          <a className="button primary" href={comparisonRecommendationHref}>
            Request a Recommendation
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="/ethanol-chilling-systems">
            View Ethanol Systems
            <CheckCircle2 size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

    </main>
  );
}
