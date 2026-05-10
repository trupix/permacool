import Image from "next/image";
import {
  ArrowRight,
  Beaker,
  CheckCircle2,
  Cpu,
  Fan,
  FlaskConical,
  Gauge,
  Layers,
  Mail,
  Phone,
  Snowflake,
  ThermometerSnowflake,
  TrendingUp,
  Zap
} from "lucide-react";
import LearningCenterSection from "../components/LearningCenterSection";
import { InsightsHeader } from "../insights/InsightsShell";

export const metadata = {
  title: "Ethanol Chillers for Extraction Facilities | Perma Cool BLAST Systems",
  description:
    "Explore Perma Cool BLAST ethanol pre-chiller systems for direct refrigerant chilling, -40 °C operation, reduced LN2 dependence, and commercial extraction throughput."
};

const seriesLinks = [
  ["BLAST 60/45", "/ethanol-chiller-blast-60"],
  ["BLAST 150/45", "/ethanol-chiller-blast-150"],
  ["BLAST 240/45", "/ethanol-chiller-blast-240"]
];

const performancePoints = [
  {
    icon: ThermometerSnowflake,
    title: "-40 °C operation",
    body: "Rapid purpose-built hot-to-cold chilling from room temperature to -40 °C."
  },
  {
    icon: Beaker,
    title: "Increase solution saturation",
    body: "Enables processors to reach biomass-to-ethanol ratios up to 3:1."
  },
  {
    icon: Gauge,
    title: "Increase speed, accuracy, and efficiency",
    body: "Re-chill and re-extract at -40 °C with repeatable process control."
  },
  {
    icon: TrendingUp,
    title: "Make more money",
    body: "Ditch LN2 and dry ice consumables and move cooling spend into planned utility operation."
  },
  {
    icon: Layers,
    title: "Built to feed multiple centrifuges",
    body: "Drastically increase your BLAST with a BLAST chiller, then double that with a second centrifuge."
  },
  {
    icon: Snowflake,
    title: "High pull-down speed",
    body: "Designed for fast chilling cycles in commercial production environments."
  },
  {
    icon: Cpu,
    title: "PLC + HMI control",
    body: "On-screen monitoring, compressor protection, and clearer system visibility."
  },
  {
    icon: Fan,
    title: "HVAC condenser integration",
    body: "Efficient direct chilling architecture built to reduce operational overhead."
  }
];

const metrics = [
  {
    label: "Series 01",
    title: "BLAST 60/45",
    body: "Compact unit sized for 30-gallon centrifuge workflows and rapid room-temp to -40 °C pull-down."
  },
  {
    label: "Series 02",
    title: "BLAST 150/45",
    body: "Production-ready configuration for high-throughput ethanol extraction."
  },
  {
    label: "Series 03",
    title: "BLAST 240/45",
    body: "Large process-class option with the same direct refrigerant control philosophy."
  },
  {
    label: "Commercial Value",
    title: "Less Consumable Drag",
    body: "Replace recurring cryogenic supply complexity with electricity and planned maintenance."
  }
];

const flowStories = [
  {
    title: "Chill",
    body:
      "FAST - Purpose built direct refrigeration for speed. Nothing compares to the Perma Cool BLAST series pulldown speed in the entire extraction industry. Fast, consistent, reliable, electric ethanol chilling without consumables makes you MORE MONEY.",
    callout: "No consumables = MORE MONEY"
  },
  {
    title: "Extract",
    body:
      "Built to re-chill, re-run, the same ethanol always at temp. The BLAST series enables processors to achieve biomass-to-ethanol ratios up to 3:1. The result is a more saturated ethanol solution moving downstream, with the potential to recover up to 3x more crude for every gallon of ethanol evaporated.",
    callout: "Ratio 3lbs biomass : 1gallon ethanol"
  },
  {
    title: "Repeat",
    body:
      "For facilities planning around multiple centrifuges or expanded extraction capacity, Perma Cool can help scope a BLAST configuration matched to flow rate, utility profile, and uptime requirements.",
    bullets: [
      "Configured around throughput goals",
      "Supports scaling beyond single-line production",
      "Built around real process constraints"
    ]
  }
];

