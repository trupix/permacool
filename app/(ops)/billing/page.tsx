import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { requireUser } from '@/lib/auth';
import { getInvoices } from '@/server/repositories/portal';

export default async function BillingPage() {
  const user = await requireUser();
  const invoices = await getInvoices(user);
  return <main className="page-stack">
    <header><p className="eyebrow">Billing</p><h1>Invoices</h1><p className="page-copy">Read-only invoice status synchronized from FreshBooks.</p></header>
    <SectionCard title="Invoice history" eyebrow={`${invoices.length} invoices`}>
      <div className="table-like">{invoices.length ? invoices.map((invoice) => <div className="table-row" key={invoice.id}><span>{invoice.invoiceNumber}</span><span>{invoice.issuedAt.toLocaleDateString()}</span><span>{invoice.currency} {invoice.amount.toFixed(2)}</span><span>{invoice.status}</span>{invoice.hostedUrl ? <Link href={invoice.hostedUrl} target="_blank" rel="noreferrer">View invoice</Link> : <span />}</div>) : <p className="empty-state">No invoices are available.</p>}</div>
    </SectionCard>
  </main>;
}
