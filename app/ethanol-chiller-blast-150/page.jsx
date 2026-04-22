import {
  ProductFooterActions,
  ProductHero,
  ProductRelated,
  ProductSimpleSection,
  ProductStickyCTA
} from '../components/ProductPage'

export const metadata = {
  title: "BLAST 150 Ethanol Chiller | Chill 150 Gallons to -40°C | PermaCool",
  description:
    "PermaCool BLAST 150 ethanol chiller is designed to chill up to 150 gallons toward -40°C with PLC/HMI visibility and direct refrigerant efficiency."
}

const highlights = [
  "Designed for up to 150-gallon process class applications",
  "Target low-temp operation around -40°C (config/facility dependent)",
  "Direct refrigerant architecture with HVAC condenser integration",
  "PLC/HMI operational visibility and compressor protection logic"
]

export default function Page() {
  return (
    <>
      <section className="product-page">
        <div className="container product-page__container">
          <ProductHero
            eyebrow="BLAST™ Product Line"
            title="BLAST™ 150/45 Ethanol Chiller"
            lead={(
              <>
                Chill <strong>150</strong> gallons of ethanol from room temperature to <strong>-40°C</strong> in{' '}
                <strong>45</strong> minutes.
              </>
            )}
            actions={[
              <a key="pricing" className="btn" href="/contact-us">Request BLAST™ 150/45 Pricing</a>,
              <a key="compare" className="btn btn-ghost" href="/ethanol-chilling-systems">Compare Chiller Options</a>
            ]}
          />

          <ProductSimpleSection title="Highlights">
            <ul className="list">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ProductSimpleSection>

          <ProductFooterActions
            actions={[
              <a key="pricing" className="btn" href="/contact-us">Request BLAST™ 150/45 Pricing</a>,
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
        message="Need lead time + pricing for BLAST™ 150/45?"
        actions={[
          <a key="pricing" className="btn" href="/contact-us">Request Pricing</a>
        ]}
      />
    </>
  )
}