const products = [
  {
    eyebrow: "Compact Production",
    title: "BLAST 60/45",
    image: "/images/generated/blast60-flash-chilling.png",
    href: "/ethanol-chiller-blast-60",
    cta: "View BLAST 60/45",
    copy:
      "With over 200 original Legacy ACP-30 units in the field, the BLAST 60/45 is the updated and upgraded evolution of a proven design. Tested, trusted, and built for demanding extraction environments, it has earned its place as a true industry workhorse.",
    meta: ["60 gallons", "45 minutes", "30-gallon centrifuge workflow"],
    bullets: [
      "Flash-chill 60 gallons of room-temperature ethanol down to -40 °C in 45 minutes. You can run less.",
      "Fast pull-down to target low-temp process windows.",
      "Designed with readily available parts to keep repairs fast and affordable."
    ]
  },
  {
    eyebrow: "Mid-Scale Production",
    title: "BLAST 150/45",
    image: "/images/generated/blast150-flash-chilling-purple.png",
    href: "/ethanol-chiller-blast-150",
    cta: "View BLAST 150/45",
    copy:
      "A strong fit for teams that need commercial-scale ethanol chilling with fast pull-down, repeatable re-chill performance, and room to support growing production schedules.",
    meta: ["150-gallon process class", "Direct refrigerant architecture", "PLC/HMI visibility"],
    bullets: [
      "Designed for high-throughput ethanol extraction.",
      "Fast pull-down to target low-temp process windows.",
      "Designed with readily available parts to keep repairs fast and affordable."
    ]
  },
  {
    eyebrow: "Large Process Class",
    title: "BLAST 240/45",
    image: "/images/generated/blast240-flash-chilling.png",
    href: "/ethanol-chiller-blast-240",
    cta: "View BLAST 240/45",
    copy:
      "A strong fit for teams that need commercial-scale ethanol chilling with fast pull-down, repeatable re-chill performance, and room to support growing production schedules.",
    meta: ["240-gallon process class", "HVAC condenser integration", "Compressor protection logic"],
    bullets: [
      "Designed for high-throughput ethanol extraction.",
      "Fast pull-down to target low-temp process windows.",
      "Designed with readily available parts to keep repairs fast and affordable."
    ]
  }
];

const applicationFit = [
  "Botanical extraction facilities scaling beyond pilot throughput.",
  "Teams transitioning from LN2-heavy cooling operations.",
  "Operators prioritizing predictable batch temperature control."
];

const faqs = [
  {
    question: "What temperature range do Perma Cool ethanol chillers target?",
    answer:
      "Typical process targets include operation down to approximately -40 °C depending on system configuration and facility conditions."
  },
  {
    question: "Why choose direct refrigerant chilling over LN2?",
    answer:
      "Direct refrigerant systems can lower recurring consumable costs while delivering stable, repeatable process cooling for extraction lines."
  },
  {
    question: "How quickly can this be deployed?",
    answer:
      "Lead times vary by configuration; Perma Cool aligns scope early to reduce procurement friction and commissioning surprises."
  }
];

const quoteConfidence = [
  "Process-fit recommendations based on throughput, temperature target, and utility constraints.",
  "No generic one-size quote sheets.",
  "Sized for present demand plus near-term growth.",
  "Commissioning sequence guidance included."
];

