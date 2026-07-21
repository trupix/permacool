import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { requireUser } from '@/lib/auth';
import { isStaffScope } from '@/lib/access';
import { getOrganizations } from '@/server/repositories/organizations';
import { getDevices } from '@/server/repositories/devices';
import { getSites } from '@/server/repositories/sites';
import { getSupportTickets } from '@/server/repositories/portal';
import { createSupportTicket, updateSupportTicketStatus } from './actions';

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const [organizations, sites, devices, tickets, params] = await Promise.all([
    getOrganizations(user), getSites(user), getDevices(user), getSupportTickets(user), searchParams
  ]);

  return <main className="page-stack">
    <header><p className="eyebrow">Support</p><h1>Equipment support</h1><p className="page-copy">Request help and track service activity for your equipment.</p></header>
    {params.status === 'created' ? <p className="auth-callout">Support request created.</p> : null}
    <SectionCard title="New support request" eyebrow="PermaCool service">
      <form action={createSupportTicket} className="auth-form">
        <label>Organization<select name="organizationId" required>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>
        <label>Site<select name="siteId"><option value="">General</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
        <label>Machine<select name="deviceId"><option value="">General</option>{devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</select></label>
        <label>Subject<input name="subject" required /></label>
        <label>Description<textarea name="description" rows={5} required /></label>
        <button className="button-primary" type="submit">Submit request</button>
      </form>
    </SectionCard>
    <SectionCard title="Support history" eyebrow={`${tickets.length} requests`}>
      <div className="list-stack">{tickets.length ? tickets.map((ticket) => <div className="list-row" key={ticket.id}><div><strong>{ticket.subject}</strong><p>{ticket.createdAt.toLocaleString()}</p></div>{isStaffScope(user) ? <form action={updateSupportTicketStatus}><input type="hidden" name="ticketId" value={ticket.id} /><select name="status" defaultValue={ticket.status}><option value="open">Open</option><option value="in_progress">In progress</option><option value="waiting_on_customer">Waiting on customer</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><button className="button-secondary" type="submit">Update</button></form> : <StatusBadge tone={ticket.status === 'resolved' || ticket.status === 'closed' ? 'online' : 'warning'} label={ticket.status.replaceAll('_', ' ')} />}</div>) : <p className="empty-state">No support requests yet.</p>}</div>
    </SectionCard>
  </main>;
}
