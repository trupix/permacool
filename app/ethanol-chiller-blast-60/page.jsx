import {
  ProductComponentStack,
  ProductFooterActions,
  ProductHero,
  ProductRelated,
  ProductSimpleSection,
  ProductStickyCTA,
  ProductValueGrid
} from '../components/ProductPage'

export const metadata = {
  title: "BLAST™ 60/45 Ethanol Chiller | Chill 60 Gallons to -40°C | PermaCool",
  description:
    "PermaCool BLAST™ 60/45 ethanol chiller is designed to chill up to 60 gallons toward -40°C with PLC/HMI visibility and direct refrigerant efficiency."
}

const heroStats = [
  {
    image: "/assets/images/products/blast-60-centrifuge-icon.jpg",
    alt: "30 gallon centrifuge workflow icon",
    value: "30",
    label: "gallon centrifuge workflow or 2x 15 gallon"
  },
  {
    image: "/assets/images/products/blast-60-capacity-icon.jpg",
    alt: "60 gallon ethanol capacity icon",
    value: "60",
    label: "gallon ethanol capacity"
  },
  {
    image: "/assets/images/products/blast-60-cold-icon.jpg",
    alt: "45 minutes to -40°C icon",
    value: "45",
    label: "Minutes to ",
    suffix: "-40°C"
  }
]

const valueCards = [
  {
    icon: "snowflake",
    title: "Built smart, cascade design",
    body: (
      <>
        The BLAST™ 60/45 is the most compact unit in the BLAST™ lineup and the only model built around Perma Cool’s
        cascade-style architecture, combining strong low-temperature performance with long-term serviceability.{' '}
        <a className="inline-arrow-link" href="#cascade-refrigeration-design">
          More →
        </a>
      </>
    )
  },
  {
    icon: "wrench",
    title: "Production-ready workflow",
    body:
      "It replaces consumables and slower legacy chilling methods with a production-ready system sized for the ideal 30-gallon centrifuge workflow.",
    link: { href: "/workflow", label: "workflow explained →" }
  },
  {
    icon: "badge-dollar-sign",
    title: "Fast return on value",
    body:
      "For many operators, the 60/45 hits the sweet spot, real production capacity, smarter workflow, and a system that can often pay for itself within the first few months of operation."
  }
]