export default function EthanolChillingSystemsPage() {
  return (
    <main className="site-shell ethanol-systems-page">
      <InsightsHeader />
      <section className="ecs-hero">
        <Image
          src="/images/generated/ethanol-systems-hero.png"
          alt="Perma Cool ethanol chilling system in a clean industrial facility"
          fill
          priority
          className="ecs-hero-image"
          sizes="100vw"
        />
        <div className="ecs-hero-overlay" />
        <div className="ecs-hero-content">
          <p className="eyebrow">Direct Refrigerant Ethanol Chilling</p>
          <p className="ecs-series-title">Perma Cool BLAST Ethanol Pre-Chiller Series</p>
          <h1>Flash chill ethanol to -40 °C and keep extraction moving.</h1>
          <div className="ecs-series-links" aria-label="BLAST product pages">
            {seriesLinks.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="hero-actions">
            <a className="button primary" href="/contact-us">
              Request a custom recommendation
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="/direct-refrigerant-vs-ln2">
              Compare against LN2
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="ecs-profile">
        <div className="ecs-profile-card">
          <span className="micro-label">Core Performance Profile</span>
          <h2>Purpose-built chilling for extraction-ready ethanol.</h2>
          <ul>
            {performancePoints.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <Icon size={20} aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  {body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ecs-metric-band">
        <div className="ecs-metrics">
          {metrics.map((item) => (
            <article className="ecs-metric" key={item.title}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section ecs-flow-section">
        <div className="section-heading">
          <p className="eyebrow">Why BLAST Changes Extraction Flow</p>
          <h2>Chill, Extract, Repeat</h2>
          <a className="button primary ecs-heading-cta" href="/workflow">
            Workflow Breakdown
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="ecs-flow-grid">
          {flowStories.map((story) => (
            <article className="ecs-flow-card" key={story.title}>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
              {story.callout ? <strong className="ecs-flow-callout">{story.callout}</strong> : null}
              {story.bullets ? (
                <ul>
                  {story.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="section ecs-lineup">
        <div className="section-heading">
          <p className="eyebrow">BLAST Product Lineup</p>
          <h2>Not just a chiller, full turnkey chilling solutions.</h2>
          <p>One system, 3 dimensional solution.</p>
          <div className="ecs-solution-chips" aria-label="Turnkey solution areas">
            <span>Process side</span>
            <span>Refrigeration side</span>
            <span>Control side</span>
          </div>
        </div>

        <div className="ecs-product-grid">
          {products.map((product) => (
            <article className="ecs-product-card" key={product.title}>
              <div className="ecs-product-media">
                <Image
                  src={product.image}
                  alt=""
                  width={720}
                  height={520}
                  className={product.image.includes("flash-chilling") ? "ecs-product-spec-image" : undefined}
                />
              </div>
              <div className="ecs-product-copy">
                <p className="pill">{product.eyebrow}</p>
                <h3>{product.title}</h3>
                <p>{product.copy}</p>
                <div className="ecs-product-meta">
                  {product.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <ul>
                  {product.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <a className="inline-link" href={product.href}>
                  {product.cta}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section ecs-advantage">
        <div className="section-heading narrow">
          <p className="eyebrow">Application Fit</p>
          <h2>Built for teams scaling ethanol extraction capacity.</h2>
        </div>
        <div className="ecs-fit-grid">
          {applicationFit.map((item) => (
            <article className="ecs-fit-card" key={item}>
              <FlaskConical size={22} aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ecs-workflow">
        <div className="ecs-workflow-inner">
          <div>
            <p className="eyebrow">Workflow Story</p>
            <h2>Move the page from cold equipment to operational advantage.</h2>
          </div>
          <div className="ecs-workflow-copy">
            <p>
              The Perma Cool BLAST Ethanol Pre-Chiller Series is purpose-built for ethanol extraction labs that need
              fast, on-demand direct chilling from room temperature to -40 °C. Engineered as a true BLAST chiller from
              the condensing through the process side, it helps processors increase throughput, reduce LN2 dependency,
              and optimize their extraction workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="section ecs-faq-section">
        <div className="section-heading">
          <p className="eyebrow">Frequently Asked Questions</p>
          <h2>Answers buyers need before they request pricing.</h2>
        </div>
        <div className="ecs-faq-grid">
          {faqs.map((faq) => (
            <article className="ecs-faq-card" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ecs-quote-band">
        <div>
          <p className="eyebrow">Quote Confidence</p>
          <h2>Process-fit recommendations based on your throughput, temp target, and utility constraints.</h2>
        </div>
        <ul>
          {quoteConfidence.map((item) => (
            <li key={item}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <LearningCenterSection />

      <section className="related-section ecs-related">
        <div>
          <p className="eyebrow">Building Out Ethanol Chilling Capacity?</p>
          <h2>Get chiller recommendations before the quote conversation gets too generic.</h2>
          <p>Capture system interest, batch profile, facility notes, and expansion goals before pricing is discussed.</p>
          <div className="ecs-related-reading">
            <a href="/direct-refrigerant-vs-ln2">Direct Refrigerant vs LN2</a>
            <a href="/how-to-reduce-ln2-dependence">How to Reduce LN2 Dependence</a>
          </div>
        </div>
        <div className="related-actions">
          <a className="button primary" href="/contact-us">
            Request Chiller Pricing
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="tel:+17472081001">
            Call Engineering
            <Phone size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="/cooling-system-design-checklist">
            Review design checklist
            <Zap size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <img src="/images/brand/perma-cool.png" alt="PermaCool" />
        <p>&copy; 2026 Perma Cool Systems Inc.</p>
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
