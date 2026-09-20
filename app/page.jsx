import Image from "next/image";
import { ArrowDown, ArrowRight, FlaskConical, Snowflake, Thermometer, MoveUpRight, SlidersHorizontal, Ruler, BookOpen } from "lucide-react";
import { InsightsHeader } from "./insights/InsightsShell";
import { externalLearningResources, navItems } from "./insights/insights-data";
import HomeMobileNav from "./components/HomeMobileNav";
import { buildPublicPageMetadata } from "../lib/site";
import { buildContactHref } from "../lib/contact";
import "./home-design.css";

const homepageQuoteHref = buildContactHref({ requestType: "Quote", source: "homepage" });
const blastSystems = [
  { title: "BLAST 60/45", href: "/ethanol-chiller-blast-60" },
  { title: "BLAST 150/45", href: "/ethanol-chiller-blast-150" },
  { title: "BLAST 150/30", href: "/ethanol-chiller-blast-150-30" },
  { title: "BLAST 240/45", href: "/ethanol-chiller-blast-240" }
];

export const metadata = buildPublicPageMetadata({
  path: "/",
  title: "Perma Cool | Ethanol Extraction Chillers & Split-System Lab Process Cooling",
  description: "Purpose-built cooling for extraction and laboratory processes. Explore BLAST ethanol chillers, butane recovery systems, and PERMA Lab Process split-system chillers with remote condensers.",
  image: "/images/brand/permacool-social-card.jpg"
});

