import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProvisioningWorkspace } from '@/components/provisioning-workspace';
import { requireUser } from '@/lib/auth';
import { canAccessProvisioning, roleForOrganization } from '@/lib/workspace-access';
import { getOpenVpnProvisioningStatus } from '@/server/openvpn-access-server';
import { getOrganizations } from '@/server/repositories/organizations';
import { getProvisioningSnapshot } from '@/server/repositories/provisioning';

export const metadata: Metadata = {
  title: 'Site & PLC Provisioning',
  description: 'Add operating sites, register PLCs, and issue unique OpenVPN profiles for field controllers.'
};

export const dynamic = 'force-dynamic';

export default async function ProvisioningPage() {
  const user = await requireUser();
  if (!canAccessProvisioning(user)) redirect('/dashboard');

  const [snapshot, vpn, organizations] = await Promise.all([
    getProvisioningSnapshot(user),
    Promise.resolve(getOpenVpnProvisioningStatus()),
    getOrganizations(user)
  ]);

  return (
    <main className="page-stack provisioning-page">
      <header>
        <p className="eyebrow">Infrastructure workspace</p>
        <h1>Site &amp; PLC provisioning</h1>
        <p className="page-copy">
          Register field locations, add controllers, and issue a separate VPN identity for every unattended PLC.
        </p>
      </header>

      <ProvisioningWorkspace
        initialSites={snapshot.sites}
        organizations={organizations.map(({ id, name }) => ({
          id,
          name,
          role: roleForOrganization(user, id) ?? 'viewer'
        }))}
        storageReady={snapshot.storageReady}
        vpnConfigured={vpn.configured}
        vpnHost={vpn.host}
      />
    </main>
  );
}