const componentSections = [
  {
    number: "01",
    title: "Ethanol Chilling Platform",
    image: "/assets/images/products/blast-60-assets-overview.jpg",
    alt: "Perma Cool BLAST 60/45 chiller tank assembly",
    zoneLabel: "Zone three",
    zoneValue: "Inside control area",
    imageClassName: "product-component-media product-component-media--platform",
    layoutClassName: "product-component-layout product-component-layout--feature",
    body: [
      "This is the main process-side assembly of the BLAST™ 60/45, combining the tank, circulation hardware, and heat-transfer components into the core chilling package."
    ],
    specs: [
      "Vacuum jacketed chilling tank: insulated reservoir for maintaining cold ethanol stability",
      "Plate heat exchanger: primary transfer surface for efficient chilling performance",
      "Cold ethanol pump: circulates chilled ethanol through the process loop",
      "Level sight glass: gives operators a quick visual on tank level during operation",
      "Ethanol out ports: controlled output connections for routing chilled ethanol where it needs to go"
    ]
  },
  {
    number: "02",
    title: "Flux Box",
    image: "/assets/images/products/blast-60-flux-box.jpg",
    alt: "Perma Cool BLAST 60/45 flux box",
    zoneLabel: "Zone two",
    zoneValue: "inside the building, outside the control area",
    imageClassName: "product-component-media product-component-media--compact",
    body: [
      "The flux box is part of the cascade side of the chiller and is specific to the BLAST™ 60/45.",
      "This component allows the secondary chiller to cascade the primary chiller, supporting the two-stage refrigeration design that gives the 60/45 its stronger low-temperature performance."
    ],
    specs: [
      "Component name: Flux Box",
      "Used on: BLAST™ 60/45 only",
      "Function: Supports the cascade refrigeration stage",
      "Why it matters: Helps the secondary system drive the primary system to lower operating temperatures"
    ]
  },
  {
    number: "03",
    title: "PLC Control System",
    image: "/assets/images/products/blast-60-plc-control-system.png",
    alt: "Perma Cool BLAST 60/45 PLC control system",
    zoneLabel: "Zone three",
    zoneValue: "Inside control area",
    imageClassName: "product-component-media product-component-media--compact product-component-media--tall",
    body: [
      "This is the PLC control system for the BLAST™ 60/45, giving operators centralized control and visibility over chiller operation.",
      "It supports the system’s monitoring, logic, and control functions so operators can manage process performance with clearer feedback and more consistent operation."
    ],
    specs: [
      "Component name: PLC Control System",
      "Function: Centralized machine monitoring and control",
      "Visibility: Helps operators track system status and operation",
      "Why it matters: Improves usability, process oversight, and repeatable operation"
    ]
  },
  {
    number: "04",
    title: "Condensers",
    image: "/assets/images/products/blast-60-condensers.jpg",
    alt: "Perma Cool BLAST 60/45 condensers",
    zoneLabel: "Zone one",
    zoneValue: "outside the building",
    imageClassName: "product-component-media product-component-media--medium",
    body: [
      "These are the two condensers that come with the BLAST™ 60/45 system.",
      "Each condenser is rated at six horsepower, giving the unit the condenser capacity needed to support the cascade refrigeration design."
    ],
    specs: [
      "Component name: Condensers",
      "Quantity: Two condensers",
      "Rating: 6 horsepower each",
      "Why it matters: Provides the condenser capacity needed for strong cascade-stage chilling performance"
    ]
  }
]

const fieldImpactSections = [
  {
    title: "Better low-temp performance",
    body: "The cascade setup allows the machine to push colder and work harder than a simple single-stage setup in the same class."
  },
  {
    title: "Common parts, easier service",
    body: "Because it relies on more standard component sizing instead of rare oversized hardware, it is:",
    list: ["easier to diagnose", "easier to repair", "cheaper to repair", "easier to keep running long-term"]
  },
  {
    title: "Long life / maintainability",
    body: "This is huge. It is easy to keep these going forever.",
    list: [
      "built for long-term serviceability",
      "designed around repairable common components",
      "easier to maintain over the life of the machine",
      "avoids dependence on exotic hard-to-source oversized parts"
    ]
  }
]

const highlights = [
  "Designed for up to 60-gallon process class applications",
  "Target low-temp operation around -40°C (config/facility dependent)",
  "Direct refrigerant architecture with HVAC condenser integration",
  "PLC/HMI operational visibility and compressor protection logic"
]

const roiPoints = [
  "Reduces dependence on recurring consumables",
  "Supports faster re-chill and repeat-cycle extraction",
  "Built around serviceable, common-sized components for lower long-term ownership cost"
]

