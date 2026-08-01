'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Check,
  CircleAlert,
  Download,
  HardDrive,
  KeyRound,
  Link2,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Network,
  Plus,
  ServerCog,
  ShieldCheck
} from 'lucide-react';
import type { ProvisioningSite } from '@/server/repositories/provisioning';
import type { UserRole } from '@/types/domain';

type Notice = { tone: 'success' | 'error'; text: string } | null;

const timezones = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Phoenix'
];

const controllerModels = [
  'Opto 22 groov EPIC PR1',
  'Opto 22 groov EPIC PR2',
  'Opto 22 groov RIO',
  'Other PLC'
];

function address(site: ProvisioningSite) {
  const locality = [site.city, site.state, site.postalCode].filter(Boolean).join(', ');
  return [site.addressLine1, locality, site.country].filter(Boolean).join(' · ') || site.region;
}

function downloadName(disposition: string | null, fallback: string) {
  const match = disposition?.match(/filename="([^"]+)"/i);
  return match?.[1] || `${fallback}.ovpn`;
}

function canManageRole(role: UserRole | undefined) {
  return role === 'owner' || role === 'operator';
}

function profileStatusLabel(status: ProvisioningSite['devices'][number]['vpnProfileStatus']) {
  if (status === 'external') return 'Externally issued';
  if (status === 'issuing') return 'Issuance locked';
  const label = status.replaceAll('_', ' ');
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function ProvisioningWorkspace({
  initialSites,
  organizations,
  storageReady,
  vpnConfigured,
  vpnHost
}: {
  initialSites: ProvisioningSite[];
  organizations: Array<{ id: string; name: string; role: UserRole }>;
  storageReady: boolean;
  vpnConfigured: boolean;
  vpnHost: string | null;
}) {
  const router = useRouter();
  const editableOrganizations = organizations.filter(({ role }) => canManageRole(role));
  const editableOrganizationIds = new Set(editableOrganizations.map(({ id }) => id));
  const editableSites = initialSites.filter((site) => editableOrganizationIds.has(site.organizationId));
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState<'site' | 'device' | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState({
    organizationId: editableOrganizations[0]?.id ?? '',
    name: '',
    addressLine1: '',
    city: '',
    state: 'CA',
    postalCode: '',
    country: 'US',
    region: 'California, US',
    timezone: 'America/Los_Angeles'
  });
  const [deviceForm, setDeviceForm] = useState({
    siteId: editableSites[0]?.id ?? '',
    name: '',
    plcModel: controllerModels[0],
    serialNumber: '',
    firmwareVersion: '',
    protocol: 'Node-RED HTTPS telemetry',
    localIpAddress: '',
    tunnelIp: ''
  });

  const devices = useMemo(() => initialSites.flatMap((site) => site.devices), [initialSites]);
  const roleByOrganization = useMemo(
    () => new Map(organizations.map(({ id, role }) => [id, role])),
    [organizations]
  );
  const roleForSite = (siteId: string) => {
    const site = initialSites.find((candidate) => candidate.id === siteId);
    return site ? roleByOrganization.get(site.organizationId) : undefined;
  };
  const canManageAny = editableOrganizations.length > 0;
  const canManageSelectedOrganization = canManageRole(roleByOrganization.get(siteForm.organizationId));
  const canManageSelectedSite = canManageRole(roleForSite(deviceForm.siteId));

  useEffect(() => {
    if (!deviceForm.siteId && editableSites[0]?.id) {
      setDeviceForm((current) => ({ ...current, siteId: editableSites[0].id }));
    }
  }, [deviceForm.siteId, editableSites]);

  async function createSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageSelectedOrganization || !storageReady || saving) return;
    setSaving('site');
    setNotice(null);
    try {
      const response = await fetch('/api/provisioning/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteForm)
      });
      const payload = await response.json() as { site?: { name: string }; error?: string };
      if (!response.ok || !payload.site) throw new Error(payload.error || 'The site could not be created.');
      setSiteForm((current) => ({ ...current, name: '', addressLine1: '', city: '', state: 'CA', postalCode: '', country: 'US', region: 'California, US', timezone: 'America/Los_Angeles' }));
      setNotice({ tone: 'success', text: `${payload.site.name} was added to Agenticly.Cool.` });
      router.refresh();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The site could not be created.' });
    } finally {
      setSaving(null);
    }
  }

  async function createDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageSelectedSite || !storageReady || saving) return;
    setSaving('device');
    setNotice(null);
    try {
      const response = await fetch('/api/provisioning/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceForm)
      });
      const payload = await response.json() as { device?: { name: string }; error?: string };
      if (!response.ok || !payload.device) throw new Error(payload.error || 'The PLC could not be added.');
      setDeviceForm((current) => ({ ...current, name: '', serialNumber: '', firmwareVersion: '', localIpAddress: '', tunnelIp: '' }));
      setNotice({ tone: 'success', text: `${payload.device.name} was registered with its own VPN identity.` });
      router.refresh();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The PLC could not be added.' });
    } finally {
      setSaving(null);
    }
  }

  async function generateProfile(deviceId: string, identity: string, organizationId: string) {
    if (roleByOrganization.get(organizationId) !== 'owner' || !vpnConfigured || generatingId) return;
    setGeneratingId(deviceId);
    setNotice(null);
    try {
      const response = await fetch(`/api/provisioning/devices/${encodeURIComponent(deviceId)}/vpn-profile`, { method: 'POST' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || 'The VPN profile could not be generated.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName(response.headers.get('Content-Disposition'), identity);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice({ tone: 'success', text: `${identity}.ovpn was generated. Store it securely and import it only into that PLC.` });
      router.refresh();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The VPN profile could not be generated.' });
    } finally {
      setGeneratingId(null);
    }
  }

  async function registerExternalProfile(deviceId: string, currentIdentity: string | null, organizationId: string) {
    if (roleByOrganization.get(organizationId) !== 'owner' || registeringId) return;
    const identity = window.prompt(
      'Enter the exact OpenVPN identity already used to generate this PLC profile.',
      currentIdentity || ''
    )?.trim();
    if (!identity) return;
    if (!window.confirm(`Register ${identity} as already issued outside Agenticly.Cool? This will not generate or download a profile.`)) return;

    setRegisteringId(deviceId);
    setNotice(null);
    try {
      const response = await fetch(`/api/provisioning/devices/${encodeURIComponent(deviceId)}/external-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity })
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'The existing VPN profile could not be registered.');
      setNotice({ tone: 'success', text: `${identity} is now recorded as externally issued. No new profile was generated.` });
      router.refresh();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The existing VPN profile could not be registered.' });
    } finally {
      setRegisteringId(null);
    }
  }

  return (
    <>
      <section className="provisioning-summary" aria-label="Provisioning summary">
        <article><span><Building2 size={17} /></span><div><strong>{initialSites.length}</strong><small>Managed sites</small></div></article>
        <article><span><HardDrive size={17} /></span><div><strong>{devices.length}</strong><small>Registered PLCs</small></div></article>
        <article className={vpnConfigured ? 'is-ready' : 'is-pending'}>
          <span><Network size={17} /></span>
          <div><strong>{vpnConfigured ? 'Connected' : 'Pending'}</strong><small>{vpnHost || 'OpenVPN provisioning bridge'}</small></div>
        </article>
      </section>

      <section className="provisioning-principle">
        <span><KeyRound size={21} /></span>
        <div>
          <strong>Same VPN server. Unique identity for every PLC.</strong>
          <p>The server address stays the same, but each downloaded profile contains a different client certificate and private key. Never copy one PLC profile to another controller.</p>
        </div>
      </section>

      {!storageReady ? <div className="ops-notice">Provisioning storage is not connected, so changes are disabled.</div> : null}
      {!canManageAny ? (
        <div className="provisioning-role-notice"><LockKeyhole size={17} /><p>Your organization memberships are currently <strong>read-only</strong>. An owner must promote the appropriate membership before you can add infrastructure or issue credentials.</p></div>
      ) : null}
      {notice ? <div className={`provisioning-notice is-${notice.tone}`}>{notice.tone === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}{notice.text}</div> : null}

      <div className="provisioning-form-grid">
        <form className="panel provisioning-form" onSubmit={createSite}>
          <header><span><MapPin size={18} /></span><div><p className="eyebrow">Step 1</p><h2>Add a site</h2></div></header>
          <fieldset disabled={!canManageSelectedOrganization || !storageReady || Boolean(saving)}>
            <label className="is-wide"><span>Organization</span><select required value={siteForm.organizationId} onChange={(event) => setSiteForm({ ...siteForm, organizationId: event.target.value })}>{editableOrganizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select></label>
            <label className="is-wide"><span>Site name</span><input required maxLength={120} value={siteForm.name} onChange={(event) => setSiteForm({ ...siteForm, name: event.target.value })} placeholder="Los Angeles Process Campus" /></label>
            <label className="is-wide"><span>Street address</span><input maxLength={180} value={siteForm.addressLine1} onChange={(event) => setSiteForm({ ...siteForm, addressLine1: event.target.value })} placeholder="3558 E 8th St" /></label>
            <label><span>City</span><input maxLength={100} value={siteForm.city} onChange={(event) => setSiteForm({ ...siteForm, city: event.target.value })} placeholder="Los Angeles" /></label>
            <label><span>State</span><input maxLength={80} value={siteForm.state} onChange={(event) => setSiteForm({ ...siteForm, state: event.target.value })} placeholder="CA" /></label>
            <label><span>ZIP / postal code</span><input maxLength={24} value={siteForm.postalCode} onChange={(event) => setSiteForm({ ...siteForm, postalCode: event.target.value })} placeholder="90023" /></label>
            <label><span>Region label</span><input required maxLength={120} value={siteForm.region} onChange={(event) => setSiteForm({ ...siteForm, region: event.target.value })} placeholder="California, US" /></label>
            <label className="is-wide"><span>Time zone</span><select value={siteForm.timezone} onChange={(event) => setSiteForm({ ...siteForm, timezone: event.target.value })}>{timezones.map((timezone) => <option key={timezone}>{timezone}</option>)}</select></label>
          </fieldset>
          <footer><p>Every new site receives blank Live, Connectivity, Location Specs, and Events pages.</p><button type="submit" disabled={!canManageSelectedOrganization || !storageReady || Boolean(saving)}>{saving === 'site' ? <LoaderCircle className="is-spinning" size={15} /> : <Plus size={15} />} Add site</button></footer>
        </form>

        <form className="panel provisioning-form" onSubmit={createDevice}>
          <header><span><ServerCog size={18} /></span><div><p className="eyebrow">Step 2</p><h2>Add an Opto 22 PLC</h2></div></header>
          <fieldset disabled={!canManageSelectedSite || !storageReady || Boolean(saving) || !editableSites.length}>
            <label className="is-wide"><span>Site</span><select required value={deviceForm.siteId} onChange={(event) => setDeviceForm({ ...deviceForm, siteId: event.target.value })}>{editableSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
            <label className="is-wide"><span>Controller name</span><input required maxLength={120} value={deviceForm.name} onChange={(event) => setDeviceForm({ ...deviceForm, name: event.target.value })} placeholder="Los Angeles groov EPIC 01" /></label>
            <label className="is-wide"><span>PLC model</span><select value={deviceForm.plcModel} onChange={(event) => setDeviceForm({ ...deviceForm, plcModel: event.target.value })}>{controllerModels.map((model) => <option key={model}>{model}</option>)}</select></label>
            <label><span>Serial number</span><input maxLength={100} value={deviceForm.serialNumber} onChange={(event) => setDeviceForm({ ...deviceForm, serialNumber: event.target.value })} placeholder="Optional" /></label>
            <label><span>Firmware</span><input maxLength={100} value={deviceForm.firmwareVersion} onChange={(event) => setDeviceForm({ ...deviceForm, firmwareVersion: event.target.value })} placeholder="3.5.1-b.85" /></label>
            <label><span>PLC local IP</span><input inputMode="decimal" value={deviceForm.localIpAddress} onChange={(event) => setDeviceForm({ ...deviceForm, localIpAddress: event.target.value })} placeholder="192.168.1.10" /></label>
            <label><span>Requested VPN IP</span><input inputMode="decimal" value={deviceForm.tunnelIp} onChange={(event) => setDeviceForm({ ...deviceForm, tunnelIp: event.target.value })} placeholder="Leave blank for dynamic" /></label>
          </fieldset>
          <footer><p>A unique VPN identity is generated from the site and controller names.</p><button type="submit" disabled={!canManageSelectedSite || !storageReady || Boolean(saving) || !editableSites.length}>{saving === 'device' ? <LoaderCircle className="is-spinning" size={15} /> : <Plus size={15} />} Add PLC</button></footer>
        </form>
      </div>

      <section className="panel provisioning-inventory">
        <header className="provisioning-inventory__heading">
          <div><p className="eyebrow">Field inventory</p><h2>Sites, PLCs, and VPN identities</h2></div>
          <span className={vpnConfigured ? 'is-ready' : 'is-pending'}><ShieldCheck size={14} /> {vpnConfigured ? 'Profile generator connected' : 'Profile generator pending'}</span>
        </header>
        <div className="provisioning-site-list">
          {initialSites.map((site) => (
            <article className="provisioning-site" key={site.id}>
              <header><div><strong>{site.name}</strong><p>{address(site)}</p></div><span>{site.devices.length} PLC{site.devices.length === 1 ? '' : 's'}</span></header>
              <div className="provisioning-device-list">
                {site.devices.map((device) => {
                  const managed = Boolean(device.vpnIdentity);
                  const issuing = generatingId === device.id;
                  const issued = device.vpnProfileStatus === 'issued';
                  const external = device.vpnProfileStatus === 'external';
                  const issuanceLocked = device.vpnProfileStatus === 'issuing';
                  const credentialRecorded = issued || external || issuanceLocked;
                  const registering = registeringId === device.id;
                  const canIssueForSite = roleByOrganization.get(site.organizationId) === 'owner';
                  return (
                    <div className="provisioning-device-row" key={device.id}>
                      <span className="provisioning-device-icon"><HardDrive size={17} /></span>
                      <div className="provisioning-device-name"><strong>{device.name}</strong><small>{device.plcModel}</small></div>
                      <div><span>VPN identity</span><code>{device.vpnIdentity || 'Not assigned'}</code></div>
                      <div><span>Tunnel IP</span><strong>{device.tunnelIp || (managed ? 'Dynamic' : 'Not assigned')}</strong></div>
                      <span className={`provisioning-profile-status is-${device.vpnProfileStatus}`}>{profileStatusLabel(device.vpnProfileStatus)}</span>
                      <div className="provisioning-device-actions">
                        <button
                          type="button"
                          onClick={() => managed && generateProfile(device.id, device.vpnIdentity as string, site.organizationId)}
                          disabled={!managed || credentialRecorded || !canIssueForSite || !vpnConfigured || Boolean(generatingId) || Boolean(registeringId)}
                          title={!canIssueForSite ? 'Owner role required for this organization' : credentialRecorded ? 'This PLC already has a recorded VPN credential' : !vpnConfigured ? 'Connect the OpenVPN provisioning bridge first' : !managed ? 'No managed VPN identity is assigned' : 'Generate a new unique profile'}
                        >
                          {issuing || issuanceLocked ? <LoaderCircle className="is-spinning" size={14} /> : credentialRecorded ? <Check size={14} /> : <Download size={14} />} {issuanceLocked ? 'Inspection required' : credentialRecorded ? 'Profile recorded' : 'Generate .ovpn'}
                        </button>
                        <button
                          className="is-secondary"
                          type="button"
                          onClick={() => registerExternalProfile(device.id, device.vpnIdentity, site.organizationId)}
                          disabled={credentialRecorded || !canIssueForSite || Boolean(generatingId) || Boolean(registeringId)}
                          title={!canIssueForSite ? 'Owner role required for this organization' : credentialRecorded ? 'This PLC already has a recorded VPN credential' : 'Record a profile that was issued directly on OpenVPN without generating another one'}
                        >
                          {registering ? <LoaderCircle className="is-spinning" size={14} /> : <Link2 size={14} />} Register existing
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!site.devices.length ? <p className="provisioning-empty">No PLCs registered at this site yet.</p> : null}
              </div>
            </article>
          ))}
          {!initialSites.length ? <p className="provisioning-empty">Add the first site to begin provisioning controllers.</p> : null}
        </div>
      </section>
    </>
  );
}
