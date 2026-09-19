import Image from "next/image";
import { Activity, ArrowDown, ArrowRight, Bell, Check, Eye, Headphones } from "lucide-react";
import { InsightsHeader } from "../insights/InsightsShell";
import { buildPublicPageMetadata } from "../../lib/site";
import { buildContactHref } from "../../lib/contact";
import "./service-plan.css";

export const metadata = buildPublicPageMetadata({
  path: "/service-plan",
  title: "Service Plan | Connected Cooling Support | Perma Cool",
  description: "Stay connected to your cooling system with connected telemetry, 12 hours of technical support, alerts, and remote condenser observation from Perma Cool."
});

const inquiry = buildContactHref({ requestType: "Service Guidance", source: "service-plan" });
const services = [
  { icon: Activity, name: "Connected telemetry", lead: "See the operating picture.", body: "Connected equipment data gives your team visibility into system conditions and a shared starting point for troubleshooting.", tag: "Equipment insight" },
  { icon: Headphones, name: "12 hours of technical support", lead: "Talk through the next step.", body: "Get technical help understanding system behavior, working through questions, and planning your next steps with Perma Cool.", tag: "People behind the equipment" },
  { icon: Bell, name: "Alerts", lead: "Know what needs attention.", body: "Alerts flag monitored conditions that meet defined criteria, helping your team focus on changes that deserve a closer look.", tag: "Awareness when it matters" },
  { icon: Eye, name: "Remote condenser observation", lead: "Add another perspective.", body: "Remote viewing of the condensers adds context to equipment data and helps inform the conversation about system conditions.", tag: "Visibility beyond the numbers" }
];

export default function ServicePlanPage() {
  return <main className="site-shell service-page">
    <InsightsHeader />
    <section className="sp-hero" aria-labelledby="sp-title">
      <div className="sp-hero-copy">
        <p className="sp-eyebrow">PERMA COOL / SERVICE PLAN</p>
        <h1 id="sp-title">Connected equipment.<br /><span>Supported people.</span></h1>
        <p className="sp-lede">A clearer view of your cooling system. Technical help to make sense of it.</p>
        <p className="sp-intro">Bring connected telemetry, alerts, remote condenser observation, and 12 hours of technical support together in one service plan.</p>
        <div className="sp-actions"><a className="sp-button" href={inquiry}>Discuss your service plan <ArrowRight size={18} aria-hidden="true" /></a><a className="sp-text-link" href="#included">Explore what’s included <ArrowDown size={16} aria-hidden="true" /></a></div>
      </div>
      <div className="sp-visual">
        <div className="sp-visual-label"><span>CONNECTED COOLING</span><span>PERMA COOL</span></div>
        <Image src="/images/product/blast-60-condensers.jpg" alt="Perma Cool condenser equipment" width={1000} height={850} priority className="sp-equipment" />
        <div className="sp-visual-caption"><Eye size={18} aria-hidden="true" /><span>Your system. A broader view.</span></div>
        <div className="sp-support-stamp"><strong>12<span>HRS</span></strong><p>Technical support<br />included in your plan</p></div>
      </div>
    </section>

    <div className="sp-inclusions" aria-label="Plan at a glance">{services.map(({ icon: Icon, name }) => <div key={name}><Icon size={19} aria-hidden="true" /><span>{name}</span></div>)}</div>

    <section className="sp-section" id="included" aria-labelledby="sp-included-title">
      <div className="sp-section-heading"><div><p className="sp-eyebrow">FOUR PARTS. ONE PLAN.</p><h2 id="sp-included-title">More visibility.<br />Help within reach.</h2></div><p>Equipment data is more useful when you have context—and someone to help you understand what comes next.</p></div>
      <div className="sp-service-grid">{services.map(({ icon: Icon, name, lead, body, tag }, index) => <article className="sp-service" key={name}><div className="sp-service-top"><Icon size={27} aria-hidden="true" /><span>0{index + 1}</span></div><p className="sp-service-name">{name}</p><h3>{lead}</h3><p>{body}</p><div className="sp-service-tag"><Check size={15} aria-hidden="true" />{tag}</div></article>)}</div>
    </section>

    <section className="sp-workflow" aria-labelledby="sp-workflow-title"><div><p className="sp-eyebrow">FROM INFORMATION TO ACTION</p><h2 id="sp-workflow-title">Understand what’s happening.<br />Decide what comes next.</h2><p>The plan brings equipment visibility and technical support into the same conversation.</p></div><ol>{[
      ["Connect", "Connected telemetry provides a view of operating conditions."],
      ["Observe", "Alerts and remote condenser viewing help bring changes into focus."],
      ["Work through it", "Use your included technical support to discuss findings and next steps."]
    ].map(([title, body], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="sp-section sp-faq" aria-labelledby="sp-faq-title"><div><p className="sp-eyebrow">A FEW THINGS TO KNOW</p><h2 id="sp-faq-title">Let’s make the plan<br />fit your system.</h2><p>We’ll walk through your equipment, connectivity, and support needs before you enroll.</p></div><div>{[
      ["What is included in the service plan?", "Connected telemetry, 12 hours of technical support, alerts, and remote observation of the condensers."],
      ["How is telemetry different from remote observation?", "Telemetry provides operating data from connected equipment. Remote condenser observation adds viewing context to help understand system conditions."],
      ["How do I confirm coverage and support details?", "Contact Perma Cool to review equipment compatibility, connectivity requirements, alert setup, remote viewing arrangements, and how the 12 support hours apply to your plan."],
      ["How do I get started?", "Select “Discuss your service plan” and tell us about your equipment and site. We’ll help you review the plan and pricing."]
    ].map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

    <section className="sp-cta"><p className="sp-eyebrow">SUPPORT STARTS WITH A CONVERSATION</p><h2>Stay connected.<br />Keep moving forward.</h2><p>Tell us about your system. We’ll talk through the service plan.</p><a className="sp-button" href={inquiry}>Discuss your service plan <ArrowRight size={18} aria-hidden="true" /></a><a className="sp-phone" href="tel:+17472081001">Or call 747.208.1001</a></section>
  </main>;
}
