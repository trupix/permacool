function ProductHeroStat({ image, alt, value, label, suffix }) {
  return (
    <div className="product-hero-stat">
      <div className="product-hero-stat__media">
        <img src={image} alt={alt} />
      </div>
      <p className="product-hero-stat__copy">
        <strong>{value}</strong>
        {label}
        {suffix ? <strong>{suffix}</strong> : null}
      </p>
    </div>
  )
}

function ProductHero({ eyebrow, title, lead, stats, actions }) {
  return (
    <section className="product-hero card">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="product-hero__lead">{lead}</p>

      {stats?.length ? (
        <div className="product-hero-stats">
          {stats.map((stat) => (
            <ProductHeroStat key={stat.alt || `${stat.value}-${stat.label}`} {...stat} />
          ))}
        </div>
      ) : null}

      {actions?.length ? <div className="cta-row product-hero__actions">{actions}</div> : null}
    </section>
  )
}

function ProductValueCard({ icon, title, body, link }) {
  return (
    <article className="card product-value-card">
      <h3>
        <span className="icon-chip">
          <i data-lucide={icon}></i>
        </span>
        {title}
      </h3>
      <p>{body}</p>
      {link ? (
        <p>
          <a href={link.href}>{link.label}</a>
        </p>
      ) : null}
    </article>
  )
}

function ProductValueGrid({ cards }) {
  if (!cards?.length) return null

  return (
    <section className="product-value-grid">
      {cards.map((card) => (
        <ProductValueCard key={card.title} {...card} />
      ))}
    </section>
  )
}

function ProductComponentSection({ section }) {
  return (
    <section className="card product-component-card">
      <div className={section.layoutClassName || 'product-component-layout'}>
        <div className="product-component-visual">
          <img src={section.image} alt={section.alt} className={section.imageClassName || 'product-component-media'} />
        </div>
        <div className="product-component-content">
          <p className="eyebrow">Component {section.number}</p>
          <h3 className="product-component-title">{section.title}</h3>
          <div className="product-zone-pill">
            <strong>{section.zoneLabel}:</strong> <span>{section.zoneValue}</span>
          </div>
          {section.body?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.specs?.length ? (
            <div className="product-spec-list">
              {section.specs.map((item) => {
                const [label, ...rest] = item.split(': ')
                return (
                  <div className="product-spec-item" key={item}>
                    <strong>{label}:</strong> {rest.join(': ')}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProductComponentStack({ eyebrow, title, intro, sections }) {
  if (!sections?.length) return null

  return (
    <section className="card product-section">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {intro ? <p className="product-section__intro">{intro}</p> : null}
      <div className="product-component-stack">
        {sections.map((section) => (
          <ProductComponentSection key={section.title} section={section} />
        ))}
      </div>
    </section>
  )
}

function ProductSimpleSection({ title, children, className = '', id }) {
  return (
    <section id={id} className={`card product-section ${className}`.trim()}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  )
}

function ProductFooterActions({ actions }) {
  if (!actions?.length) return null
  return <div className="cta-row product-page__footer-actions">{actions}</div>
}

function ProductRelated({ children }) {
  return (
    <section className="related card product-related">
      <h3>Related reading</h3>
      {children}
    </section>
  )
}

function ProductStickyCTA({ meta, actions, message }) {
  return (
    <div className="sticky-cta">
      <div className="inner product-sticky-cta">
        {meta?.length ? (
          <div className="product-sticky-cta__meta">
            {meta.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong> {item.label}
              </span>
            ))}
          </div>
        ) : message ? <p>{message}</p> : null}
        {actions?.length ? <div className="product-sticky-cta__actions">{actions}</div> : null}
      </div>
    </div>
  )
}

export {
  ProductHero,
  ProductValueGrid,
  ProductComponentStack,
  ProductSimpleSection,
  ProductFooterActions,
  ProductRelated,
  ProductStickyCTA
}
