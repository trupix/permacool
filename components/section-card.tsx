import type { ReactNode } from 'react';

export function SectionCard({
  title,
  eyebrow,
  action,
  children
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <header className="section-card-heading">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div className="section-card-action">{action}</div> : null}
      </header>
      <div className="section-card-body">{children}</div>
    </section>
  );
}
