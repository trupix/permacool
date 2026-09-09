import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Gauge, RefreshCw, Snowflake, Wrench } from "lucide-react";
import { InsightsHeader } from "./insights/InsightsShell";
import LearningCenterSection from "./components/LearningCenterSection";
import ExpandableImage from "./components/ExpandableImage";
import { buildContactHref } from "../lib/contact";
import "./ethanol-chiller-blast-60/blast60-design.css";

const pricingHref = buildContactHref({
  interest: "Ethanol Chillers", requestType: "Product Pricing",
  product: "BLAST 60/45", source: "ethanol-chiller-blast-60"
});

const productionFit = [
  {
    title: "Built smart, cascade design", icon: Snowflake,
    body: "The BLAST 60/45 is the most compact unit in the BLAST lineup and the only model built around Perma Cool’s cascade-style architecture, combining strong low-temperature performance with long-term serviceability.",
    link: "More →", href: "#cascade"
  },
  {
    title: "Production-ready workflow", icon: RefreshCw,
    body: "It replaces consumables and slower legacy chilling methods with a production-ready system sized for the ideal 30-gallon centrifuge workflow.",
    link: "workflow explained →", href: "/workflow"
  },
  {
    title: "Fast return on value", icon: Gauge,
    body: "For many operators, the 60/45 hits the sweet spot, real production capacity, smarter workflow, and a system that can often pay for itself within the first few months of operation."
  }
];

const components = [
  {
    number: "01", title: "Ethanol chilling platform", role: "At the process",
    image: "blast60-component-01-temperature-sensor.png", width: 1453, height: 1082,
    alt: "BLAST 60/45 platform with labeled tank, heat exchanger, pump, sensor, sight glass, and ethanol outlets",
    body: "The chilling tank, circulation pump, and plate heat exchanger bring storage and heat transfer together in one process-side assembly.",
    details: ["Vacuum-jacketed tank", "Level sight glass", "Temperature sensor", "Ethanol outlet ports"]
  },
  {
    number: "02", title: "FluxBox", role: "Between refrigeration stages",
    image: "blast60-component-02-flux-box-wall.png", width: 1475, height: 1066, alt: "Wall-mounted FluxBox heat exchanger",
    body: "The FluxBox is the wall-mounted heat exchanger on the BLAST 60/45’s cascade side. It allows the secondary refrigeration circuit to cool the primary circuit, supporting the system’s two-stage, low-temperature performance."
  },
  {
    number: "03", title: "PLC control system", role: "System control",
    image: "blast60-component-03-plc-control-system.png", width: 1600, height: 1100, alt: "BLAST 60/45 wall-mounted PLC control cabinet",
    body: "Centralized monitoring, logic, and control give operators visibility into the chilling process. PLC/HMI feedback helps operators manage process performance and consistent operation, with compressor protection logic built into the system."
  },
  {
    number: "04", title: "Two 6 HP condensers", role: "Outdoors",
    image: "blast60-component-04-condensers.png", width: 1600, height: 1100, alt: "Two separate six-horsepower outdoor condenser units for the BLAST 60/45",
    body: "Two separate six-horsepower condenser units support the primary and cascade refrigeration stages."
  }
];

const specifications = [
  ["Model", "BLAST 60/45"], ["Ethanol capacity", "60 gallons"],
  ["Pull-down target", "Room temperature to −40 °C in 45 minutes"],
  ["Flash chilling average", "1.33 GPM"],
  ["Centrifuge pairing", "30 gallons"], ["Refrigeration", "Dual-stage cascade · direct refrigerant"],
  ["Condensers", "2 × 6 HP"], ["Integration", "HVAC condenser integration"],
  ["Controls", "PLC/HMI with compressor protection logic"]
];

