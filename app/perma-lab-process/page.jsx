import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Fan, FlaskConical, MapPin, Snowflake, Thermometer, Wind } from "lucide-react";
import { InsightsHeader } from "../insights/InsightsShell";
import StructuredData from "../components/StructuredData";
import { buildPublicPageMetadata } from "../../lib/site";
import { buildContactHref } from "../../lib/contact";
import "./lab-process.css";

export const metadata = buildPublicPageMetadata({
  path: "/perma-lab-process",
  title: "PERMA Lab Process™ | Split-System Process Chillers for Labs & Instruments",
  description: "Split-system lab process chillers for water/glycol instrument and equipment loops. Indoor process unit, outdoor remote condenser. Mid-temp duty standard; low-temp configs available down to −40 °C.",
  image: "/images/generated/blast15030/regeneration-unit-isolated.png"
});

const inquiry = buildContactHref({ interest: "Lab Process Chillers", product: "PERMA Lab Process", requestType: "System Fit Review", source: "perma-lab-process" });
const planning = [
  ["01", "Setpoint", "Target and start temp (°C)."],
  ["02", "Load", "Heat load (kW or tons) and pull-down or steady-state."],
  ["03", "Loop", "Fluid (water/glycol %), GPM, and pressure at the equipment."],
  ["04", "Site", "Power available, condenser location options, max line length/elevation."]
];

function SplitSystemVisual() {
  return (
    <div className="lab-schematic">
      <div className="lab-drawing-heading"><span>SPLIT-SYSTEM PROCESS COOLING</span><span>LOCATION CONCEPT / 01</span></div>
      <svg viewBox="0 0 860 490" role="img" aria-labelledby="lab-diagram-title lab-diagram-desc">
        <title id="lab-diagram-title">Process cooling in the lab, condenser at a remote location</title>
        <desc id="lab-diagram-desc">A conceptual lab-side chiller and separate remote condenser connected by refrigeration lines. Not an equipment rendering or installation drawing.</desc>
        <defs>
          <linearGradient id="lab-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d3e5e8"/><stop offset=".42" stopColor="#779197"/><stop offset="1" stopColor="#263c44"/></linearGradient>
          <linearGradient id="lab-panel" x1="0" x2="1"><stop stopColor="#364e56"/><stop offset="1" stopColor="#172c33"/></linearGradient>
          <radialGradient id="lab-cold"><stop stopColor="#8de9dc" stopOpacity=".3"/><stop offset="1" stopColor="#8de9dc" stopOpacity="0"/></radialGradient>
          <pattern id="lab-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#97b5bd" strokeOpacity=".09"/></pattern>
        </defs>
        <rect width="860" height="490" fill="url(#lab-grid)"/>
        <ellipse cx="240" cy="300" rx="200" ry="160" fill="url(#lab-cold)"/>
        <path d="M470 82V409" stroke="#78959d" strokeDasharray="4 8" strokeOpacity=".4"/>
        <g fill="#a8c0c6" fontSize="12" fontFamily="Arial, sans-serif" letterSpacing="2"><text x="67" y="63">LAB / PROCESS SIDE</text><text x="532" y="63">REMOTE CONDENSER</text></g>
        <path d="M102 364l147-50 143 64-147 49z" fill="#08171c" stroke="#52737e"/>
        <path d="M151 145l95-28 91 37-100 30z" fill="url(#lab-metal)" stroke="#afc9cf"/>
        <path d="M151 145v204l86 37V184z" fill="#3b555e" stroke="#76959e"/>
        <path d="M237 184l100-30v203l-100 29z" fill="url(#lab-panel)" stroke="#78969e"/>
        <path d="M250 198l71-22v50l-71 21z" fill="#081a22" stroke="#668d98"/>
        <path d="M260 227l10-5 10 2 8-17 9 8 14-8" fill="none" stroke="#9beddd" strokeWidth="2"/>
        <path d="M250 274l72-22m-72 33l72-22m-72 33l72-22m-72 33l72-22" stroke="#69818a" strokeWidth="3"/>
        <path d="M167 353v18m58 16v16m99-45v17" stroke="#a3bcc0" strokeWidth="7"/>
        <circle cx="329" cy="325" r="5" fill="#9beddd"/>
        <path d="M337 312h80q17 0 17-17v-82q0-17 17-17h99" className="lab-refrigerant-line" fill="none" stroke="#8ce0d0" strokeWidth="3"/>
        <path d="M337 329h96q17 0 17-17v-82q0-17 17-17h83" fill="none" stroke="#c8d4d4" strokeOpacity=".5" strokeWidth="2"/>
        <path d="M510 328l161-44 137 59-159 44z" fill="#08171c" stroke="#52737e"/>
        <path d="M550 148l164-33 68 33-166 36z" fill="url(#lab-metal)" stroke="#afc9cf"/>
        <path d="M550 148v168l66 32V184z" fill="#344c55" stroke="#78969e"/>
        <path d="M616 184l166-36v167l-166 33z" fill="url(#lab-panel)" stroke="#8aa7af"/>
        <g fill="#0b2028" stroke="#69858e"><ellipse cx="661" cy="263" rx="29" ry="48" transform="rotate(7 661 263)"/><ellipse cx="737" cy="247" rx="29" ry="48" transform="rotate(7 737 247)"/></g>
        <g fill="none" stroke="#b3c8cb" strokeWidth="2"><path d="M661 263l-18-22m18 22l16-32m-16 32l17 24m-17-24l-18 32M737 247l-18-22m18 22l16-32m-16 32l17 24m-17-24l-18 32"/></g>
        <g fill="#bed0d3"><circle cx="661" cy="263" r="6"/><circle cx="737" cy="247" r="6"/></g>
        <path d="M557 321v18m63 10v19m154-51v19" stroke="#a3bcc0" strokeWidth="7"/>
        <g className="lab-heat-lines" fill="none" stroke="#d8bc84" strokeWidth="2" strokeLinecap="round"><path d="M638 126q-12-13 0-26t0-26"/><path d="M671 119q-12-13 0-26t0-26"/><path d="M704 113q-12-13 0-26t0-26"/></g>
        <g fontFamily="Arial, sans-serif" fontSize="13"><text x="142" y="457" fill="#a6eee0">Process cooling</text><text x="369" y="374" fill="#b5cbd0">Refrigeration lines</text><text x="599" y="426" fill="#d8bc84">Heat rejection</text></g>
      </svg>
      <p className="lab-drawing-note">Conceptual arrangement · Not an equipment or installation drawing</p>
    </div>
  );
}

