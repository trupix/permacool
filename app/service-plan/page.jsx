import Image from "next/image";
import { Activity, ArrowDown, ArrowRight, Check, Headphones } from "lucide-react";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildPublicPageMetadata } from "../../lib/site";
import { buildContactHref } from "../../lib/contact";
import "./service-plan.css";

export const metadata = buildPublicPageMetadata({
  path: "/service-plan",
  title: "Extraction Chiller Service Plans | Basic & Agentic | Perma Cool",
  description: "Choose Basic for 12 hours of service per year, or Agentic for real-time connected telemetry plus 12 hours of service per year for your extraction chiller."
});

const inquiry = buildContactHref({ requestType: "Service Guidance", source: "service-plan" });
const plans = [
  { name: "Basic", icon: Headphones, lead: "Service when you need it.", body: "Annual service support for your extraction chiller, with 12 hours to work through equipment questions and next steps with Perma Cool.", features: ["12 hours of service per year"], source: "service-plan-basic" },
  { name: "Agentic", icon: Activity, lead: "Connected insight. Included service.", body: "Add real-time visibility into your extraction chiller’s operating conditions, backed by the same annual service support.", features: ["Real-time connected telemetry", "12 hours of service per year"], source: "service-plan-agentic" }
];

export default function ServicePlanPage() {
  return <main className="site-shell service-page">
    <InsightsHeader />
    <section className="sp-hero" aria-labelledby="sp-title">
      <div className="sp-hero-copy">
        <p className="sp-eyebrow">PERMA COOL / EXTRACTION CHILLER SERVICE PLAN</p>
        <h1 id="sp-title">Your equipment.<br /><span>Your level of support.</span></h1>
        <p className="sp-lede">Two plans. 12 hours of service per year with either choice.</p>
        <p className="sp-intro">Choose Basic for annual service support. Choose Agentic to add real-time connected telemetry to your 12 hours of service.</p>
        <div className="sp-actions"><a className="sp-button" href="#included">Compare the plans <ArrowDown size={18} aria-hidden="true" /></a><a className="sp-text-link" href={inquiry}>Discuss your service plan <ArrowRight size={16} aria-hidden="true" /></a></div>
      </div>
      <div className="sp-visual">
        <div className="sp-visual-label"><span>EXTRACTION CHILLER SUPPORT</span><span>PERMA COOL</span></div>
        <Image src="/images/product/blast-60-condensers.jpg" alt="Perma Cool condenser equipment" width={1000} height={850} priority className="sp-equipment" />
        <div className="sp-visual-caption"><Headphones size={18} aria-hidden="true" /><span>Basic or Agentic. Service included.</span></div>
        <div className="sp-support-stamp"><strong>12<span>HRS / YEAR</span></strong><p>Service included<br />with either plan</p></div>
      </div>
    </section>

    <div className="sp-inclusions sp-plan-summary" aria-label="Plans at a glance"><div><Headphones size={19} aria-hidden="true" /><span>Basic · 12 hours of service per year</span></div><div><Activity size={19} aria-hidden="true" /><span>Agentic · Real-time telemetry + 12 hours of service per year</span></div></div>

    <section className="sp-section" id="included" aria-labelledby="sp-included-title">
      <div className="sp-section-heading"><div><p className="sp-eyebrow">TWO PLANS. ONE SERVICE COMMITMENT.</p><h2 id="sp-included-title">Choose your<br />level of connection.</h2></div><p>Both plans include 12 hours of service each year. Agentic adds real-time connected telemetry for visibility into operating conditions.</p></div>
      <div className="sp-plan-grid">{plans.map(({ name, icon: Icon, lead, body, features, source }) => <article className={`sp-plan-card${name === "Agentic" ? " sp-plan-agentic" : ""}`} key={name}>
        <div className="sp-plan-top"><Icon size={28} aria-hidden="true" /><span>{name === "Basic" ? "ANNUAL SERVICE" : "CONNECTED SERVICE"}</span></div>
        <h3>{name}</h3><p className="sp-plan-lead">{lead}</p><p className="sp-plan-description">{body}</p>
        <ul>{features.map(feature => <li key={feature}><Check size={19} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
        <a className="sp-button" href={buildContactHref({ interest: `Extraction Chiller Support - ${name}`, requestType: "Service Guidance", source })}>Ask about {name} <ArrowRight size={18} aria-hidden="true" /></a>
      </article>)}</div>
    </section>

    <section className="sp-workflow" aria-labelledby="sp-workflow-title"><div><p className="sp-eyebrow">SUPPORT THAT FITS YOUR OPERATION</p><h2 id="sp-workflow-title">Start with service.<br />Add connected visibility.</h2><p>Choose the plan that matches how your team works with its extraction chiller.</p></div><ol>{[
      ["Choose your plan", "Basic includes annual service hours. Agentic includes those hours plus real-time connected telemetry."],
      ["Review your system", "We’ll walk through your equipment and service needs, including connectivity requirements for Agentic."],
      ["Put your plan to work", "Use your 12 hours of service during the year. With Agentic, bring real-time equipment data into the conversation."]
    ].map(([title, body], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="sp-section sp-faq" aria-labelledby="sp-faq-title"><div><p className="sp-eyebrow">A FEW THINGS TO KNOW</p><h2 id="sp-faq-title">The right plan<br />for your system.</h2><p>We’ll walk through your equipment and service needs before you enroll.</p></div><div>{[
      ["What is included in Basic?", "Basic includes 12 hours of service per year for your extraction chiller."],
      ["What is included in Agentic?", "Agentic includes real-time connected telemetry and 12 hours of service per year for your extraction chiller."],
      ["Does Basic include connected telemetry?", "No. Real-time connected telemetry is included with the Agentic plan."],
      ["Are the 12 service hours annual?", "Yes. Both Basic and Agentic include 12 hours of service per year."],
      ["How do I get started?", "Select “Ask about Basic” or “Ask about Agentic” and tell us about your equipment and site. We’ll review pricing, service coverage, and any connectivity requirements with you."]
    ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className="sp-cta"><p className="sp-eyebrow">BASIC OR AGENTIC</p><h2>Your chiller.<br />Our support.</h2><p>Tell us about your system. We’ll help you choose your service plan.</p><a className="sp-button" href={inquiry}>Discuss your service plan <ArrowRight size={18} aria-hidden="true" /></a><a className="sp-phone" href="tel:+17472081001">Or call 747.208.1001</a></section>
  </main>;
}
