import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import { requireUser } from '@/lib/auth';
import { isLabPortalCustomer } from '@/lib/auth-forms';
import { redirect } from 'next/navigation';
import './ops.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Agenticly.Cool',
    template: '%s | Agenticly.Cool'
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
  if (isLabPortalCustomer(user, process.env.LAB_ORGANIZATION_ID ?? '')) redirect('/lab');

  return <AppShell user={user}>{children}</AppShell>;
}
