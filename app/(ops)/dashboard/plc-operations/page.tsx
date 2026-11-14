import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Activity, BookOpen, ClipboardList, FolderArchive, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { canAccessPlcOperations } from '@/lib/plc-operations-access';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { SectionCard } from '@/components/section-card';
import { MetricCard } from '@/components/metric-card';
import { PlcLibraryDocument } from '@/components/plc-library-document';
import { PlcLibraryRefresh } from '@/components/plc-library-refresh';
import { getPlcLibrary } from '@/server/plc-library';
import { LIBRARY_CUSTOMERS, GOLDDROP_NOTEBOOKS, CANNON_FALLS_NOTEBOOKS, libraryDocumentTitle, libraryUrl, openIssueSections, type LibraryDocument } from '@/lib/plc-library-contract';
import styles from './plc-operations.module.css';

export const metadata: Metadata = { title: 'PLC Operations', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'notebooks', label: 'Notebooks', icon: BookOpen },
  { id: 'plans', label: 'Plans & issues', icon: ClipboardList },
  { id: 'history', label: 'Change history', icon: Activity },
  { id: 'standards', label: 'Standards', icon: ShieldCheck },
  { id: 'records', label: 'Library & backups', icon: FolderArchive }
] as const;
const date = (value: string) => new Date(value).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' });
function DocumentCard({ document, revision, expanded = false }: { document: LibraryDocument; revision: string; expanded?: boolean }) {
  return <details className={styles.document} open={expanded}><summary>{libraryDocumentTitle(document)}<small>Source updated {date(document.updatedAt)}</small></summary><div className={styles.markdown}><PlcLibraryDocument document={document} revision={revision} /></div><a className={styles.resource} href={libraryUrl(revision, document.path)} target="_blank" rel="noopener noreferrer">Open exact GitHub record ↗</a></details>;
}
export default async function PlcOperationsPage({ searchParams }: { searchParams: Promise<{ section?: string | string[]; site?: string | string[] }> }) {
  if (process.env.NODE_ENV === 'production' && !isSupabaseAuthEnabled()) notFound();
  const user = await requireUser();
  if (!canAccessPlcOperations(user)) notFound();
  const params = await searchParams;
  const requested = params.section;
  const customer = LIBRARY_CUSTOMERS.find(item => item.id === params.site) ?? LIBRARY_CUSTOMERS[0];
  const prefix = `customers/${customer.id}/`;
  const active = sections.find(section => section.id === requested)?.id ?? 'overview';
  const state = await getPlcLibrary();
  const docs = state.snapshot?.documents ?? [];
  const revision = state.snapshot?.revision ?? '';
  const customerDocs = docs.filter(doc => doc.path.startsWith(prefix) || (customer.id === 'golddrop' && doc.path === 'research/ke2-temp-valve/notebook.html'));
  const overview = customerDocs.find(doc => doc.path === `${prefix}README.md`);
  const notebook = customerDocs.find(doc => doc.path === `${prefix}controller-notebook.md`);
  const notebooks = customerDocs.filter(doc => doc.path === `${prefix}controller-notebook.md` || GOLDDROP_NOTEBOOKS.includes(doc.path) || CANNON_FALLS_NOTEBOOKS.includes(doc.path));
  const issues = notebook ? openIssueSections(notebook.content) : [];
  const plans = customerDocs.filter(doc => doc.path.includes('/plans/'));
  const history = customerDocs.filter(doc => doc.path.includes('/changes/')).sort((a, b) => b.path.localeCompare(a.path));
  const standards = docs.filter(doc => doc.path.startsWith('standards/'));
  const records = customerDocs.filter(doc => doc.path.startsWith(prefix) && !doc.path.slice(prefix.length).includes('/'));
  const locationCount = LIBRARY_CUSTOMERS.filter(item => docs.some(doc => doc.path === `customers/${item.id}/README.md`)).length;
  return <main className={`page-stack ${styles.workspace}`}>
    <header className={styles.header}><div><p className="eyebrow">PermaCool · Private workspace</p><h1>PLC Operations</h1><p className="page-copy">One place for the plan, the work and the evidence.</p></div><span className={styles.private}><ShieldCheck size={15} /> Private · No equipment controls</span></header>
    <nav className={styles.customers} aria-label="PLC Operations locations">{LIBRARY_CUSTOMERS.map(item => <Link key={item.id} href={`/dashboard/plc-operations?site=${item.id}&section=${active}`} scroll={false} aria-current={customer.id === item.id ? 'page' : undefined}>{item.name}</Link>)}</nav>
    <nav className="site-section-nav" aria-label="PLC Operations sections">{sections.map(({ id, label, icon: Icon }) => <Link key={id} href={`/dashboard/plc-operations?site=${customer.id}&section=${id}`} scroll={false} className={active === id ? 'is-active' : undefined} aria-current={active === id ? 'page' : undefined}><Icon size={15} aria-hidden="true" /><span>{label}</span></Link>)}</nav>
    <div className={styles.sync}><strong>GitHub library → PLC Operations</strong><p>Last successful sync: {state.receivedAt ? date(state.receivedAt) : 'Awaiting first publication'}{revision && <> · Revision <code>{revision.slice(0, 7)}</code></>}</p><PlcLibraryRefresh revision={revision || null} receivedAt={state.receivedAt} lastAttemptAt={state.lastAttemptAt} lastError={state.lastError} />{state.lastError && <p className={styles.failure} role="alert">{state.lastError}</p>}<small>Main-branch changes publish automatically, with an hourly confirmation. Documentation records, not live PLC health.</small></div>
    {!state.snapshot ? <SectionCard title="Library records unavailable" eyebrow="No verified snapshot"><p>The page will populate after the GitHub publisher completes successfully. No controller status is inferred from missing records.</p></SectionCard> : <>
      {!overview && <p role="status">{customer.name} records are awaiting their first complete GitHub publication.</p>}
      {active === 'overview' && <><div className="metric-grid"><MetricCard label="Locations" value={String(locationCount)} detail={LIBRARY_CUSTOMERS.filter(item => docs.some(doc => doc.path === `customers/${item.id}/README.md`)).map(item => item.name).join(' · ')} /><MetricCard label={`${customer.name} records`} value={String(customerDocs.length)} detail="From the exact revision shown above" /><MetricCard label="Change records" value={String(history.length)} detail="Preparation and installation kept distinct" /><MetricCard label="Source" value="GitHub" detail="One-way publication · no PLC access" /></div>{overview && <DocumentCard key={overview.path} document={overview} revision={revision} expanded />}</>}
      {active === 'notebooks' && <SectionCard title={`${customer.name} notebooks`} eyebrow="Original records · preserved history"><p>Read the dated entries and current build profile together. Historical observations are not a fresh controller check. HTML notebooks are displayed as read-only text, tables and links; scripts and embedded media are excluded.</p>{notebooks.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
      {active === 'plans' && <SectionCard title={`${customer.name} plans & issues`} eyebrow="Original notebook wording"><p>Status comes from the records below; publication does not mean a repair has been installed or verified.</p>{notebook && issues.length > 0 && <div className={styles.markdown}><PlcLibraryDocument document={notebook} revision={revision} content={issues.join('\n\n')} /></div>}{plans.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} expanded />)}{!issues.length && !plans.length && <p>No separately indexed plan sections found. Review the full notebooks; this does not mean there are no open issues.</p>}{notebook && <DocumentCard document={notebook} revision={revision} />}</SectionCard>}
      {active === 'history' && <SectionCard title={`${customer.name} change history`} eyebrow="Newest record first">{history.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
      {active === 'standards' && <SectionCard title="Shared standards" eyebrow="Adoption is separate"><p>A documented standard is not proof it is installed at a customer.</p>{standards.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
      {active === 'records' && <SectionCard title={`${customer.name} library & backups`} eyebrow="Private GitHub · separate sign-in may be required"><p>Only reviewed documentation is synchronized. Full backups and credentials stay outside this page. See the manifest for verified links and known coverage limits.</p>{records.map(doc => <DocumentCard key={doc.path} document={doc} revision={revision} />)}</SectionCard>}
    </>}
    <footer className={styles.footer}><Link href="/dashboard">← Dashboard</Link><span>Planning and records only · no PLC requests or control actions</span></footer>
  </main>;
}