export default function Page() {
  return (
    <>
      <section className="product-page">
        <div className="container product-page__container">
          <ProductHero
            eyebrow="BLAST™ Product Line"
            title="BLAST™ 60/45 Ethanol Chiller"
            lead={(
              <>
                Chill <strong>60</strong> gallons of ethanol from room temperature to <strong>-40°C</strong> in{' '}
                <strong>45</strong> minutes.
              </>
            )}
            stats={heroStats}
            actions={[
              <a key="pricing" className="btn" href="/contact-us">Request Pricing</a>,
              <a key="call" className="btn btn-ghost" href="tel:7472081001">Call 747.208.1001</a>
            ]}
          />

          <ProductValueGrid cards={valueCards} />

          <ProductComponentStack
            eyebrow="Component Overview"
            title="BLAST™ 60/45 Component Walkthrough"
            intro="A quick visual walkthrough of the major BLAST™ 60/45 components"
            sections={componentSections}
          />

          <ProductSimpleSection title="Cascade Refrigeration Design" className="product-narrative" id="cascade-refrigeration-design">
            <p>
              The BLAST™ 60/45 is built around Perma Cool’s dual-stage cascade architecture, using two smaller, more
              common-sized refrigeration stages instead of one oversized unit. The primary refrigeration circuit directly
              chills the ethanol, while the cascade refrigeration circuit cools the primary circuit so the system can
              reach lower temperatures with efficient, consistent pull-down.
            </p>
            <p>
              That two-stage design gives the BLAST™ 60/45 strong low-temperature performance while keeping the system
              built around more serviceable, widely available components. The result is easier parts sourcing, lower
              service cost, and a machine that is simpler to maintain in real production use.
            </p>

            <h2>Why that matters in the field</h2>
            <div className="product-subsection-stack">
              {fieldImpactSections.map((section, index) => (
                <div key={section.title} className="product-subsection">
                  <h3>{index + 1}. {section.title}</h3>
                  <p>{section.body}</p>
                  {section.list ? (
                    <ul className="list">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>

            <h2>Built for better centrifuge pairing</h2>
            <p>
              Perma Cool’s legacy ACP-30 put more than 200 units into the field and proved the value of dedicated ethanol
              pre-chilling. But at roughly 40 gallons, it was sized more for basic single-pass centrifuge support than
              for the most efficient repeat-cycle workflow.
            </p>
            <p>
              The ideal approach is to pair your ethanol tank at about <strong>2x the capacity of your centrifuge</strong>.
            </p>
            <p>That means:</p>
            <ul className="list">
              <li><strong>30-gallon centrifuge = 60-gallon tank</strong></li>
            </ul>
            <p>
              With that ratio, returning ethanol mixes back into a substantial reserve of already cold ethanol instead of
              resetting the whole tank. The temperature shift stays much smaller, recovery back to <strong>-40</strong> is
              faster, and operators can move back into extraction sooner.
            </p>
            <p>
              This allows repeated extraction and re-chill cycles until the ethanol reaches roughly{' '}
              <strong>2 to 3 lb of material per gallon</strong>, at which point it is ready to move to{' '}
              <strong>filtration and evaporation</strong>.
            </p>
            <p>The BLAST™ 60/45 is built around that more efficient real-world workflow.</p>

            <h2>Highlights</h2>
            <ul className="list">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>ROI / Replacement</h2>
            <p>
              For operators still relying on consumables, slower legacy chilling methods, or improvised cold-ethanol
              workflows, the BLAST™ 60/45 offers a cleaner production path. Instead of ongoing consumable spend and
              workflow drag, you get dedicated electric chilling built for repeatable low-temperature performance, faster
              recovery between cycles, and simpler day-to-day operation.
            </p>
            <ul className="list">
              {roiPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              For many operators, that makes the BLAST™ 60/45 more than a replacement. It is a move toward lower
              operating cost, better throughput, and a more reliable production workflow.
            </p>
          </ProductSimpleSection>

          <ProductFooterActions
            actions={[
              <a key="pricing" className="btn" href="/contact-us">Request BLAST™ 60/45 Pricing</a>,
              <a key="compare" className="btn btn-ghost" href="/ethanol-chilling-systems">Compare Chiller Options</a>
            ]}
          />

          <ProductRelated>
            <p>
              <a href="/direct-refrigerant-vs-ln2">Direct Refrigerant vs LN2</a> •{' '}
              <a href="/industrial-process-chiller-maintenance">Maintenance Guide</a>
            </p>
          </ProductRelated>
        </div>
      </section>

      <ProductStickyCTA
        meta={[
          { value: '60 gallons', label: 'capacity' },
          { value: '45 minutes', label: 'to -40°C' },
          { value: '30 gallon', label: 'centrifuge workflow' }
        ]}
        actions={[
          <a key="pricing" className="btn" href="/contact-us">Request Pricing</a>,
          <a key="call" className="btn btn-ghost" href="tel:7472081001">Call 747.208.1001</a>
        ]}
      />
    </>
  )
}
