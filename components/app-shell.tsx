import Link from 'next/link';
import type { ReactNode } from 'react';
import type { AppUser } from '@/types/domain';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sites', label: 'Sites' },
  { href: '/ingest-test', label: 'Ingest Test' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/admin/users', label: 'Users' },
  { href: '/audit-log', label: 'Audit Log' }
];

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">PermaCool Ops</p>
          <h1 className="sidebar-title">Remote monitoring console</h1>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <span>{user.email}</span>
        </div>
      </aside>

      <div className="app-content">{children}</div>
    </div>
  );
}
