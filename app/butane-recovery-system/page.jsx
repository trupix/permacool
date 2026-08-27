import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Phone,
  ShieldCheck,
  Snowflake,
  Wrench
} from "lucide-react";
import LearningCenterSection from "../components/LearningCenterSection";
import StructuredData from "../components/StructuredData";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildPublicPageMetadata, buildServiceStructuredData } from "../../lib/site";

const butaneRecoveryDescription =
  "Perma Cool butane recovery systems for commercial BHO extraction labs, with process-zone planning, cooling integration, PLC/HMI visibility, and production support.";

export const metadata = buildPublicPageMetadata({
  path: "/butane-recovery-system",
  title: "Butane Recovery Systems for BHO Extraction | Perma Cool",
  description: butaneRecoveryDescription,
  image: "/images/generated/bho-blast15-bear-card.png"
});

const butaneRecoveryStructuredData = buildServiceStructuredData({
  path: "/butane-recovery-system",
  name: "Perma Cool Butane Recovery Systems",
  serviceType: "Commercial butane recovery system design and integration",
  description: butaneRecoveryDescription,
  image: "/images/generated/bho-blast15-bear-card.png"
});

const heroStats = [
  {
    label: "BHO",
    title: "Recovery Support",
    body: "Built for extraction labs that need repeatable recovery performance and a clearer operating plan."
  },
  {
    label: "PLC",
    title: "Operator Visibility",
    body: "Controls planning can include HMI visibility, monitoring, and practical production feedback."
  },
  {
    label: "Fit",
    title: "Process Matched",
    body: "Scoped around duty cycle, solvent handling, facility utilities, and recovery throughput goals."
  }
];

const capabilityCards = [
  {
    icon: Layers,
    title: "Process-zone architecture",
    body:
      "Recovery performance depends on how chilling, heat exchange, solvent movement, and controls work together. Perma Cool helps plan the system as one production workflow."
  },
  {
    icon: Snowflake,
    title: "Cooling integration",
    body:
      "Butane recovery places real load on process cooling. The system plan accounts for refrigeration strategy, condenser placement, and heat rejection before equipment lands."
  },
  {
    icon: Cpu,
    title: "PLC/HMI visibility",
    body:
      "Operator-facing controls help teams see what the recovery process is doing instead of guessing from disconnected components."
  },
  {
    icon: ShieldCheck,
    title: "Commercial reliability",
    body:
      "The goal is not a one-off skid. It is a recovery platform that supports high-duty extraction schedules, maintenance access, and stable daily operation."
  }
];

const workflowSteps = [
  {
    title: "Scope",
    body:
      "Start with recovery volume, run cadence, solvent handling, utility constraints, and how the extraction line actually operates."
  },
  {
    title: "Integrate",
    body:
      "Coordinate refrigeration, heat exchange, controls, condenser strategy, and site layout so the recovery system is not fighting the facility."
  },
  {
    title: "Produce",
    body:
      "Give operators a recovery path that supports repeatable batches, fewer bottlenecks, and a stronger path to commercial throughput."
  }
];

const fitPoints = [
  "Commercial BHO extraction teams moving beyond small recovery setups.",
  "Facilities that need recovery performance planned around real duty cycle.",
  "Operators who want better control visibility and fewer improvised workarounds.",
  "Labs pairing recovery equipment with process chilling, HVAC constraints, or facility upgrades."
];

const planningDetails = [
  "Recovery duty cycle and expected batch cadence.",
  "Solvent volume, recovery target, and extraction method.",
  "Available electrical service, mechanical space, and heat rejection path.",
  "Control visibility, service access, and commissioning expectations."
];

