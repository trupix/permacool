import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, RefreshCw, Snowflake, Wrench } from "lucide-react";
import { InsightsHeader } from "./insights/InsightsShell";
import { buildContactHref } from "../lib/contact";
import "./ethanol-chiller-blast-60/blast60-design.css";

const pricingHref = buildContactHref({
  interest: "Ethanol Chillers", requestType: "Product Pricing",
  product: "BLAST 60/45", source: "ethanol-chiller-blast-60"
});

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
    body: "The wall-mounted heat exchanger connects the two refrigeration stages, allowing the secondary circuit to cool the primary circuit."
  },
  {
    number: "03", title: "PLC control system", role: "System control",
    image: "blast60-component-03-plc-control-system.png", width: 1600, height: 1100, alt: "BLAST 60/45 wall-mounted PLC control cabinet",
    body: "Centralized monitoring and control give operators visibility into the chilling process, with compressor protection logic built into the system."
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
  ["Centrifuge pairing", "30 gallons"], ["Refrigeration", "Dual-stage cascade · direct refrigerant"],
  ["Condensers", "2 × 6 HP"], ["Controls", "PLC/HMI with compressor protection logic"]
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
      <nav className="b60-nav" aria-label="BLAST 60/45 page sections">
        <a href="#components">Components</a><a href="#cascade">Cascade</a><a href="#workflow">Workflow</a><a href="#specifications">Specs</a>
      </nav>

      <section className="b60-section b60-wrap" id="components">
        <div className="b60-heading">
          <div><p className="b60-kicker">The equipment</p><h2>One system.<br />Four working parts.</h2></div>
          <p>Process-side chilling, wall-mounted heat exchange and controls, and two outdoor condensers.</p>
        </div>
        <div className="b60-components">
          {components.map((item) => (
            <article className={`b60-component b60-component-${item.number}`} key={item.number}>
              <a className="b60-component-image" href={`/images/generated/${item.image}`} target="_blank" rel="noreferrer" aria-label={`Open full-size image: ${item.title}`}>
                <Image src={`/images/generated/${item.image}`} alt={item.alt} width={item.width} height={item.height}
                  sizes={item.number === "01" ? "(max-width: 800px) 100vw, 760px" : "(max-width: 800px) 100vw, 410px"} />
                <span className="b60-expand" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </a>
              <div className="b60-component-copy">
                <p className="b60-kicker"><span>{item.number}</span> {item.role}</p>
                <h3>{item.title}</h3><p>{item.body}</p>
                {item.details && <ul className="b60-details">{item.details.map((detail) => <li key={detail}><Check size={16} aria-hidden="true" />{detail}</li>)}</ul>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="b60-cascade" id="cascade">
        <div className="b60-wrap b60-section">
          <div className="b60-heading">
            <div><p className="b60-kicker">How cascade works</p><h2>A chiller<br />for the chiller.</h2></div>
            <p>The primary circuit chills your ethanol. The secondary circuit cools the primary circuit, supporting low-temperature operation with two serviceable refrigeration stages.</p>
          </div>
          <figure className="b60-diagram">
            <a href="/images/generated/cascade-refrigerant-flow-ethanol-labels.png" target="_blank" rel="noreferrer" aria-label="Open full-size cascade flow diagram">
              <Image src="/images/generated/cascade-refrigerant-flow-ethanol-labels.png" alt="BLAST 60/45 refrigerant flow diagram showing the primary and cascade circuits and ethanol connections" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 1240px" />
            </a>
            <figcaption>Primary and cascade refrigeration circuits <span>Open image to view flow details <ArrowUpRight size={14} /></span></figcaption>
          </figure>
          <div className="b60-principles">
            <div><Snowflake aria-hidden="true" /><h3>Direct chilling</h3><p>The primary refrigeration circuit removes heat from the ethanol.</p></div>
            <div><RefreshCw aria-hidden="true" /><h3>Cascade support</h3><p>The secondary stage cools the primary circuit through the FluxBox.</p></div>
            <div><Wrench aria-hidden="true" /><h3>Serviceable components</h3><p>Common-sized refrigeration components simplify parts sourcing and maintenance.</p></div>
          </div>
        </div>
      </section>

      <section className="b60-wrap b60-section b60-workflow" id="workflow">
        <div>
          <p className="b60-kicker">Centrifuge pairing</p><h2>A cold reserve<br />for the next cycle.</h2>
          <p>A 60-gallon tank pairs with a 30-gallon centrifuge. Returning ethanol mixes into a reserve of already-cold ethanol, limiting the temperature rise and supporting re-chilling between extraction cycles.</p>
          <a className="b60-text-link" href="/workflow">Read the workflow breakdown article <ArrowUpRight size={17} /></a>
        </div>
        <div className="b60-ratio" aria-label="60-gallon ethanol tank paired with a 30-gallon centrifuge">
          <div><span>Chilling tank</span><strong>60<small>gallons</small></strong></div>
          <RefreshCw className="b60-ratio-arrow" size={30} aria-hidden="true" />
          <div><span>Centrifuge</span><strong>30<small>gallons</small></strong></div>
          <p>2:1 tank-to-centrifuge capacity</p>
        </div>
      </section>

      <section className="b60-spec-section" id="specifications">
        <div className="b60-wrap b60-section b60-spec-layout">
          <div><p className="b60-kicker">BLAST 60/45</p><h2>The specifications.</h2><p>Temperature performance depends on system configuration and facility conditions. Final specifications are subject to engineering review.</p></div>
          <dl className="b60-specs">{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </section>
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
