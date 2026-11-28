import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { CycleAverages } from '@/components/cycle-averages';
import { Download } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EquipmentEventList } from '@/components/equipment-event-list';
import { EventsSnapshotRefresh } from '@/components/events-snapshot-refresh';
import { SiteSectionNav } from '@/components/site-section-nav';
import { requireUser } from '@/lib/auth';
import { groovManageUrlForDevices, nodeRedUrlForDevices } from '@/lib/controller-links';
import { getDevicesBySite } from '@/server/repositories/devices';
import { getHistoryPage } from '@/server/repositories/equipment-events';
import { getSite } from '@/server/repositories/sites';

const PAGE_SIZE = 100;

export default async function SiteEventsPage({
  params,
  searchParams
}: {
  params: Promise<{ siteid: string }>;
  searchParams: Promise<{ page?: string; through?: string }>;
}) {
  const [{ siteid: siteId }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const site = await getSite(user, siteId);
  if (!site) notFound();

  const pageNumber = Math.min(10_000_000, Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1));
  const candidate = typeof query.through === 'string' ? query.through : '';
  const timestamp = Date.parse(candidate);
  const through = Number.isFinite(timestamp) && timestamp <= Date.now() && new Date(timestamp).toISOString() === candidate ? candidate : undefined;
  const siteDevices = await getDevicesBySite(user, site.id);
  const controllerManageUrl = groovManageUrlForDevices(siteDevices);
  const nodeRedUrl = nodeRedUrlForDevices(siteDevices);

  return (
    <main className="page-stack">
      <SiteSectionNav
        siteId={site.id}
        siteName={site.name}
        active="events"
        controllerManageUrl={controllerManageUrl}
        nodeRedUrl={nodeRedUrl}
      />

      <header className="site-events-heading">
        {site.id === 'site-golddrop' ? <Image src="/images/customers/golddrop.svg" alt="GoldDrop" width={1500} height={260} className="site-company-logo" priority /> : null}
        <p className="eyebrow">Permanent operating record</p>
        <div className="site-events-title-row">
          <div>
            <h1>Recent events</h1>
            <p className="page-copy">{site.name} · System transitions, normal cycles, and safety stops.</p>
          </div>
          <a className="ops-action-button" href={`/api/sites/${site.id}/events?download=csv`}>
            <Download size={16} /> Download log
          </a>
        </div>
      </header>

      {through ? <p className="page-copy">Viewing a fixed history · <Link href={`/sites/${site.id}/events`} prefetch={false}>Show latest events</Link></p> : <EventsSnapshotRefresh />}
      <Suspense fallback={<p>Loading cycle averages…</p>}><CycleAverages siteId={site.id} timezone={site.timezone} /></Suspense>
      <Suspense fallback={<section className="panel"><p>Loading saved event history…</p></section>}>
        <EventHistory siteId={site.id} timezone={site.timezone} pageNumber={pageNumber} through={through} />
      </Suspense>
    </main>
  );
}

async function EventHistory({ siteId, timezone, pageNumber, through }: { siteId: string; timezone: string; pageNumber: number; through?: string }) {
  const eventPage = await getHistoryPage(siteId, PAGE_SIZE, (pageNumber - 1) * PAGE_SIZE, through);
  const href = (n: number) => `/sites/${siteId}/events?page=${n}&through=${encodeURIComponent(eventPage.through)}`;
  const totalPages = Math.max(Math.ceil(eventPage.total / PAGE_SIZE), 1);
  return <>
      {!eventPage.persistenceReady ? (
        <div className="ops-notice">
          Event history storage is waiting for the production database migration. Live telemetry remains available.
        </div>
      ) : null}

      <section className="panel event-history-panel">
        <header className="section-card-heading">
          <div>
            <p className="eyebrow">Newest first</p>
            <h2>{eventPage.total.toLocaleString()} recorded events</h2>
          </div>
          <span className="event-page-count">Page {Math.min(pageNumber, totalPages)} of {totalPages}</span>
        </header>
        <div className="section-card-body event-history-scroll">
          <EquipmentEventList events={eventPage.events} timezone={timezone} />
        </div>
        {totalPages > 1 ? (
          <footer className="event-pagination">
            {pageNumber > 1 ? <Link href={href(pageNumber - 1)} prefetch={false}>Newer events</Link> : <span />}
            {pageNumber < totalPages ? <Link href={href(pageNumber + 1)} prefetch={false}>Older events</Link> : null}
          </footer>
        ) : null}
      </section>
    </>;
}
