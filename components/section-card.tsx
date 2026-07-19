import type { ReactNode } from 'react';

export function SectionCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="panel">
      <header className="section-card-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </header>
      <div className="section-card-body">{children}</div>
    </section>
  );
}
