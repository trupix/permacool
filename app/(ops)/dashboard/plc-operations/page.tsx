import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Activity, BookOpen, ClipboardList, ExternalLink, FolderArchive, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { requireStaff } from '@/lib/auth';
import { isSupabaseAuthEnabled } from '@/lib/env';
import { SectionCard } from '@/components/section-card';
import { MetricCard } from '@/components/metric-card';
import styles from './plc-operations.module.css';

export const metadata: Metadata = { title: 'PLC Operations', robots: { index: false, follow: false } };

// Reviewed library snapshot, not a controller poll or automatic GitHub sync.
const root = 'https://github.com/nyramyqueen/permacool-controller-library/blob';
const revision = '12503bfe3ad2936c292e40d43e40d0a1ddace038';
const customer = `${root}/${revision}/customers/baldwin-park`;
const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'plans', label: 'Plans & issues', icon: ClipboardList },
  { id: 'history', label: 'Change history', icon: Activity },
  { id: 'standards', label: 'Standards', icon: ShieldCheck },
  { id: 'records', label: 'Library & backups', icon: FolderArchive }
] as const;

function Resource({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className={styles.resource} href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={14} aria-hidden="true" /></a>;
}

export default async function PlcOperationsPage({ searchParams }: { searchParams: Promise<{ section?: string | string[] }> }) {
  // Never expose internal records through the application's production mock fallback.
  if (process.env.NODE_ENV === 'production' && !isSupabaseAuthEnabled()) notFound();
  await requireStaff();
  const requested = (await searchParams).section;
  const active = sections.find(section => section.id === requested)?.id ?? 'overview';

  return <main className={`page-stack ${styles.workspace}`}>
    <header className={styles.header}>
      <div><p className="eyebrow">PermaCool · Staff workspace</p><h1>PLC Operations</h1>
        <p className="page-copy">One place for the plan, the work and the evidence.</p></div>
      <span className={styles.private}><ShieldCheck size={15} /> Private · No equipment controls</span>
    </header>
    <nav className="site-section-nav" aria-label="PLC Operations sections">
      {sections.map(({ id, label, icon: Icon }) => <Link key={id} href={`/dashboard/plc-operations?section=${id}`} scroll={false} className={active === id ? 'is-active' : undefined} aria-current={active === id ? 'page' : undefined}><Icon size={15} aria-hidden="true" /><span>{label}</span></Link>)}
    </nav>
    <div className={styles.provenance}><BookOpen size={16} aria-hidden="true" /><p>Records reviewed November 13, 2026 · Pacific time. Library snapshot <code>12503bf</code>. This is a planning record, not live PLC health. Updates are published with reviewed records; automatic synchronization is not enabled.</p></div>

    {active === 'overview' && <>
      <div className="metric-grid"><MetricCard label="Locations in this workspace" value="1" detail="Baldwin Park · other sites not yet imported" /><MetricCard label="Documented open issues" value="2" detail="Slot-0 disconnects and PAC export fault" /><MetricCard label="Firmware repair" value="Planned" detail="R1.3f proposed · not installed" /><MetricCard label="Next action" value="Vendor review" detail="Owner: David / PermaCool" /></div>
      <SectionCard title="Baldwin Park" eyebrow="First customer record" action={<Link href="/dashboard/plc-operations?section=plans">View repair plan →</Link>}>
        <div className={styles.alert}><span className={styles.badge}>Unresolved · BP-IO-001</span><h3>Slot-0 output module disconnects</h3><p>The module dropped out and returned about 2.7 seconds later. Recurrence after the requested restart means recovery is not yet established.</p><strong>Physical output behavior during the gaps is unknown.</strong></div>
        <div className={styles.facts}><div><small>Controller · observed</small><strong>GRV-EPIC-PR1</strong><span>EPIC 3.6.0-b.32 · PAC R10.5g</span></div><div><small>Slot 0 · observed</small><strong>GRV-OAC-12 · R1.0k</strong><span>Proposed target: R1.3f</span></div><div><small>Release boundary</small><strong>No update performed</strong><span>Local sensor simulation is not installed software.</span></div></div>
        <Resource href={`${customer}/controller-notebook.md`}>Open Baldwin Park notebook</Resource>
      </SectionCard>
      <SectionCard title="What happens next" eyebrow="Keep the work deliberate"><ol className={styles.steps}><li>Ask Opto to review the disconnect logs and confirm the firmware path.</li><li>Arrange isolated maintenance and verify backup coverage before authorizing an update.</li><li>Verify the installed result, then gather follow-up evidence before closing the issue.</li></ol></SectionCard>
    </>}

    {active === 'plans' && <>
      <SectionCard title="Baldwin Park repair plan" eyebrow="BP-IO-001 · Owner: David / PermaCool">
        <div className={styles.flow}>{['Planned', 'Prepared', 'Ready for installation', 'Installed · awaiting verification', 'Verified'].map((label, i) => <span key={label} className={i === 0 ? styles.current : ''}>{label}</span>)}</div>
        <p>Current stage: <strong>Planned.</strong> R1.3f is the proposed module firmware. It is not a confirmed cure for the error-counter disconnects. The documented quality-code-9 fix is a different symptom.</p>
        <ol className={styles.steps}><li><strong>Vendor review.</strong> Confirm the R1.0k → R1.3f upgrade path for the GRV-OAC-12 and review possible power, noise, connection or hardware causes.</li><li><strong>Safe maintenance window.</strong> Qualified onsite personnel must shut down and physically isolate affected equipment while keeping the PLC powered. Software Off is not isolation.</li><li><strong>Preserve recovery evidence.</strong> Verify existing backups, capture required settings read-only and save logs. Do not repeat the failed PAC Terminal NVF export or restore its partial file.</li><li><strong>Separately authorize installation.</strong> Coordinate PAC Stop and safe output commands under isolation. Use stable power and a local connection. groov Manage → I/O → slot 0 → Config → Update Module Firmware. Verify the exact model/file first; the module goes offline.</li><li><strong>Verify before return to service.</strong> Confirm R1.3f, configuration, safe commands and module availability. Keep isolation in place for initial checks, then coordinate supervised return to operation.</li></ol>
        <Resource href={`${customer}/controller-notebook.md#open-issue-bp-io-001-slot-0-output-module-disconnects`}>Full repair directions and evidence</Resource>
      </SectionCard>
      <div className="content-grid"><SectionCard title="Follow-up checks" eyebrow="Planned · not scheduled"><ul className={styles.steps}><li>Immediately after an authorized repair.</li><li>Approximately 24 hours later.</li><li>Daily for seven days of representative operation; extend for idle time or incomplete evidence.</li></ul><p>Record timestamps, firmware, uptime, log coverage and any new disconnects. Missing access or reset counters do not count as a pass.</p><p><strong>Close only after corrective action, adequate evidence and David’s review.</strong> This is not continuous safety monitoring.</p></SectionCard>
      <SectionCard title="Other work to retain" eyebrow="Separate issues"><div className={styles.item}><strong>PAC variable-export crash · unresolved</strong><p>The November 13 export fault needs Opto review. Do not retry the failed export on an operating PLC.</p></div><div className={styles.item}><strong>Six independent sensor simulations · prepared</strong><p>Local PAC Sim and groov tests passed. Physical retention, migration, live bindings and candidate-file discrepancy remain release gates.</p></div><div className={styles.item}><strong>CH2 low-pressure NaN · cause unknown</strong><p>Reading recovered after the requested restart. No causal connection to slot 0 has been established.</p></div></SectionCard></div>
    </>}

    {active === 'history' && <SectionCard title="Baldwin Park change history" eyebrow="November 13, 2026 · PST">
      {[
        ['006', 'Slot-0 repair plan recorded', 'Documentation only. R1.3f proposed; no firmware update or automated monitoring.'],
        ['005', 'Local groov sensor controls verified', 'Six independent controls tested in local simulation. Live groov unchanged.'],
        ['004', 'PAC Sim retention and startup verified', 'Local matrix and restart tests passed. Not proof of physical PLC retention.'],
        ['003', 'Independent sensor candidate prepared', 'Separate offline copy edited and compiled. Not uploaded.'],
        ['002', '44 live settings captured read-only', 'Selected values verified after the separate export fault. Not a complete restore image.']
      ].map(([id, title, detail]) => <article className={styles.history} key={id}><span className={styles.recordId}>{id}</span><div><h3>{title}</h3><p>{detail}</p><Resource href={`${customer}/changes/2026-11-13-${id}.md`}>Read change record</Resource></div></article>)}
      <p className={styles.note}>This history records preparation and observations separately from installation. No new live PLC installation is claimed by these entries.</p>
    </SectionCard>}

    {active === 'standards' && <SectionCard title="Shared standards" eyebrow="Library baseline 0.1.0 · adoption not commissioned">
      <p>The library is the authoritative reference. A standard being documented does not mean every customer has it installed.</p>
      <div className={styles.resourceGrid}>{[['baseline.md', 'Baseline & status definitions'], ['pac-control.md', 'PAC Control'], ['node-red.md', 'Node-RED'], ['groov-view.md', 'groov View'], ['website.md', 'Website'], ['build-architecture.md', 'Reusable customer builds'], ['change-workflow.md', 'Change & release workflow']].map(([file, label]) => <Resource key={file} href={`${root}/${revision}/standards/${file}`}>{label}</Resource>)}</div>
      <div className={styles.alert}><h3>Rules that always travel with a change</h3><ul className={styles.steps}><li>Prepared is not installed; installed is not verified.</li><li>Output commands are not proof of physical operation.</li><li>Unknown, stale and invalid must never appear healthy.</li><li>Preserve backups and customer-specific mappings.</li><li>No automatic restarts or equipment changes from a planning record.</li></ul></div>
    </SectionCard>}

    {active === 'records' && <SectionCard title="Baldwin Park library" eyebrow="Private GitHub · separate sign-in may be required">
      <div className={styles.resourceGrid}><Resource href={`${customer}/controller-notebook.md`}>Reviewed notebook</Resource><Resource href={`${customer}/changes/2026-11-13-006.md`}>Repair plan record · 006</Resource><Resource href={`${customer}/build-profile.md`}>Customer build profile</Resource><Resource href={`${customer}/backups.md`}>Backup manifest</Resource><Resource href={`${root}/main/customers/baldwin-park/controller-notebook.md`}>Latest notebook on GitHub</Resource><Resource href={`${root}/main/standards/baseline.md`}>Latest baseline on GitHub</Resource></div>
      <div className={styles.alert}><h3>Backup status is not a green check yet</h3><p>The manifest identifies existing local artifacts. Drive links and restoration are not verified in this record. Full backups and credentials stay outside GitHub. The partial NVF must not be restored.</p></div>
      <p>Reviewed links are pinned to the published record revision. “Latest” links may contain newer work than this page’s summary. No background GitHub or Drive synchronization is currently running.</p>
    </SectionCard>}
    <footer className={styles.footer}><Link href="/dashboard">← Dashboard</Link><span>Planning and records only · no PLC requests or control actions</span></footer>
  </main>;
}
