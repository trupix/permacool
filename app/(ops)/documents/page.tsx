import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { requireUser } from '@/lib/auth';
import { getPortalDocuments } from '@/server/repositories/portal';

export default async function DocumentsPage() {
  const user = await requireUser();
  const documents = await getPortalDocuments(user);
  return <main className="page-stack">
    <header><p className="eyebrow">Documents</p><h1>Equipment library</h1><p className="page-copy">Manuals, cutsheets, wiring diagrams, and service documents assigned to your equipment.</p></header>
    <SectionCard title="Available documents" eyebrow={`${documents.length} files`}>
      <div className="list-stack">{documents.length ? documents.map((document) => <Link className="list-row link-row" href={document.url} key={document.id} target="_blank" rel="noreferrer"><div><strong>{document.title}</strong><p>{document.category}</p></div><span>Open</span></Link>) : <p className="empty-state">No documents have been assigned yet.</p>}</div>
    </SectionCard>
  </main>;
}
