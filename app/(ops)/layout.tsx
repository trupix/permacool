import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Agenticly Control',
    template: '%s | Agenticly Control'
  },
  description: 'Connected intelligence for industrial cooling operations.',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return <AppShell user={user}>{children}</AppShell>;
}