export default function HomePage() {
  return (
    <main className="site-shell perma-home">
      <InsightsHeader />
      <HomeMobileNav navItems={navItems} />
      <section className="ph-hero" aria-labelledby="ph-title">
        <div className="ph-hero-stage">
          <div className="ph-hero-backdrop">
            <Image src="/images/generated/permacool-process-studio-hero-v2.png" alt="Perma Cool equipment visualization: stainless steel chilling tank and two separate condenser units in a clean dark studio" fill priority fetchPriority="high" sizes="100vw" />
          </div>
          <div className="ph-hero-shade" aria-hidden="true" />
        <div className="ph-hero-grid ph-wrap">
          <div className="ph-hero-copy">
            <p className="ph-kicker"><span /> Purpose-built process cooling</p>
            <h1 id="ph-title">Extraction chillers<br /> and lab process cooling — <em>split systems<br className="ph-desktop-break" /> sized to the job.</em></h1>
            <p className="ph-lead">BLAST™ flash-chills ethanol for extraction. PERMA Lab Process™ cools water/glycol loops for instruments and process equipment, with the condenser outside the lab.</p>
            <div className="ph-actions">
              <a className="ph-button ph-button-bright" href="#systems">Find your system <ArrowDown size={18} aria-hidden="true" /></a>
              <a className="ph-text-link" href={homepageQuoteHref}>Request pricing <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
          <p className="ph-hero-caption">Perma Cool <span>Equipment visualization</span></p>
        </div>
        <div className="ph-family-navigation">
          <nav className="ph-family-strip ph-wrap" aria-label="Explore product families">
            <a href="#extraction"><span><small>For extraction production</small><strong>Extraction Chillers</strong></span><ArrowDown size={22} aria-hidden="true" /></a>
            <a href="#lab-process"><span><small>For laboratory temperature control</small><strong>PERMA Lab Process™</strong></span><ArrowDown size={22} aria-hidden="true" /></a>
          </nav>
        </div>
      </section>

      <section className="ph-families ph-wrap" id="systems" aria-labelledby="ph-systems-title">
        <div className="ph-section-heading">
          <div><p className="ph-kicker">Choose your application</p><h2 id="ph-systems-title">Two product lines.<br /> Two jobs.</h2></div>
          <p>Extraction gets BLAST™. Labs and process equipment get PERMA Lab Process™. Pick the line that matches the fluid and temperature you actually run.</p>
        </div>
        <div className="ph-family-grid">
          <article className="ph-family-card ph-extraction" id="extraction">
            <div className="ph-card-topline"><span>01 / Extraction</span><Snowflake size={24} aria-hidden="true" /></div>
            <div className="ph-card-heading"><h3>Extraction Chillers</h3><p>Cooling for ethanol extraction.<br />Recovery systems for butane.</p></div>
            <figure className="ph-family-image ph-extraction-image">
              <Image src="/images/generated/blast15030/desert-system-hero.png" alt="BLAST 150/30 with separate 22 HP primary and 6 HP cascade condenser units in a desert setting" width={1858} height={846} sizes="(max-width: 760px) 100vw, 50vw" />
              <figcaption>BLAST 150/30 · Cascade system design</figcaption>
            </figure>
            <div className="ph-family-links">
              <a href="/ethanol-chilling-systems"><span><strong>Ethanol Chilling Systems</strong><small>Explore the BLAST series and compare system sizes.</small></span><ArrowRight size={22} aria-hidden="true" /></a>
              <a href="/butane-recovery-system"><span><strong>Butane Recovery Systems</strong><small>Equipment for commercial BHO recovery workflows.</small></span><ArrowRight size={22} aria-hidden="true" /></a>
            </div>
          </article>
          <article className="ph-family-card ph-lab" id="lab-process">
            <div className="ph-card-topline"><span>02 / Laboratory</span><FlaskConical size={24} aria-hidden="true" /></div>
            <div className="ph-card-heading"><h3>PERMA Lab Process™</h3><p>High-capacity process cooling.<br /> Condenser heat stays out of the lab.</p></div>
            <figure className="ph-family-image ph-lab-image">
              <Image src="/images/generated/blast15030/regeneration-unit-isolated.png" alt="Stainless steel tank and plate heat exchanger skid shown as a design reference for PERMA Lab Process" width={1672} height={941} sizes="(max-width: 760px) 100vw, 50vw" />
              <figcaption>Skid design reference · Final equipment may differ</figcaption>
            </figure>
            <div className="ph-lab-details"><span>Water / glycol process loops</span><span>Remote outdoor condenser</span><span>Mid-temp standard · low-temp to −40 °C optional*</span></div>
            <div className="ph-family-links"><a href="/perma-lab-process"><span><strong>Explore Lab Process</strong><small>Indoor process skid + outdoor condenser. Built for shared instrument loops, lasers, analytical gear, and wet-lab process loads — not bench recirculators.</small></span><ArrowRight size={22} aria-hidden="true" /></a></div>
            <p className="ph-note">*Temperature capability depends on configuration, fluid, and process load.</p>
          </article>
        </div>
      </section>

      <section className="ph-lineup ph-wrap" aria-labelledby="ph-lineup-title">
        <div><p className="ph-kicker">Already know your BLAST?</p><h2 id="ph-lineup-title">Go straight to your system.</h2><a className="ph-text-link" href="/ethanol-chiller-comparison">Compare ethanol chillers <ArrowRight size={16} aria-hidden="true" /></a></div>
        <div className="ph-model-links">{blastSystems.map((system) => <a key={system.href} href={system.href}><span>{system.title}</span><MoveUpRight size={18} aria-hidden="true" /></a>)}</div>
      </section>

      <section className="ph-planning" aria-labelledby="ph-planning-title">
        <div className="ph-wrap ph-planning-grid">
          <div><p className="ph-kicker">Start with your process</p><h2 id="ph-planning-title">Send four numbers.<br /> We’ll map<br /><em> a layout.</em></h2><p>Setpoint, heat load, fluid/flow, and where the condenser can sit. That’s enough to start.</p><a className="ph-button ph-button-bright" href={homepageQuoteHref}>Talk through your project <ArrowRight size={18} aria-hidden="true" /></a></div>
          <div className="ph-planning-steps">
            <article><span>01</span><Thermometer size={25} aria-hidden="true" /><div><h3>What fluid and what setpoint?</h3><p>Water, glycol, or ethanol — starting temp and target temp.</p></div></article>
            <article><span>02</span><SlidersHorizontal size={25} aria-hidden="true" /><div><h3>What load and what flow?</h3><p>Heat load (kW or tons), required GPM, and how often you cycle.</p></div></article>
            <article><span>03</span><Ruler size={25} aria-hidden="true" /><div><h3>Where does the condenser go?</h3><p>Lab-side footprint, power, and outdoor or remote condenser placement.</p></div></article>
          </div>
        </div>
      </section>

      <section className="ph-resources ph-wrap" aria-labelledby="ph-resources-title">
        <div className="ph-section-heading"><div><p className="ph-kicker">A closer look</p><h2 id="ph-resources-title">Understand the system.<br />Plan your next step.</h2></div></div>
        <div className="ph-resource-grid">
          <a href="/learning-center"><BookOpen size={26} aria-hidden="true" /><span className="ph-resource-type">Guides & articles</span><h3>Learn the science<br />behind the cold.</h3><p>Explore temperature, extraction workflows, chilling methods, and system planning.</p><span className="ph-text-link">Visit the Learning Center <ArrowRight size={18} aria-hidden="true" /></span></a>
          <a href={externalLearningResources[0].articleUrl} target="_blank" rel="noreferrer"><SlidersHorizontal size={26} aria-hidden="true" /><span className="ph-resource-type">Opto 22 / Independent case study</span><h3>Inside Perma Cool’s<br />control systems.</h3><p>Read how Perma Cool brought industrial controls in-house to support diagnostics and service.</p><span className="ph-text-link">Read the case study <MoveUpRight size={18} aria-hidden="true" /><span className="ph-sr-only"> (opens in a new tab)</span></span></a>
        </div>
      </section>
      <section className="ph-contact ph-wrap"><div><p className="ph-kicker">Let’s size it up</p><h2>Tell us what<br />you need to cool.</h2></div><div><a className="ph-button ph-button-dark" href={homepageQuoteHref}>Contact us for pricing <ArrowRight size={18} aria-hidden="true" /></a><a className="ph-contact-phone" href="tel:+17472081001">Or call 747.208.1001</a></div></section>
    </main>
  );
}
