import Link from 'next/link';
import { Activity, FileText, LayoutDashboard } from 'lucide-react';

type SiteSection = 'overview' | 'specs' | 'events';

const sections = [
  { id: 'overview' as const, label: 'Overview', suffix: '', icon: LayoutDashboard },
  { id: 'specs' as const, label: 'Location Specs', suffix: '/specs', icon: FileText },
  { id: 'events' as const, label: 'Events', suffix: '/events', icon: Activity }
];

export function SiteSectionNav({
  siteId,
  siteName,
  active
}: {
  siteId: string;
  siteName: string;
  active: SiteSection;
}) {
  return (
    <nav className="site-section-nav" aria-label={`${siteName} pages`}>
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = section.id === active;

        return (
          <Link
            key={section.id}
            href={`/sites/${siteId}${section.suffix}`}
            className={isActive ? 'is-active' : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
