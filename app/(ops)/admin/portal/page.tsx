import { SectionCard } from '@/components/section-card';
import { requireStaff } from '@/lib/auth';
import { getOrganizations } from '@/server/repositories/organizations';
import { getSites } from '@/server/repositories/sites';
import { getDevices } from '@/server/repositories/devices';
import { publishDocument, saveInvoiceReference } from './actions';

export default async function PortalAdminPage() {
  const admin = await requireStaff(['staff_admin']);
  const [organizations, sites, devices] = await Promise.all([getOrganizations(admin), getSites(admin), getDevices(admin)]);
  return <main className="page-stack">
    <header><p className="eyebrow">Admin</p><h1>Customer portal content</h1><p className="page-copy">Publish customer documents and map FreshBooks invoice references.</p></header>
    <div className="content-grid">
      <SectionCard title="Publish document" eyebrow="Customer library">
        <form action={publishDocument} className="auth-form">
          <label>Title<input name="title" required /></label>
          <label>URL<input name="url" type="url" required /></label>
          <label>Category<select name="category"><option value="manual">Manual</option><option value="cutsheet">Cutsheet</option><option value="wiring">Wiring</option><option value="service">Service</option><option value="other">Other</option></select></label>
          <label>Visibility<select name="organizationId"><option value="">All approved customers</option>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>
          <label>Site (optional)<select name="siteId"><option value="">All organization sites</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
          <label>Machine (optional)<select name="deviceId"><option value="">All eligible machines</option>{devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</select></label>
          <button className="button-primary" type="submit">Publish document</button>
        </form>
      </SectionCard>
      <SectionCard title="Add or update invoice" eyebrow="FreshBooks reference">
        <form action={saveInvoiceReference} className="auth-form">
          <label>Organization<select name="organizationId" required>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>
          <label>FreshBooks invoice ID<input name="freshbooksInvoiceId" required /></label>
          <label>Invoice number<input name="invoiceNumber" required /></label>
          <label>Status<input name="status" required /></label>
          <label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label>
          <label>Issued<input name="issuedAt" type="date" required /></label>
          <label>Due<input name="dueAt" type="date" /></label>
          <label>Hosted invoice URL<input name="hostedUrl" type="url" /></label>
          <button className="button-primary" type="submit">Save invoice</button>
        </form>
      </SectionCard>
    </div>
  </main>;
}