export default function LabProcessPage() {
  return (
    <main className="site-shell lab-page">
      <StructuredData data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "WebPage", "@id": "https://perma.cool/perma-lab-process#webpage", url: "https://perma.cool/perma-lab-process", name: "PERMA Lab Process™ | Split-System Process Chillers for Labs & Instruments", description: "Split-system lab process chillers for water/glycol instrument and equipment loops. Indoor process unit, outdoor remote condenser. Mid-temp duty standard; low-temp configs available down to −40 °C.", about: { "@type": "Thing", name: "Split-system laboratory process cooling" }, publisher: { "@id": "https://perma.cool/#organization" } },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Perma Cool", item: "https://perma.cool/" }, { "@type": "ListItem", position: 2, name: "PERMA Lab Process", item: "https://perma.cool/perma-lab-process" }] }
      ] }}/>
      <InsightsHeader/>
      <section className="lab-hero" aria-labelledby="lab-title">
        <div className="lab-wrap lab-hero-top"><p className="lab-kicker"><span/> PRODUCT LINE · NOT BLAST™</p><span className="lab-hero-index">LAB &amp; PROCESS COOLING · WATER / GLYCOL</span></div>
        <div className="lab-wrap lab-hero-grid">
          <div className="lab-hero-copy">
            <p className="lab-product-name">PERMA <span>Lab Process</span><sup>™</sup></p>
            <h1 id="lab-title">Process cooling in the lab.<br/><em> Heat rejection outside.</em></h1>
            <p className="lab-lead">PERMA Lab Process™ is a split-system process chiller for labs and production floors: a lab-side unit on your water or glycol loop, and a remote condenser that rejects heat outdoors. Sized for high-capacity lab and process loads — large closed-loop systems, multi-tool or facility loops, and production-floor cooling — not small bench recirculators.</p>
            <div className="lab-actions"><a className="lab-button lab-button-primary lab-discuss-cta" href={inquiry}>Discuss your lab process <ArrowUpRight size={18} aria-hidden="true"/></a><a className="lab-text-link" href="#split-system">Explore the system <ArrowDown size={16}/></a></div>
            <p className="lab-fineprint">Temperature capability depends on configuration, process load, and operating conditions.</p>
          </div>
          <figure className="lab-hero-equipment"><span className="lab-equipment-tag">PROCESS-SIDE PLATFORM</span><Image src="/images/generated/blast15030/regeneration-unit-isolated.png" alt="Perma Cool stainless steel tank and plate heat-exchanger skid, shown as reference equipment for the Lab Process line" width={1672} height={941} priority sizes="(max-width: 1100px) 95vw, 700px"/><figcaption>Existing Perma Cool skid shown as a design reference.<br/>Final Lab Process equipment and configuration may differ.</figcaption></figure>
        </div>
        <div className="lab-wrap lab-hero-specs"><div><FlaskConical/><span>LINE ·<span>Lab &amp; process (separate from BLAST™)</span></span></div><div><Thermometer/><span>DUTY ·<span>Mid-temp first · low-temp to −40 °C optional</span></span></div><div><Fan/><span>LAYOUT ·<span>Indoor process + remote condenser</span></span></div></div>
      </section>

      <nav className="lab-section-nav" aria-label="Lab Process page sections"><div className="lab-wrap"><a href="#split-system">Split system</a><a href="#temperature">Temperature range</a><a href="#planning">Process fit</a><a href={inquiry}>Contact Perma Cool <ArrowUpRight size={15}/></a></div></nav>

      <section className="lab-wrap lab-section lab-architecture" id="split-system" aria-labelledby="lab-architecture-title">
        <div className="lab-section-heading"><p className="lab-kicker">01 / THE ARCHITECTURE</p><h2 id="lab-architecture-title">Lab-side process unit.<br/><em> Remote condenser.</em></h2><p>Put the evaporator/process side next to the equipment loop. Put the condenser outdoors or in a mechanical space. Line length, elevation, and ambient are part of the design — not afterthoughts.</p></div>
        <div className="lab-location-cards">
          <article><span className="lab-location-number">01</span><FlaskConical size={30}/><p className="lab-kicker">AT THE PROCESS</p><h3>Lab-side chiller</h3><p>Delivers setpoint and flow to your loop or equipment. Capacity, pump curve, and fluid (water/glycol) are selected from your heat load and GPM — not a one-size bath cooler.</p><span className="lab-card-foot"><MapPin size={15}/> Positioned for your workflow</span></article>
          <div className="lab-connection" aria-label="Connected by refrigeration lines"><span/>Refrigeration lines<span/></div>
          <article><span className="lab-location-number">02</span><Wind size={30}/><p className="lab-kicker">AT THE REMOTE LOCATION</p><h3>Remote condenser</h3><p>Rejects condenser heat away from the lab so you are not dumping kW into room HVAC. Placement depends on ambient, airflow, service access, and line routing.</p><span className="lab-card-foot"><MapPin size={15}/> Planned around your facility</span></article>
        </div>
      </section>

      <section className="lab-wrap lab-section lab-built-for" aria-labelledby="lab-built-for-title">
        <h2 id="lab-built-for-title">Built for</h2>
        <ul>
          <li>High-capacity closed-loop process cooling</li>
          <li>Multi-tool and facility-scale lab loops</li>
          <li>Production and pilot-process heat loads</li>
          <li>Sites that need condenser heat and noise out of the lab</li>
        </ul>
        <p>Not a small bench recirculator. Not an ethanol BLAST™ skid with a new label.</p>
      </section>

      <section className="lab-wrap lab-split-visual" aria-label="Split-system process arrangement"><SplitSystemVisual/><div><p className="lab-kicker">COOL THE LOOP. DON’T HEAT THE LAB.</p><h2>Put the heat<br/>somewhere else.</h2><p>Packaged chillers dump condenser heat into the room you just paid to air-condition. A remote condenser moves that load outside so the lab stays on process cooling, not fighting the HVAC.</p><p className="lab-fineprint-light">Final lab footprint, condenser location, and facility cooling needs depend on the selected configuration and installation.</p></div></section>

      <section className="lab-equipment-section"><div className="lab-wrap lab-equipment-grid"><figure><Image src="/images/generated/blast60-component-02-flux-box-wall.png" alt="Existing Perma Cool wall-mounted plate heat-exchanger assembly used as a Lab Process design reference" width={1477} height={1066} sizes="(max-width: 680px) 95vw, 650px"/><figcaption>Existing plate-system reference · Final configuration to be confirmed</figcaption></figure><div><p className="lab-kicker">A FAMILIAR PLATFORM. A NEW LAB FOCUS.</p><h2>Skid and plate heat-exchanger platforms —<br/> configured for lab/process duty.</h2><p>Same industrial skid/plate DNA as Perma Cool’s process equipment, re-specified for lab and instrument loops: water/glycol fluids, mid-temp setpoints, and facility condenser placement. Photos of existing skids are design references until Lab Process production units are photographed — final Lab Process hardware and ratings will differ from BLAST™ ethanol skids.</p><p>We size the indoor footprint to your aisle and utilities, then place the condenser where ambient and service access allow.</p><a className="lab-text-link" href={inquiry}>Talk through your layout <ArrowUpRight size={18}/></a></div></div></section>

      <section className="lab-temperature" id="temperature" aria-labelledby="lab-temperature-title"><div className="lab-wrap lab-section">
        <div className="lab-heading-row"><div><p className="lab-kicker">02 / TEMPERATURE DUTY</p><h2 id="lab-temperature-title">Pick the duty from the setpoint —<br/> not the lowest number on the brochure.</h2></div><p>Most lab/process loops run mid-temp water or glycol. Low-temp to −40 °C is available when the process actually needs it. We size capacity at <em>your</em> setpoint, not at a vanity cryo number.</p></div>
        <div className="lab-temperature-grid">
          <article><Thermometer size={26}/><span className="lab-range-label">MID-TEMPERATURE</span><h3>Mid-temperature<br/> (typical lab/process)</h3><p>For loops and equipment that hold roughly room-to-chilled setpoints (often ~5–35 °C depending on fluid and load). Share setpoint + kW/tons + GPM and we configure from there.</p><a className="lab-text-link" href={inquiry}>Define your temperature range <ArrowRight size={16}/></a></article>
          <article className="lab-low-temp"><Snowflake size={26}/><span className="lab-range-label">LOW-TEMPERATURE</span><p className="lab-temperature-number"><span>DOWN TO</span>−40<small>°C</small></p><p>For processes that must hold low setpoints, including down to −40 °C where the fluid and load allow. Capacity falls as setpoint drops — we confirm kW at the real operating point, not at mid-temp.</p><a className="lab-text-link" href={inquiry}>Discuss low-temperature duty <ArrowRight size={16}/></a></article>
        </div>
        <p className="lab-range-note">Final temperature range, cooling capacity, fluid compatibility, and installation requirements are configuration-specific.</p>
      </div></section>

      <section className="lab-wrap lab-section" id="planning" aria-labelledby="lab-planning-title">
        <div className="lab-heading-row"><div><p className="lab-kicker">03 / BUILT AROUND THE APPLICATION</p><h2 id="lab-planning-title">What we need<br/> to size the system.</h2></div><p>Four inputs. No RFQ novel required.</p></div>
        <div className="lab-planning-grid">{planning.map(([number,title,copy])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="lab-family"><div className="lab-wrap lab-family-grid"><div><p className="lab-kicker">THE RIGHT PRODUCT FAMILY</p><h2>Lab Process<br/> ≠ BLAST™.</h2></div><div><p><strong>PERMA Lab Process™</strong> = water/glycol (and compatible process fluids) for instruments and lab/process equipment, split indoor/outdoor.</p><p><strong>BLAST™</strong> = ethanol flash-chill for extraction (gallon class, pull-down to −40 °C). Different fluid, different buyers, different rating sheets.</p><a className="lab-text-link" href="/ethanol-chilling-systems">Looking for ethanol extraction chilling? <ArrowUpRight size={18}/></a></div></div></section>

      <section className="lab-wrap lab-section lab-faq" aria-labelledby="lab-faq-title"><div><p className="lab-kicker">A FEW USEFUL DETAILS</p><h2 id="lab-faq-title">Before we begin.</h2></div><div>
        <details><summary>What does “split-system process” mean?</summary><p>The process/evaporator side sits in or near the lab on your loop. The condenser sits elsewhere (typically outdoors). They connect with refrigeration lines. You get process cooling without parking the full heat-rejection load in the room.</p></details>
        <details><summary>Where can the remote condenser go?</summary><p>Condenser placement is established during planning. Available space, ventilation, ambient conditions, service access, and the distance and elevation between units all need to be reviewed.</p></details>
        <details><summary>Does every configuration operate at −40 °C?</summary><p>No. Mid-temp is the default lab/process duty. −40 °C is a low-temp configuration when the application, fluid, and load require it. Ask for capacity at your setpoint.</p></details>
      </div></section>

      <section className="lab-final"><div className="lab-wrap"><p className="lab-kicker">PERMA LAB PROCESS™</p><h2>Send setpoint, load, fluid/flow,<br/><em> and condenser location.</em></h2><p>Email or call with those four inputs — we’ll return a Lab Process layout, not a BLAST™ ethanol quote.</p><div className="lab-actions"><a className="lab-button lab-button-primary" href={inquiry}>Contact us about Lab Process <ArrowUpRight size={18}/></a><a className="lab-text-link" href="tel:+17472081001">747.208.1001</a></div><span className="lab-final-mark" aria-hidden="true"><Snowflake/></span></div></section>
    </main>
  );
}