const faqs = [
  {
    question: "Is this separate from the ethanol chiller line?",
    answer:
      "Yes. Butane Recovery is now its own product path. Perma Cool can still help plan how recovery, chilling, HVAC, and facility constraints fit together."
  },
  {
    question: "What information is needed for pricing?",
    answer:
      "The useful starting point is recovery volume, run cadence, solvent handling requirements, available utilities, and any existing equipment that needs to stay in the process."
  },
  {
    question: "Can Perma Cool help with system fit before a purchase?",
    answer:
      "Yes. Perma Cool reviews recovery volume, run cadence, solvent handling requirements, available utilities, and existing equipment before recommending a system configuration."
  }
];

export default function ButaneRecoveryPage() {
  return (
    <main className="site-shell butane-page">
      <StructuredData data={butaneRecoveryStructuredData} />
      <InsightsHeader />

      <section className="hero butane-product-hero">
        <Image
          src="/images/generated/insights-direct-refrigerant-vs-ln2.png"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="hero-image"
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Butane Recovery Systems</p>
          <h1>Butane recovery systems built for commercial BHO production.</h1>
          <p className="hero-lede">
            Perma Cool helps extraction labs scope recovery systems around production pace, cooling load, controls,
            and facility fit so the recovery side stops becoming the bottleneck.
          </p>
          <div className="hero-actions">
            <a className="button butane" href="/contact-us">
              Request Recovery System Pricing
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button secondary" href="tel:+17472081001">
              Talk to an Engineer
              <Phone size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="br-metric-band" aria-label="Butane recovery planning highlights">
        {heroStats.map((stat) => (
          <article key={stat.title}>
            <strong>{stat.label}</strong>
            <span>{stat.title}</span>
            <p>{stat.body}</p>
          </article>
        ))}
      </section>

      <section className="section br-capability-section">
        <div className="section-heading">
          <p className="eyebrow">Recovery Platform</p>
          <h2>Built around recovery performance, control visibility, and production uptime.</h2>
          <p>
            A butane recovery system has to do more than move solvent. The right system plan connects cooling capacity,
            heat exchange, controls, service access, and the way operators actually run the lab.
          </p>
        </div>
        <div className="br-card-grid">
          {capabilityCards.map(({ icon: Icon, title, body }) => (
            <article className="br-card" key={title}>
              <Icon size={26} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="br-workflow">
        <div className="br-workflow-inner">
          <div>
            <p className="eyebrow">Production Workflow</p>
            <h2>Plan recovery like a production constraint, not an afterthought.</h2>
            <p>
              When recovery is undersized or poorly integrated, the extraction line waits. Perma Cool scopes the
              recovery side around the batch rhythm, facility utilities, and equipment support needed to keep production
              moving.
            </p>
          </div>
          <div className="br-workflow-steps">
            {workflowSteps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section br-fit-section">
        <div className="section-heading">
          <p className="eyebrow">Application Fit</p>
          <h2>Who the butane recovery path is for.</h2>
        </div>
        <div className="br-fit-grid">
          {fitPoints.map((point) => (
            <article className="br-fit-card" key={point}>
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="br-planning-band">
        <div>
          <p className="eyebrow">Quote Inputs</p>
          <h2>Bring the production details. Perma Cool will help translate them into a system fit.</h2>
        </div>
        <ul>
          {planningDetails.map((detail) => (
            <li key={detail}>
              <Wrench size={19} aria-hidden="true" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section br-faq-section">
        <div className="section-heading">
          <p className="eyebrow">Butane Recovery FAQ</p>
          <h2>Common buying questions before a system fit review.</h2>
        </div>
        <div className="br-faq-grid">
          {faqs.map((faq) => (
            <article className="br-faq-card" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <LearningCenterSection />

      <section className="related-section br-related">
        <div>
          <p className="eyebrow">Build-Spec Quote</p>
          <h2>Need a butane recovery system fit assessment?</h2>
          <p>Send the recovery target, facility constraints, and run cadence so Perma Cool can scope the next step.</p>
        </div>
        <div className="related-actions">
          <a className="button butane" href="/contact-us">
            Request System Fit Review
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button secondary light" href="/ethanol-chilling-systems">
            View Ethanol Chillers
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

    </main>
  );
}
