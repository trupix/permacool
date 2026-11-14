import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Activity, ClipboardList, FolderArchive, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { canAccessPlcOperations } from '@/lib/plc-operations-access';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { SectionCard } from '@/components/section-card';
import { MetricCard } from '@/components/metric-card';
import { PlcLibraryDocument } from '@/components/plc-library-document';
import { PlcLibraryRefresh } from '@/components/plc-library-refresh';
import { getPlcLibrary } from '@/server/plc-library';
import { libraryDocumentTitle, libraryUrl, openIssueSections, type LibraryDocument } from '@/lib/plc-library-contract';
import styles from './plc-operations.module.css';

export const metadata: Metadata = { title: 'PLC Operations', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'plans', label: 'Plans & issues', icon: ClipboardList },
  { id: 'history', label: 'Change history', icon: Activity },
  { id: 'standards', label: 'Standards', icon: ShieldCheck },
  { id: 'records', label: 'Library & backups', icon: FolderArchive }
] as const;
const date = (value: string) => new Date(value).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' });
function DocumentCard({ document, revision, expanded = false }: { document: LibraryDocument; revision: string; expanded?: boolean }) {
  return <details className={styles.document} open={expanded}><summary>{libraryDocumentTitle(document)}<small>Source updated {date(document.updatedAt)}</small></summary><div className={styles.markdown}><PlcLibraryDocument document={document} revision={revision} /></div><a className={styles.resource} href={libraryUrl(revision, document.path)} target="_blank" rel="noopener noreferrer">Open exact GitHub record ↗</a></details>;
}
export default async function PlcOperationsPage({ searchParams }: { searchParams: Promise<{ section?: string | string[] }> }) {
  if (process.env.NODE_ENV === 'production' && !isSupabaseAuthEnabled()) notFound();
  const user = await requireUser();
  if (!canAccessPlcOperations(user)) notFound();
  const requested = (await searchParams).section;
  const active = sections.find(section => section.id === requested)?.id ?? 'overview';
  const state = await getPlcLibrary();
  const docs = state.snapshot?.documents ?? [];
  const revision = state.snapshot?.revision ?? '';
  const overview = docs.find(doc => doc.path === 'customers/baldwin-park/README.md');
  const notebook = docs.find(doc => doc.path === 'customers/baldwin-park/controller-notebook.md');
  const issues = notebook ? openIssueSections(notebook.content) : [];
  const plans = docs.filter(doc => doc.path.includes('/plans/'));
  const history = docs.filter(doc => doc.path.includes('/changes/')).sort((a, b) => b.path.localeCompare(a.path));
  const standards = docs.filter(doc => doc.path.startsWith('standards/'));
  const records = docs.filter(doc => /^customers\/baldwin-park\/[^/]+\.md$/.test(doc.path));
  return <main className={`page-stack ${styles.workspace}`}>
    <header className={styles.header}><div><p className="eyebrow">PermaCool · Private workspace</p><h1>PLC Operations</h1><p className="page-copy">One place for the plan, the work and the evidence.</p></div><span className={styles.private}><ShieldCheck size={15} /> Private · No equipment controls</span></header>
    <nav className="site-section-nav" aria-label="PLC Operations sections">{sections.map(({ id, label, icon: Icon }) => <Link key={id} href={`/dashboard/plc-operations?section=${id}`} scroll={false} className={active === id ? 'is-active' : undefined} aria-current={active === id ? 'page' : undefined}><Icon size={15} aria-hidden="true" /><span>{label}</span></Link>)}</nav>
    <div className={styles.sync}><strong>GitHub library → PLC Operations</strong><p>Last successful sync: {state.receivedAt ? date(state.receivedAt) : 'Awaiting first publication'}{revision && <> · Revision <code>{revision.slice(0, 7)}</code></>}</p><PlcLibraryRefresh revision={revision || null} receivedAt={state.receivedAt} lastAttemptAt={state.lastAttemptAt} lastError={state.lastError} />{state.lastError && <p className={styles.failure} role="alert">{state.lastError}</p>}<small>Main-branch changes publish automatically, with an hourly confirmation. Documentation records, not live PLC health.</small></div>
    {!state.snapshot ? <SectionCard title="Library records unavailable" eyebrow="No verified snapshot"><p>The page will populate after the GitHub publisher completes successfully. No controller status is inferred from missing records.</p></SectionCard> : <>
      {active === 'overview' && <><div className="metric-grid"><MetricCard label="Locations" value="1" detail="Baldwin Park · other sites not yet imported" /><MetricCard label="Library records" value={String(docs.length)} detail="From the exact revision shown above" /><MetricCard label="Change records" value={String(history.length)} detail="Preparation and installation kept distinct" /><MetricCard label="Source" value="GitHub" detail="One-way publication · no PLC access" /></div>{overview && <DocumentCard document={overview} revision={revision} expanded />}</>}
      {active === 'plans' && <SectionCard title="Baldwin Park plans & issues" eyebrow="Original notebook wording"><p>Status comes from the records below; publication does not mean a repair has been installed or verified.</p>{notebook && issues.length > 0 && <div className={styles.markdown}><PlcLibraryDocument document={notebook} revision={revision} content={issues.join('\n\n')} /></div>}{plans.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} expanded />)}{!issues.length && !plans.length && <p>No separately indexed plan sections found. Review the full notebook; this does not mean there are no open issues.</p>}{notebook && <DocumentCard document={notebook} revision={revision} />}</SectionCard>}
      {active === 'history' && <SectionCard title="Baldwin Park change history" eyebrow="Newest record first">{history.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
      {active === 'standards' && <SectionCard title="Shared standards" eyebrow="Adoption is separate"><p>A documented standard is not proof it is installed at a customer.</p>{standards.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
      {active === 'records' && <SectionCard title="Baldwin Park library & backups" eyebrow="Private GitHub · separate sign-in may be required"><p>Only reviewed documentation is synchronized. Full backups and credentials stay outside this page. See the manifest for verified links and known coverage limits.</p>{records.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
    </>}
    <footer className={styles.footer}><Link href="/dashboard">← Dashboard</Link><span>Planning and records only · no PLC requests or control actions</span></footer>
  </main>;
}
