import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { TelemetryFlow } from '@/components/telemetry-flow';

export const metadata: Metadata = { title: 'Telemetry flow | PermaCool' };
export default async function TelemetryFlowPage() {
  await requireUser();
  return <main className="page-stack">
    <header><Link href="/dashboard">← Dashboard</Link><p className="eyebrow">GoldDrop · planned monitoring system</p><h1>How telemetry flows</h1><p className="page-copy">Follow a reading from the controller to its permanent history. This interactive illustration does not operate equipment or show live connection status.</p></header>
    <TelemetryFlow />
  </main>;
}
