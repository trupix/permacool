import Link from 'next/link';
import { Download } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EquipmentEventList } from '@/components/equipment-event-list';
import { SiteSectionNav } from '@/components/site-section-nav';
import { requireUser } from '@/lib/auth';
import { getSiteEquipmentEvents } from '@/server/repositories/equipment-events';
import { getSite } from '@/server/repositories/sites';

const PAGE_SIZE = 100;

export default async function SiteEventsPage({
  params,
  searchParams
}: {
  params: Promise<{ siteid: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ siteid: siteId }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const site = await getSite(siteId);
  if (!site || !user.organizationIds.includes(site.organizationId)) notFound();

  const pageNumber = Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1);
  const eventPage = await getSiteEquipmentEvents(site.id, {
    limit: PAGE_SIZE,
    offset: (pageNumber - 1) * PAGE_SIZE
  });
  const totalPages = Math.max(Math.ceil(eventPage.total / PAGE_SIZE), 1);

  return (
    <main className="page-stack">
      <SiteSectionNav siteId={site.id} siteName={site.name} active="events" />

      <header className="site-events-heading">
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
          <EquipmentEventList events={eventPage.events} timezone={site.timezone} />
        </div>
        {totalPages > 1 ? (
          <footer className="event-pagination">
            {pageNumber > 1 ? <Link href={`?page=${pageNumber - 1}`}>Newer events</Link> : <span />}
            {pageNumber < totalPages ? <Link href={`?page=${pageNumber + 1}`}>Older events</Link> : null}
          </footer>
        ) : null}
      </section>
    </main>
  );
}