export default function Blast60Page() {
  return (
    <main className="site-shell b60-page">
      <InsightsHeader />
      <section className="b60-hero" id="overview" aria-labelledby="b60-title">
        <Image src="/images/generated/blast60-hero-original-photo-valves-corrected.png"
          alt="BLAST 60/45 chilling platform and wall-mounted controls, with two separate condensers outside"
          fill priority fetchPriority="high" sizes="100vw" className="b60-hero-image" />
        <div className="b60-hero-shade" />
        <div className="b60-wrap b60-hero-content">
          <a className="b60-back" href="/ethanol-chilling-systems">Ethanol chilling systems <ArrowUpRight size={14} /></a>
          <p className="b60-kicker">Perma Cool / Dual-stage cascade</p>
          <h1 id="b60-title">BLAST™ <span>60/45</span><small>Ethanol Chiller</small></h1>
          <p className="b60-lede">Chill 60 gallons of ethanol from room temperature to −40 °C in 45 minutes.</p>
          <div className="b60-actions">
            <a className="b60-button" href={pricingHref}>Get pricing & lead time <ArrowRight size={18} /></a>
            <a className="b60-text-link" href="#components">Explore the system <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="b60-stats" aria-label="BLAST 60/45 quick specifications">
        <div className="b60-wrap b60-stats-grid">
          <div><strong>60 <small>gal</small></strong><span>Ethanol capacity</span></div>
          <div><strong>−40 <small>°C</small></strong><span>Chilling target</span></div>
          <div><strong>45 <small>min</small></strong><span>Room-temperature pull-down</span></div>
          <div><strong>30 <small>gal</small></strong><span>Centrifuge pairing</span></div>
        </div>
      </section>

      <section className="b60-section b60-wrap b60-production-fit" id="production-fit" aria-labelledby="b60-production-title">
        <div className="b60-production-heading">
          <p className="b60-kicker">Production Fit</p>
          <h2 id="b60-production-title">Compact capacity with a real extraction workflow behind it.</h2>
        </div>
        <div className="b60-production-grid">
          {productionFit.map(({ title, icon: Icon, body, link, href }) => (
            <article className="b60-production-card" key={title}>
              <Icon size={28} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
              {href && <a className="b60-text-link" href={href}>{link}</a>}
            </article>
          ))}
        </div>
      </section>

      <section className="b60-section b60-wrap" id="components">
        <div className="b60-heading">
          <div><p className="b60-kicker">The equipment</p><h2>One system.<br />Four working parts.</h2></div>
          <p>Process-side chilling, wall-mounted heat exchange and controls, and two outdoor condensers.</p>
        </div>
        <div className="b60-components">
          {components.map((item) => (
            <article className={`b60-component b60-component-${item.number}`} key={item.number}>
              <ExpandableImage className="b60-component-image" src={`/images/generated/${item.image}`} alt={item.alt} label={`Open full-size image: ${item.title}`}>
                <Image src={`/images/generated/${item.image}`} alt={item.alt} width={item.width} height={item.height}
                  sizes={item.number === "01" ? "(max-width: 800px) 100vw, 760px" : "(max-width: 800px) 100vw, 410px"} />
                <span className="b60-expand" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </ExpandableImage>
              <div className="b60-component-copy">
                <p className="b60-kicker"><span>{item.number}</span> {item.role}</p>
                <h3>{item.title}</h3><p>{item.body}</p>
                {item.details && <ul className="b60-details">{item.details.map((detail) => <li key={detail}><Check size={16} aria-hidden="true" />{detail}</li>)}</ul>}
              </div>
            </article>
          ))}
        </div>
        <details className="b60-system-gallery">
          <summary>View the original BLAST 60/45 system illustration</summary>
          <figure className="b60-restored-image">
            <ExpandableImage src="/images/generated/blast60-hero-crystal-bear.png" alt="Original BLAST 60/45 system illustration with the crystal bear, process platform, controls, and outdoor condensers" label="Open full-size original BLAST 60/45 system illustration">
              <Image src="/images/generated/blast60-hero-crystal-bear.png" alt="Original BLAST 60/45 system illustration with the crystal bear, process platform, controls, and outdoor condensers" width={1672} height={941} sizes="(max-width: 800px) 100vw, 1240px" />
            </ExpandableImage>
          </figure>
        </details>
      </section>

      <section className="b60-cascade" id="cascade">
        <div className="b60-wrap b60-section">
          <div className="b60-cascade-heading">
            <div className="b60-cascade-title">
              <p className="b60-kicker">How cascade works</p>
              <h2><span>A chiller</span>{" "}<span>for the chiller.</span></h2>
            </div>
            <div className="b60-cascade-explanation">
              <p>The primary circuit directly chills your ethanol. The cascade circuit cools the primary circuit so the system can reach lower temperatures with efficient, consistent pull-down.</p>
              <p>Two smaller, common-sized refrigeration stages replace one oversized unit. That architecture supports low-temperature performance while making parts easier to source and the system simpler to maintain in production.</p>
            </div>
          </div>
          <figure className="b60-diagram">
            <ExpandableImage src="/images/generated/cascade-refrigerant-flow-ethanol-labels.png" alt="BLAST 60/45 refrigerant flow diagram showing the primary and cascade circuits and ethanol connections" label="Open full-size cascade flow diagram">
              <Image src="/images/generated/cascade-refrigerant-flow-ethanol-labels.png" alt="BLAST 60/45 refrigerant flow diagram showing the primary and cascade circuits and ethanol connections" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 1240px" />
            </ExpandableImage>
            <figcaption>Primary and cascade refrigeration circuits <span>Open image to view flow details <ArrowUpRight size={14} /></span></figcaption>
          </figure>
          <div className="b60-field-benefits">
            <h3>Why that matters in the field</h3>
            <div className="b60-principles">
              <div><Snowflake aria-hidden="true" /><h3>Better low-temperature performance</h3><p>Cascade refrigeration supports colder operation than a comparable single-stage setup, with the secondary stage cooling the primary circuit through the FluxBox.</p></div>
              <div><Wrench aria-hidden="true" /><h3>Common parts, easier service</h3><p>Standard component sizing simplifies diagnosis, repair, and parts sourcing, helping reduce service costs without relying on rare, oversized hardware.</p></div>
              <div><RefreshCw aria-hidden="true" /><h3>Built for long-term maintenance</h3><p>Repairable, common-sized components make the machine easier to maintain over its working life and avoid dependence on exotic, hard-to-source parts.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="b60-wrap b60-section b60-workflow" id="workflow">
        <div>
          <p className="b60-kicker">Centrifuge pairing</p><h2>A cold reserve<br />for the next cycle.</h2>
          <p>A 60-gallon tank pairs with a 30-gallon centrifuge. Returning ethanol mixes into a reserve of already-cold ethanol, limiting the temperature rise and supporting re-chilling between extraction cycles.</p>
          <p>The tank-to-centrifuge ratio is about 2:1. With more cold ethanol in reserve, the tank sees a smaller temperature shift, recovers to −40 °C faster, and is ready for the next extraction cycle sooner.</p>
          <a className="b60-text-link" href="/workflow">Read the workflow breakdown article <ArrowUpRight size={17} /></a>
        </div>
        <figure className="b60-ratio-image">
          <Image
            src="/images/generated/blast60-capacity-neutral.png"
            alt="Illustrative capacity comparison: chilling tank, 60 gallons; centrifuge, 30 gallons. 2:1 tank-to-centrifuge capacity."
            width={1536}
            height={1024}
            sizes="(max-width: 800px) 100vw, 620px"
          />
        </figure>
        <div className="b60-workflow-history">
          <div>
            <p className="b60-kicker">From ACP-30 to BLAST 60/45</p>
            <h3>More reserve for repeat cycles.</h3>
            <p>Perma Cool’s legacy ACP-30 put more than 200 units into the field and demonstrated the value of dedicated ethanol pre-chilling. At roughly 40 gallons, it was sized for basic single-pass centrifuge support.</p>
            <p>The BLAST 60/45 expands that reserve to 60 gallons, supporting a 30-gallon centrifuge through repeated extraction and re-chill cycles.</p>
          </div>
          <div>
            <p className="b60-kicker">Extraction → Re-chill → Repeat</p>
            <h3>Keep the ethanol in the workflow.</h3>
            <p>Returning ethanol mixes into the already-cold reserve instead of resetting the whole tank. Repeated extraction and re-chill cycles continue until the ethanol reaches roughly 2 to 3 lb of material per gallon, before moving to filtration and evaporation.</p>
          </div>
        </div>
        <figure className="b60-restored-image b60-performance-image">
          <ExpandableImage src="/images/generated/blast60-bear-card.png" alt="BLAST 60/45 performance graphic: 60 gallons to −40 °C in 45 minutes, 1.33 GPM flash chilling, direct refrigeration" label="Open full-size BLAST 60/45 performance graphic">
            <Image src="/images/generated/blast60-bear-card.png" alt="BLAST 60/45 performance graphic: 60 gallons to −40 °C in 45 minutes, 1.33 GPM flash chilling, direct refrigeration" width={1440} height={1040} sizes="(max-width: 800px) 100vw, 1000px" />
          </ExpandableImage>
          <figcaption>BLAST 60/45 · 60 gallons · −40 °C · 45 minutes · 1.33 GPM average</figcaption>
        </figure>
      </section>

      <section className="b60-spec-section" id="specifications">
        <div className="b60-wrap b60-section b60-spec-layout">
          <div><p className="b60-kicker">BLAST 60/45</p><h2>The specifications.</h2><p>Temperature performance depends on system configuration and facility conditions. Final specifications are subject to engineering review.</p></div>
          <dl className="b60-specs">{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </section>
      <section className="b60-wrap b60-section b60-ownership" id="ownership" aria-labelledby="b60-ownership-title">
        <div className="b60-heading">
          <div><p className="b60-kicker">ROI / Replacement</p><h2 id="b60-ownership-title">Electric chilling.<br />Less reliance on consumables.</h2></div>
          <p>A dedicated chilling system for operators moving away from consumables, slower legacy methods, or improvised cold-ethanol workflows.</p>
        </div>
        <div className="b60-ownership-layout">
          <figure className="b60-restored-image">
            <ExpandableImage src="/images/generated/roi-replacement.png" alt="Illustration of the transition from consumable cooling to electric industrial chilling" label="Open full-size electric chilling illustration">
              <Image src="/images/generated/roi-replacement.png" alt="Illustration of the transition from consumable cooling to electric industrial chilling" width={1448} height={1086} sizes="(max-width: 800px) 100vw, 680px" />
            </ExpandableImage>
          </figure>
          <div className="b60-ownership-copy">
            <h3>Replace recurring consumable spend with a serviceable system.</h3>
            <p>The BLAST 60/45 provides dedicated electric chilling for repeatable low-temperature performance, faster recovery between cycles, and simpler day-to-day operation.</p>
            <ul>
              <li><Check size={18} aria-hidden="true" /><span>Reduce dependence on recurring consumables.</span></li>
              <li><Check size={18} aria-hidden="true" /><span>Support faster re-chilling and repeat-cycle extraction.</span></li>
              <li><Check size={18} aria-hidden="true" /><span>Use serviceable, common-sized components to help lower long-term ownership cost.</span></li>
            </ul>
            <p>For operators replacing legacy cooling, the goal is lower operating cost, better throughput, and a more reliable production workflow.</p>
            <a className="b60-text-link" href="/direct-refrigerant-vs-ln2">Compare cooling methods <ArrowUpRight size={17} /></a>
          </div>
        </div>
      </section>
      <LearningCenterSection />
      <section className="b60-wrap b60-resources" aria-labelledby="b60-resources-title">
        <h2 id="b60-resources-title">Related articles</h2>
        <a href="/direct-refrigerant-vs-ln2">Direct refrigerant vs. LN2 <ArrowUpRight size={19} /></a>
        <a href="/industrial-process-chiller-maintenance">Chiller maintenance guide <ArrowUpRight size={19} /></a>
      </section>
      <section className="b60-contact">
        <div className="b60-wrap">
          <div><p className="b60-kicker">Plan your BLAST 60/45</p><h2>Let’s match the system<br />to your production.</h2><p>Tell us your centrifuge size, cycle schedule, and available power. We’ll help confirm system fit, pricing, and lead time.</p></div>
          <a className="b60-button" href={pricingHref}>Contact us for pricing <ArrowRight size={18} /></a>
        </div>
      </section>
    </main>
  );
}
