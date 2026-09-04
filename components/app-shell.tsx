'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  ChevronRight,
  CreditCard,
  Headphones,
  LayoutDashboard,
  MapPinned,
  RadioTower,
  ScrollText,
  Search,
  ServerCog,
  ShieldCheck,
  Users,
  Wifi,
  Workflow
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  canAccessProvisioning,
  canManageLogicDefinitions,
  isPlatformStaff
} from '@/lib/workspace-access';
import type { AppUser } from '@/types/domain';
import { ActiveSiteContext } from './active-site-context';
import type { ActiveSiteContextValue } from './active-site-context';
import { ConnectionHealthContext, type ConnectionHealthSnapshot } from './connection-health-context';
import { ConnectionHealthNav } from './connection-health-nav';

type NavItem = { href: string; label: string; icon: LucideIcon; matches?: string[] };

const sharedNavItems: NavItem[] = [
  { href: '/dashboard', label: 'SOUL Matrix', icon: LayoutDashboard },
  { href: '/sites', label: 'Sites', icon: MapPinned, matches: ['/sites', '/devices'] },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/support', label: 'Support', icon: Headphones },
  { href: '/documents', label: 'Documents', icon: BookOpen },
  { href: '/billing', label: 'Billing', icon: CreditCard }
];

const provisioningNavItem: NavItem = {
  href: '/provisioning',
  label: 'Provisioning',
  icon: ServerCog
};

const logicNavItem: NavItem = {
  href: '/logic',
  label: 'Logic',
  icon: Workflow
};

const staffNavItemsBeforeLogic: NavItem[] = [
  { href: '/ingest-test', label: 'Telemetry', icon: RadioTower },
];

const staffNavItemsAfterLogic: NavItem[] = [
  { href: '/audit-log', label: 'Audit log', icon: ScrollText }
];

const adminNavItems: NavItem[] = [
  { href: '/admin/users', label: 'Team', icon: Users },
  { href: '/admin/portal', label: 'Portal admin', icon: ShieldCheck }
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'PC';
}

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const [activeSite, setActiveSite] = useState<ActiveSiteContextValue | null>(null);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealthSnapshot | null>(null);
  const sitePathMatch = pathname.match(/^\/sites\/([^/]+)/);
  const activeSiteId = sitePathMatch ? decodeURIComponent(sitePathMatch[1]) : null;
  const visibleSite = activeSite?.siteId === activeSiteId ? activeSite : null;
  const isStaff = isPlatformStaff(user);
  const navItems = [
    ...sharedNavItems.map((item) =>
      user.platformRole === 'customer' && item.href === '/dashboard'
        ? { ...item, label: 'Overview' }
        : user.platformRole === 'customer' && item.href === '/sites'
          ? { ...item, label: 'My Equipment' }
          : item
    ),
    ...(canAccessProvisioning(user) ? [provisioningNavItem] : []),
    ...(isStaff ? staffNavItemsBeforeLogic : []),
    ...(canManageLogicDefinitions(user) ? [logicNavItem] : []),
    ...(isStaff ? staffNavItemsAfterLogic : []),
    ...(user.platformRole === 'staff_admin' ? adminNavItems : [])
  ];

  return (
    <ActiveSiteContext.Provider value={setActiveSite}>
    <ConnectionHealthContext.Provider value={setConnectionHealth}>
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand" aria-label="Agenticly.Cool home">
          <span className="sidebar-brand-logo">
            <Image
              src="/images/brand/agenticly-cool-logo-3d-v2.png"
              alt="Agenticly.Cool"
              width={160}
              height={160}
              priority
              sizes="160px"
            />
          </span>
        </Link>

        <nav className="nav-list" aria-label="Operations navigation">
          <p className="nav-section-label">Workspace</p>
          {navItems.map((item) => {
            const active = (item.matches ?? [item.href]).some(
              (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
            );
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className={`nav-link${active ? ' is-active' : ''}`}>
                <Icon size={17} strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
                {active ? <ChevronRight className="nav-link-arrow" size={14} aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-network-card">
            <div>
              <span className="network-pulse" aria-hidden="true" />
              <strong>Telemetry network</strong>
            </div>
            <p><Wifi size={13} aria-hidden="true" /> Secure monitoring enabled</p>
          </div>

          <div className="sidebar-user">
            <span className="user-avatar" aria-hidden="true">{initials(user.name)}</span>
            <span className="sidebar-user-copy">
              <strong>{user.name}</strong>
              <small>{user.platformRole === 'customer' ? user.role : user.platformRole}</small>
            </span>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          {visibleSite ? (
            <Link className="ops-active-site" href={`/sites/${visibleSite.siteId}`} aria-label={`Current lab: ${visibleSite.siteName}`}>
              <MapPinned size={17} aria-hidden="true" />
              <span>
                <small>Current lab</small>
                <strong>{visibleSite.siteName}</strong>
              </span>
            </Link>
          ) : (
            <div className="ops-search-hint">
              <Search size={16} aria-hidden="true" />
              <span>Sites, controllers and telemetry</span>
            </div>
          )}
          {activeSiteId === 'site-cannon-falls' && connectionHealth?.siteId === activeSiteId ? <ConnectionHealthNav stages={connectionHealth.stages} /> : null}
          <div className={`ops-topbar-status${activeSiteId === 'site-cannon-falls' && connectionHealth?.siteId === activeSiteId ? ' has-connection-health' : ''}`}>
            <span className="ops-environment"><ShieldCheck size={15} aria-hidden="true" /> Secure operations</span>
            <span className="ops-activity"><Activity size={15} aria-hidden="true" /> Live monitoring</span>
            <span className="user-avatar user-avatar--small" aria-label={user.name}>{initials(user.name)}</span>
          </div>
        </header>

        <div className="app-content">{children}</div>
      </div>
    </div>
    </ConnectionHealthContext.Provider>
    </ActiveSiteContext.Provider>
  );
}
