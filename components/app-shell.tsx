'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Activity,
  Bell,
  ChevronRight,
  LayoutDashboard,
  MapPinned,
  RadioTower,
  ScrollText,
  Search,
  ShieldCheck,
  Snowflake,
  Users,
  Wifi,
  Workflow
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppUser } from '@/types/domain';

const navItems: Array<{ href: string; label: string; icon: LucideIcon; matches?: string[] }> = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/sites', label: 'Sites', icon: MapPinned, matches: ['/sites', '/devices'] },
  { href: '/ingest-test', label: 'Telemetry', icon: RadioTower },
  { href: '/logic', label: 'Logic', icon: Workflow },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/admin/users', label: 'Team', icon: Users },
  { href: '/audit-log', label: 'Audit log', icon: ScrollText }
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand" aria-label="PermaCool operations home">
          <span className="sidebar-brand-mark" aria-hidden="true">
            <Snowflake size={19} strokeWidth={2.4} />
          </span>
          <span>
            <strong>PermaCool</strong>
            <small>Field operations</small>
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
              <small>{user.role}</small>
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
