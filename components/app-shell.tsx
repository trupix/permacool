'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Snowflake,
  Users,
  Wifi,
  Workflow
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppUser } from '@/types/domain';

type NavItem = { href: string; label: string; icon: LucideIcon; matches?: string[] };

const sharedNavItems: NavItem[] = [
  { href: '/dashboard', label: 'SOUL Matrix', icon: LayoutDashboard },
  { href: '/sites', label: 'Sites', icon: MapPinned, matches: ['/sites', '/devices'] },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/support', label: 'Support', icon: Headphones },
  { href: '/documents', label: 'Documents', icon: BookOpen },
  { href: '/billing', label: 'Billing', icon: CreditCard }
];

const staffNavItems: NavItem[] = [
  { href: '/provisioning', label: 'Provisioning', icon: ServerCog },
  { href: '/ingest-test', label: 'Telemetry', icon: RadioTower },
  { href: '/logic', label: 'Logic', icon: Workflow },
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
  const pathname = usePathname();
  const isStaff = user.platformRole === 'staff_admin' || user.platformRole === 'staff_support';
  const navItems = [
    ...sharedNavItems.map((item) =>
      user.platformRole === 'customer' && item.href === '/dashboard'
        ? { ...item, label: 'Overview' }
        : user.platformRole === 'customer' && item.href === '/sites'
          ? { ...item, label: 'My Equipment' }
          : item
    ),
    ...(isStaff ? staffNavItems : []),
    ...(user.platformRole === 'staff_admin' ? adminNavItems : [])
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand" aria-label="Agenticly.Cool home">
          <span className="sidebar-brand-mark" aria-hidden="true">
            <Snowflake size={19} strokeWidth={2.4} />
          </span>
          <span>
            <strong>Agenticly.Cool</strong>
            <small>Control</small>
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
          <div className="ops-search-hint">
            <Search size={16} aria-hidden="true" />
            <span>Sites, controllers and telemetry</span>
          </div>
          <div className="ops-topbar-status">
            <span className="ops-environment"><ShieldCheck size={15} aria-hidden="true" /> Secure operations</span>
            <span className="ops-activity"><Activity size={15} aria-hidden="true" /> Live monitoring</span>
            <span className="user-avatar user-avatar--small" aria-label={user.name}>{initials(user.name)}</span>
          </div>
        </header>

        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
